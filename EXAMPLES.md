# Usage Examples

## End-to-End Flow Examples

### Example 1: Add Product Offline, Sync Later

```typescript
// 1. User adds a product (offline)
import { useProductActions } from '@/hooks/useProducts';

const { addProduct } = useProductActions();

const productId = await addProduct({
  sku: 'LAPTOP-001',
  name: 'ThinkPad X1 Carbon',
  barcode: '0123456789012',
  category: 'Electronics',
  currentStock: 25,
  minStockLevel: 5,
  reorderQuantity: 10,
  unitCost: 850.00,
  unitPrice: 1299.99,
});

// 2. Product is marked for sync in syncMetadata
// 3. When online, sync to server
import { initSync } from '@/db/sync';

const syncAdapter = await initSync({
  serverUrl: 'https://api.example.com',
  apiKey: process.env.VITE_API_KEY,
});

const result = await syncAdapter.sync();
console.log('Synced:', result.pushed, 'products');
```

### Example 2: Record a Sale (Decrement Stock)

```typescript
import { useTransactionActions } from '@/hooks/useTransactions';
import { useProducts } from '@/hooks/useProducts';

const { createSale } = useTransactionActions();
const { products } = useProducts();

// Customer buys 2 laptops and 1 mouse
const transactionId = await createSale([
  { productId: products[0]!.id!, quantity: 2, unitPrice: 1299.99 },
  { productId: products[1]!.id!, quantity: 1, unitPrice: 29.99 },
]);

// Result:
// - Transaction created with total: $2629.97
// - Stock decremented automatically:
//   - Laptop: 25 → 23
//   - Mouse: 50 → 49
// - Stock adjustments recorded
// - Audit log entries created
// - All entities marked for sync
```

### Example 3: Offline Conflict Resolution

```typescript
// Scenario: User A and User B edit the same product offline

// User A (Device 1) - Offline
await updateProduct(123, { currentStock: 15, updatedAt: 1000 });

// User B (Device 2) - Offline
await updateProduct(123, { currentStock: 18, updatedAt: 1100 });

// Both sync when online
// Server has version with updatedAt: 950

// Sync process (last-write-wins):
// 1. User A pushes → Server accepts (1000 > 950)
// 2. User B pushes → Server accepts (1100 > 1000)
// 3. User A pulls → Gets User B's version (1100 > 1000)
// 4. Result: currentStock = 18 on all devices

// Alternative: Server-wins strategy
const syncAdapter = new SyncAdapter(config);
syncAdapter.conflictStrategy = 'server-wins';
// Server version always takes precedence
```

### Example 4: Barcode Scanning Flow

```typescript
// 1. User scans barcode
<BarcodeScanner
  onScan={async (barcode) => {
    // 2. Search for product
    const results = await searchProducts(barcode);
    
    if (results.length > 0) {
      // 3a. Product found - show details or quick-adjust stock
      const product = results[0];
      setScannedProduct(product);
    } else {
      // 3b. Not found - prompt to create new product
      setCreatingProduct({ barcode });
    }
  }}
/>

// 4. Quick stock adjustment from scan
<StockAdjustmentDialog
  productId={scannedProduct.id}
  onClose={() => setScannedProduct(null)}
/>
```

### Example 5: Import from CSV

```typescript
import { db } from '@/db/schema';
import { addProduct } from '@/db/operations';

async function importProductsFromCSV(file: File) {
  const text = await file.text();
  const rows = text.split('\n').slice(1); // Skip header
  
  const results = { success: 0, errors: [] as string[] };
  
  for (const row of rows) {
    const [sku, name, barcode, category, stock, price] = row.split(',');
    
    try {
      await addProduct({
        sku: sku.trim(),
        name: name.trim(),
        barcode: barcode.trim(),
        category: category.trim(),
        currentStock: parseInt(stock),
        unitPrice: parseFloat(price),
      });
      results.success++;
    } catch (error) {
      results.errors.push(`Failed to import ${sku}: ${error.message}`);
    }
  }
  
  return results;
}

// Usage
const fileInput = document.getElementById('csv-upload') as HTMLInputElement;
const results = await importProductsFromCSV(fileInput.files[0]!);
console.log(`Imported ${results.success} products, ${results.errors.length} errors`);
```

### Example 6: Export to CSV

```typescript
import { exportToCSV } from '@/lib/utils';
import { useProducts } from '@/hooks/useProducts';

function ExportButton() {
  const { products } = useProducts();
  
  const handleExport = () => {
    // Transform to CSV-friendly format
    const data = products.map(p => ({
      SKU: p.sku,
      Name: p.name,
      Category: p.category || '',
      'Current Stock': p.currentStock,
      'Min Stock': p.minStockLevel || 0,
      'Unit Cost': p.unitCost || 0,
      'Unit Price': p.unitPrice || 0,
      Barcode: p.barcode || '',
    }));
    
    exportToCSV(data, 'inventory');
  };
  
  return <Button onClick={handleExport}>Export CSV</Button>;
}
```

