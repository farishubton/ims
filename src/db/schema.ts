import Dexie, { type EntityTable } from 'dexie';
import type {
  User,
  Product,
  StockAdjustment,
  Transaction,
  SyncMetadata,
  AuditLog,
} from '@/types/models';

export class IMSDatabase extends Dexie {
  users!: EntityTable<User, 'id'>;
  products!: EntityTable<Product, 'id'>;
  stockAdjustments!: EntityTable<StockAdjustment, 'id'>;
  transactions!: EntityTable<Transaction, 'id'>;
  syncMetadata!: EntityTable<SyncMetadata, 'id'>;
  auditLogs!: EntityTable<AuditLog, 'id'>;

  constructor() {
    super('OfflineIMS');
    this.version(1).stores({
      users: '++id, username, role, deletedAt',
      products: '++id, sku, barcode, name, category, deletedAt, [deletedAt+sku]',
      stockAdjustments: '++id, productId, type, createdAt',
      transactions: '++id, type, createdAt, completedAt',
      syncMetadata: '++id, [entityType+entityId], pendingSync, lastSyncedAt',
      auditLogs: '++id, entityType, entityId, timestamp',
    });
  }
}

export const db = new IMSDatabase();

export async function seedInitialData() {
  const userCount = await db.users.count();
  if (userCount === 0) {
    await db.users.add({
      username: 'admin',
      role: 'admin',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }
}
