# Architecture Documentation

## System Overview

Offline IMS is an offline-first inventory management system built with React, IndexedDB (via Dexie), and a modern component architecture using shadcn/ui.

## Architecture Principles

1. **Offline-First**: All operations work without network connectivity
2. **Local-First**: Data lives in IndexedDB and syncs optionally
3. **Type-Safe**: Full TypeScript coverage
4. **Component-Based**: Modular, reusable UI components
5. **Performance**: Optimized with live queries and indexes

## Data Flow

```
User Action → Component → Hook → Dexie Operation → IndexedDB
                ↓                      ↓
            Live Query ← Dexie Watch ← IndexedDB Change
                ↓
            Re-render
```

## Database Design

### Schema Version Management

Dexie handles schema migrations automatically. Current version: 1

```typescript
this.version(1).stores({
  users: '++id, username, role, deletedAt',
  products: '++id, sku, barcode, name, category, deletedAt, [deletedAt+sku]',
  stockAdjustments: '++id, productId, type, createdAt',
  transactions: '++id, type, createdAt, completedAt',
  syncMetadata: '++id, [entityType+entityId], pendingSync, lastSyncedAt',
  auditLogs: '++id, entityType, entityId, timestamp',
});
```

### Index Strategy

- **Primary keys**: Auto-incrementing IDs (`++id`)
- **Single indexes**: Fast lookups (e.g., `sku`, `barcode`)
- **Compound indexes**: Complex queries (e.g., `[deletedAt+sku]`, `[entityType+entityId]`)

### Soft Deletes

Products use soft deletes via `deletedAt` timestamp:
- Keeps data integrity for historical transactions
- Allows undelete functionality
- Excludes from default queries

## Component Architecture

### Presentation Layer

```
App (Router)
├── Navigation
└── Pages
    ├── HomePage (Dashboard)
    ├── ProductsPage
    │   └── ProductList
    │       ├── ProductEditor (Dialog)
    │       └── StockAdjustmentDialog
    ├── ScanPage
    │   └── BarcodeScanner
    └── AuditPage
        └── AuditLog
```

### Data Layer

```
Hooks (useLiveQuery)
├── useProducts
├── useTransactions
├── useStockAdjustments
└── useAuditLog
       ↓
Operations Layer
├── addProduct
├── adjustStock
├── createSaleTransaction
└── searchProducts
       ↓
Dexie Layer
└── db.products, db.transactions, etc.
```

## State Management

- **No global state library** - Dexie's live queries replace Redux/Zustand for data
- **Local component state** - useState for UI state
- **URL state** - React Router for navigation
- **Database as source of truth** - IndexedDB is the single source

## Sync Strategy

### Push/Pull Architecture

1. **Push**: Send local changes to server
   - Query `syncMetadata` for `pendingSync = true`
   - Batch entities and POST to `/api/sync/push`
   - Update `syncMetadata` on success

2. **Pull**: Fetch server changes
   - POST to `/api/sync/pull` with `lastSyncTime`
   - Merge incoming data with conflict resolution
   - Update local entities

### Conflict Resolution

#### Last-Write-Wins (Default)
```typescript
if (serverEntity.updatedAt > localEntity.updatedAt) {
  await db.entities.put(serverEntity);
} else {
  // Keep local, will push on next sync
}
```

#### Server-Wins
```typescript
await db.entities.put(serverEntity);
await db.syncMetadata.update(id, { pendingSync: false });
```

#### Manual Resolution
```typescript
await db.syncMetadata.update(id, {
  conflictData: JSON.stringify({ local, server }),
});
// Display conflict UI to user
```

## Performance Optimization

### Indexing Best Practices

- Index fields used in `where()` clauses
- Compound indexes for multi-field queries
- Avoid over-indexing (storage overhead)

### Live Query Optimization

```typescript
// ✅ Good: Indexed query
const products = useLiveQuery(
  () => db.products.where('category').equals('Widgets').toArray()
);

// ❌ Bad: Table scan with filter
const products = useLiveQuery(
  () => db.products.filter(p => p.category === 'Widgets').toArray()
);
```

### Pagination

```typescript
// Large datasets: Use limit + offset
const products = useLiveQuery(
  () => db.products
    .orderBy('createdAt')
    .reverse()
    .offset(page * pageSize)
    .limit(pageSize)
    .toArray(),
  [page, pageSize]
);
```

## Security Considerations

### Data Encryption

For sensitive data, implement client-side encryption:

```typescript
import { encrypt, decrypt } from '@/lib/crypto';

// Before save
const encrypted = await encrypt(JSON.stringify(product));
await db.products.add({ ...product, data: encrypted });

// After read
const decrypted = JSON.parse(await decrypt(product.data));
```

### Access Control

```typescript
// Check user role before operations
const currentUser = await db.users.where('username').equals(username).first();
if (currentUser?.role !== 'admin') {
  throw new Error('Unauthorized');
}
```

## Testing Strategy

### Unit Tests
- Database operations (`src/db/__tests__/operations.test.ts`)
- Utility functions
- Hooks (with mocked Dexie)

### Integration Tests
- Component interactions (`src/components/__tests__/`)
- User flows (add product → adjust stock → create sale)

### E2E Tests
- Critical paths with Playwright/Cypress
- PWA installation and offline mode
- Multi-tab synchronization

## Deployment

### Build Optimization

```bash
# Production build
npm run build

# Bundle analysis
npx vite-bundle-visualizer
```

### Environment Configuration

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          db: ['dexie', 'dexie-react-hooks'],
        },
      },
    },
  },
});
```

## Migration Plan (Future Versions)

### Version 2: Add Categories Table

```typescript
this.version(2).stores({
  // Existing tables...
  categories: '++id, name, parentId',
}).upgrade(tx => {
  // Migrate existing category strings to references
  return tx.products.toCollection().modify(product => {
    // Migration logic
  });
});
```

## Monitoring & Debugging

### IndexedDB Inspector

Chrome DevTools → Application → Storage → IndexedDB → OfflineIMS

### Dexie Debug Mode

```typescript
// Enable in development
if (import.meta.env.DEV) {
  Dexie.debug = true;
}
```

### Performance Profiling

```typescript
console.time('query');
const results = await db.products.where('category').equals('Widgets').toArray();
console.timeEnd('query');
```

## Best Practices

1. **Always use indexes** for WHERE clauses
2. **Batch operations** in transactions for atomicity
3. **Validate data** before database writes
4. **Handle errors** gracefully with try/catch
5. **Test offline** scenarios thoroughly
6. **Version your schema** properly for migrations
7. **Document breaking changes** in CHANGELOG
8. **Keep bundles small** - code split aggressively
9. **Audit log everything** for compliance
10. **Test on target devices** (mobile, tablets)

## Resources

- [Dexie.js Documentation](https://dexie.org)
- [React Router v6 Guide](https://reactrouter.com)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app)
