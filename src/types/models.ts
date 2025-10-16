export type UserRole = 'admin' | 'staff';

export interface User {
  id?: number;
  username: string;
  role: UserRole;
  passwordHash?: string;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
}

export interface Product {
  id?: number;
  sku: string;
  name: string;
  description?: string;
  category?: string;
  barcode?: string;
  minStockLevel?: number;
  reorderQuantity?: number;
  unitCost?: number;
  unitPrice?: number;
  currentStock: number;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
  syncVersion?: number;
}

export type AdjustmentType = 'in' | 'out' | 'sale' | 'purchase' | 'adjustment' | 'return';

export interface StockAdjustment {
  id?: number;
  productId: number;
  type: AdjustmentType;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason?: string;
  reference?: string;
  userId?: number;
  createdAt: number;
  syncVersion?: number;
}

export interface Transaction {
  id?: number;
  type: 'sale' | 'purchase' | 'adjustment';
  items: TransactionItem[];
  total: number;
  notes?: string;
  userId?: number;
  createdAt: number;
  completedAt?: number;
  syncVersion?: number;
}

export interface TransactionItem {
  productId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface SyncMetadata {
  id?: number;
  entityType: 'product' | 'transaction' | 'adjustment' | 'user';
  entityId: number;
  localVersion: number;
  serverVersion?: number;
  lastSyncedAt?: number;
  pendingSync: boolean;
  conflictData?: string;
}

export interface AuditLog {
  id?: number;
  entityType: string;
  entityId: number;
  action: 'create' | 'update' | 'delete';
  userId?: number;
  changes?: string;
  timestamp: number;
}
