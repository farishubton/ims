import { db } from './schema';
import type { Product, Transaction, StockAdjustment } from '@/types/models';

export interface SyncConfig {
  serverUrl: string;
  apiKey?: string;
  batchSize?: number;
}

export type ConflictResolution = 'server-wins' | 'client-wins' | 'last-write-wins' | 'manual';

export interface SyncResult {
  pulled: number;
  pushed: number;
  conflicts: number;
  errors: string[];
}

export class SyncAdapter {
  private config: SyncConfig;
  private conflictStrategy: ConflictResolution = 'last-write-wins';

  constructor(config: SyncConfig) {
    this.config = config;
  }

  async sync(): Promise<SyncResult> {
    const result: SyncResult = {
      pulled: 0,
      pushed: 0,
      conflicts: 0,
      errors: [],
    };

    try {
      const pullResult = await this.pullFromServer();
      result.pulled = pullResult.count;
      result.conflicts += pullResult.conflicts;

      const pushResult = await this.pushToServer();
      result.pushed = pushResult.count;
      result.conflicts += pushResult.conflicts;
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
    }

    return result;
  }

  private async pullFromServer() {
    const lastSyncTime = await this.getLastSyncTime();
    
    try {
      const response = await fetch(`${this.config.serverUrl}/api/sync/pull`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { Authorization: `Bearer ${this.config.apiKey}` }),
        },
        body: JSON.stringify({ since: lastSyncTime }),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data = await response.json();
      let conflicts = 0;

      await db.transaction('rw', [db.products, db.transactions, db.stockAdjustments, db.syncMetadata], async () => {
        for (const product of data.products || []) {
          const conflict = await this.mergeProduct(product);
          if (conflict) conflicts++;
        }

        for (const transaction of data.transactions || []) {
          await this.mergeTransaction(transaction);
        }

        for (const adjustment of data.adjustments || []) {
          await this.mergeAdjustment(adjustment);
        }
      });

      await this.setLastSyncTime(Date.now());

      return { count: (data.products?.length || 0) + (data.transactions?.length || 0) + (data.adjustments?.length || 0), conflicts };
    } catch (error) {
      console.error('Pull failed:', error);
      return { count: 0, conflicts: 0 };
    }
  }

  private async pushToServer() {
    const pendingItems = await db.syncMetadata.where('pendingSync').equals(1).toArray();
    
    const payload = {
      products: [] as Product[],
      transactions: [] as Transaction[],
      adjustments: [] as StockAdjustment[],
    };

    for (const meta of pendingItems) {
      try {
        if (meta.entityType === 'product') {
          const product = await db.products.get(meta.entityId);
          if (product) payload.products.push(product);
        } else if (meta.entityType === 'transaction') {
          const transaction = await db.transactions.get(meta.entityId);
          if (transaction) payload.transactions.push(transaction);
        } else if (meta.entityType === 'adjustment') {
          const adjustment = await db.stockAdjustments.get(meta.entityId);
          if (adjustment) payload.adjustments.push(adjustment);
        }
      } catch (error) {
        console.error(`Failed to fetch ${meta.entityType} ${meta.entityId}:`, error);
      }
    }

    if (payload.products.length === 0 && payload.transactions.length === 0 && payload.adjustments.length === 0) {
      return { count: 0, conflicts: 0 };
    }

    try {
      const response = await fetch(`${this.config.serverUrl}/api/sync/push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { Authorization: `Bearer ${this.config.apiKey}` }),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const result = await response.json();

      for (const meta of pendingItems) {
        await db.syncMetadata.update(meta.id!, {
          pendingSync: false,
          lastSyncedAt: Date.now(),
          serverVersion: result.versions?.[`${meta.entityType}-${meta.entityId}`],
        });
      }

      return { count: pendingItems.length, conflicts: 0 };
    } catch (error) {
      console.error('Push failed:', error);
      return { count: 0, conflicts: 0 };
    }
  }

  private async mergeProduct(serverProduct: Product): Promise<boolean> {
    const localProduct = await db.products.get(serverProduct.id!);
    
    if (!localProduct) {
      await db.products.add(serverProduct);
      return false;
    }

    const localMeta = await db.syncMetadata
      .where(['entityType', 'entityId'])
      .equals(['product', serverProduct.id!])
      .first();

    if (localMeta?.pendingSync) {
      if (this.conflictStrategy === 'last-write-wins') {
        if (serverProduct.updatedAt > localProduct.updatedAt) {
          await db.products.put(serverProduct);
          await db.syncMetadata.update(localMeta.id!, { pendingSync: false });
          return false;
        }
        return true;
      } else if (this.conflictStrategy === 'server-wins') {
        await db.products.put(serverProduct);
        await db.syncMetadata.update(localMeta.id!, { pendingSync: false });
        return false;
      } else if (this.conflictStrategy === 'client-wins') {
        return true;
      } else {
        await db.syncMetadata.update(localMeta.id!, {
          conflictData: JSON.stringify({ local: localProduct, server: serverProduct }),
        });
        return true;
      }
    }

    await db.products.put(serverProduct);
    return false;
  }

  private async mergeTransaction(serverTransaction: Transaction) {
    const exists = await db.transactions.get(serverTransaction.id!);
    if (!exists) {
      await db.transactions.add(serverTransaction);
    }
  }

  private async mergeAdjustment(serverAdjustment: StockAdjustment) {
    const exists = await db.stockAdjustments.get(serverAdjustment.id!);
    if (!exists) {
      await db.stockAdjustments.add(serverAdjustment);
    }
  }

  private async getLastSyncTime(): Promise<number> {
    const metadata = await db.syncMetadata
      .orderBy('lastSyncedAt')
      .reverse()
      .first();
    return metadata?.lastSyncedAt || 0;
  }

  private async setLastSyncTime(time: number) {
    await db.syncMetadata.add({
      entityType: 'product',
      entityId: 0,
      localVersion: 0,
      pendingSync: false,
      lastSyncedAt: time,
    });
  }
}

export async function initSync(config: SyncConfig) {
  const adapter = new SyncAdapter(config);
  
  if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
    const registration = await navigator.serviceWorker.ready;
    await registration.sync.register('sync-data');
  }

  return adapter;
}