### Example 7: Multi-Device Sync Scenario

```typescript
// Device A (Store 1) - 9:00 AM
await addProduct({ sku: 'NEW-001', name: 'New Product', currentStock: 100 });
await syncAdapter.sync(); // Push to server

// Device B (Store 2) - 9:05 AM
await syncAdapter.sync(); // Pull from server
// Device B now has NEW-001

// Device B - 9:10 AM
await adjustStock(productId, 10, 'sale'); // Stock: 100 → 90
await syncAdapter.sync(); // Push to server

// Device A - 9:15 AM
await syncAdapter.sync(); // Pull from server
// Device A sees stock: 90

// Result: Both devices synchronized
```

### Example 8: Low Stock Alert Flow

```typescript
import { useLowStockProducts } from '@/hooks/useProducts';

function LowStockAlert() {
  const { products } = useLowStockProducts();
  
  if (products.length === 0) return null;
  
  return (
    <Alert variant="warning">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Low Stock Warning</AlertTitle>
      <AlertDescription>
        {products.length} product(s) below minimum stock level:
        <ul className="mt-2">
          {products.map(p => (
            <li key={p.id}>
              {p.name}: {p.currentStock} / {p.minStockLevel} 
              (Reorder: {p.reorderQuantity})
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
```

### Example 9: Audit Trail Query

```typescript
import { useAuditLog } from '@/hooks/useAuditLog';

// View all changes to a specific product
function ProductHistory({ productId }: { productId: number }) {
  const { logs } = useAuditLog('product', productId);
  
  return (
    <div>
      <h3>Change History</h3>
      {logs.map(log => (
        <div key={log.id}>
          {formatDate(log.timestamp)} - {log.action.toUpperCase()}
          {log.changes && <pre>{log.changes}</pre>}
        </div>
      ))}
    </div>
  );
}

// View recent stock adjustments
function RecentAdjustments() {
  const { adjustments } = useStockAdjustments();
  
  return (
    <Table>
      <TableBody>
        {adjustments.map(adj => (
          <TableRow key={adj.id}>
            <TableCell>{formatDate(adj.createdAt)}</TableCell>
            <TableCell>{adj.type}</TableCell>
            <TableCell>{adj.quantity}</TableCell>
            <TableCell>{adj.previousStock} → {adj.newStock}</TableCell>
            <TableCell>{adj.reason}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

### Example 10: Background Sync (PWA)

```typescript
// Register background sync when offline
if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
  navigator.serviceWorker.ready.then(registration => {
    // Queue sync when back online
    registration.sync.register('sync-data');
  });
}

// Service worker (public/sw.js)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(
      fetch('/api/sync/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ /* pending changes */ })
      })
    );
  }
});
```

## Testing Examples

### Test: Product CRUD

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/db/schema';
import { addProduct, updateProduct, deleteProduct } from '@/db/operations';

describe('Product CRUD', () => {
  beforeEach(async () => {
    await db.products.clear();
  });

  it('should create, read, update, and delete a product', async () => {
    // Create
    const id = await addProduct({
      sku: 'TEST-001',
      name: 'Test Product',
      currentStock: 10,
    });
    expect(id).toBeDefined();

    // Read
    const product = await db.products.get(id);
    expect(product?.name).toBe('Test Product');

    // Update
    await updateProduct(id, { name: 'Updated Product' });
    const updated = await db.products.get(id);
    expect(updated?.name).toBe('Updated Product');

    // Delete (soft)
    await deleteProduct(id);
    const deleted = await db.products.get(id);
    expect(deleted?.deletedAt).toBeDefined();
  });
});
```

### Test: Transaction Atomicity

```typescript
it('should rollback transaction on error', async () => {
  const productId = await addProduct({
    sku: 'ATOMIC-001',
    name: 'Atomic Product',
    currentStock: 5,
  });

  // Attempt to sell more than available
  await expect(
    createSaleTransaction([
      { productId, quantity: 10, unitPrice: 10.0 }
    ])
  ).rejects.toThrow('Insufficient stock');

  // Stock should be unchanged
  const product = await db.products.get(productId);
  expect(product?.currentStock).toBe(5);

  // No transaction should be created
  const txCount = await db.transactions.count();
  expect(txCount).toBe(0);
});
```

## Server API Examples (Reference)

### POST /api/sync/push

```json
{
  "products": [
    {
      "id": 123,
      "sku": "LAPTOP-001",
      "name": "ThinkPad X1",
      "currentStock": 25,
      "syncVersion": 3,
      "updatedAt": 1697654400000
    }
  ],
  "transactions": [...],
  "adjustments": [...]
}
```

Response:
```json
{
  "success": true,
  "versions": {
    "product-123": 4,
    "transaction-456": 1
  }
}
```

### POST /api/sync/pull

```json
{
  "since": 1697654400000
}
```

Response:
```json
{
  "products": [...],
  "transactions": [...],
  "adjustments": [...],
  "serverTime": 1697658000000
}
```
