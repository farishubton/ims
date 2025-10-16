import { db } from './schema';
import type { Product, AdjustmentType } from '@/types/models';

export async function addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) {
  const now = Date.now();
  const id = await db.products.add({
    ...product,
    createdAt: now,
    updatedAt: now,
    syncVersion: 1,
  });

  await db.auditLogs.add({
    entityType: 'product',
    entityId: id,
    action: 'create',
    timestamp: now,
  });

  await markForSync('product', id);
  return id;
}

export async function updateProduct(id: number, updates: Partial<Product>) {
  const product = await db.products.get(id);
  if (!product) throw new Error('Product not found');

  const now = Date.now();
  await db.products.update(id, {
    ...updates,
    updatedAt: now,
    syncVersion: (product.syncVersion || 0) + 1,
  });

  await db.auditLogs.add({
    entityType: 'product',
    entityId: id,
    action: 'update',
    changes: JSON.stringify(updates),
    timestamp: now,
  });

  await markForSync('product', id);
}

export async function deleteProduct(id: number, soft = true) {
  if (soft) {
    await updateProduct(id, { deletedAt: Date.now() });
  } else {
    await db.products.delete(id);
  }
}

export async function adjustStock(
  productId: number,
  quantity: number,
  type: AdjustmentType,
  reason?: string,
  reference?: string
) {
  return await db.transaction('rw', [db.products, db.stockAdjustments, db.auditLogs, db.syncMetadata], async () => {
    const product = await db.products.get(productId);
    if (!product) throw new Error('Product not found');

    const previousStock = product.currentStock;
    const delta = type === 'in' || type === 'purchase' || type === 'return' ? quantity : -quantity;
    const newStock = Math.max(0, previousStock + delta);

    await db.products.update(productId, {
      currentStock: newStock,
      updatedAt: Date.now(),
      syncVersion: (product.syncVersion || 0) + 1,
    });

    const adjustmentId = await db.stockAdjustments.add({
      productId,
      type,
      quantity: Math.abs(delta),
      previousStock,
      newStock,
      reason,
      reference,
      createdAt: Date.now(),
      syncVersion: 1,
    });

    await db.auditLogs.add({
      entityType: 'adjustment',
      entityId: adjustmentId,
      action: 'create',
      timestamp: Date.now(),
    });

    await markForSync('adjustment', adjustmentId);
    await markForSync('product', productId);

    return { adjustmentId, newStock };
  });
}

export async function createSaleTransaction(items: Array<{ productId: number; quantity: number; unitPrice: number }>) {
  return await db.transaction('rw', [db.products, db.transactions, db.stockAdjustments, db.syncMetadata, db.auditLogs], async () => {
    const now = Date.now();
    const transactionItems = [];
    let total = 0;

    for (const item of items) {
      const product = await db.products.get(item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);
      if (product.currentStock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }

      const subtotal = item.quantity * item.unitPrice;
      total += subtotal;
      transactionItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal,
      });

      await adjustStock(item.productId, item.quantity, 'sale', 'Sale transaction');
    }

    const transactionId = await db.transactions.add({
      type: 'sale',
      items: transactionItems,
      total,
      createdAt: now,
      completedAt: now,
      syncVersion: 1,
    });

    await db.auditLogs.add({
      entityType: 'transaction',
      entityId: transactionId,
      action: 'create',
      timestamp: now,
    });

    await markForSync('transaction', transactionId);

    return transactionId;
  });
}

export async function markForSync(entityType: 'product' | 'transaction' | 'adjustment' | 'user', entityId: number) {
  const existing = await db.syncMetadata
    .where(['entityType', 'entityId'])
    .equals([entityType, entityId])
    .first();

  if (existing) {
    await db.syncMetadata.update(existing.id!, {
      pendingSync: true,
      localVersion: (existing.localVersion || 0) + 1,
    });
  } else {
    await db.syncMetadata.add({
      entityType,
      entityId,
      localVersion: 1,
      pendingSync: true,
    });
  }
}

export async function getPendingSyncItems() {
  return await db.syncMetadata.where('pendingSync').equals(1).toArray();
}

export async function searchProducts(query: string) {
  const lowerQuery = query.toLowerCase();
  return await db.products
    .filter((product) => {
      if (product.deletedAt) return false;
      return (
        product.name.toLowerCase().includes(lowerQuery) ||
        product.sku.toLowerCase().includes(lowerQuery) ||
        (product.barcode && product.barcode.toLowerCase().includes(lowerQuery)) ||
        (product.category && product.category.toLowerCase().includes(lowerQuery))
      );
    })
    .toArray();
}
