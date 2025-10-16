# Offline IMS - Inventory Management System

A complete **offline-first** inventory management system built with React, Vite, shadcn/ui, and Dexie (IndexedDB).

## 🚀 Features

- ✅ **Offline-first architecture** - Works without internet connection
- ✅ **Product catalog management** - Add, edit, delete products
- ✅ **Stock management** - Track stock levels, adjustments, and transactions
- ✅ **Barcode scanning** - Camera + keyboard wedge support
- ✅ **Sales & purchases** - Record transactions with automatic stock updates
- ✅ **Audit log** - Complete history of all changes
- ✅ **Low stock alerts** - Dashboard warnings for reorder points
- ✅ **Search & filter** - Fast product lookup by SKU, name, or barcode
- ✅ **CSV export** - Export inventory data
- ✅ **PWA support** - Installable on desktop and mobile
- ✅ **Multi-tab capable** - Sync between browser tabs using IndexedDB
- ✅ **Server sync ready** - Optional sync adapter for backend integration
- ✅ **Conflict resolution** - Last-write-wins, server-wins, or manual merge
- ✅ **Type-safe** - Full TypeScript coverage
- ✅ **Accessible** - WCAG 2.1 AA compliant components

## 📦 Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful, accessible components
- **Dexie.js** - IndexedDB wrapper with TypeScript support
- **React Router** - Client-side routing
- **html5-qrcode** - Barcode scanning
- **Vitest** - Unit and integration testing
- **Workbox** - Service worker and PWA

## 🛠️ Setup

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Run tests with UI
npm run test:ui

# Type check
npm run type-check

# Lint
npm run lint
```

## 📱 PWA Installation

### Desktop (Chrome/Edge)
1. Open the app in your browser
2. Click the install icon in the address bar
3. Confirm installation

### Mobile (iOS Safari)
1. Open the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"

### Mobile (Android Chrome)
1. Open the app in Chrome
2. Tap the menu (⋮)
3. Select "Install app" or "Add to Home Screen"

## 🗄️ Database Schema

### Tables

- **products** - Product catalog (SKU, name, barcode, stock levels, pricing)
- **stockAdjustments** - Stock movement history (in/out, reasons, references)
- **transactions** - Sales and purchases (items, totals, timestamps)
- **users** - User accounts and roles (admin/staff)
- **syncMetadata** - Sync state tracking (versions, conflicts, pending changes)
- **auditLogs** - Complete audit trail (entity changes, timestamps)

### Indexes

- Products: `sku`, `barcode`, `name`, `category`, `deletedAt`
- Stock Adjustments: `productId`, `type`, `createdAt`
- Transactions: `type`, `createdAt`, `completedAt`
- Sync Metadata: `[entityType+entityId]`, `pendingSync`
- Audit Logs: `entityType`, `entityId`, `timestamp`

## 🔄 Sync Architecture

The system includes a pluggable sync adapter for server synchronization:

```typescript
import { initSync } from '@/db/sync';

const syncAdapter = await initSync({
  serverUrl: 'https://your-api.com',
  apiKey: 'your-api-key',
});

const result = await syncAdapter.sync();
console.log(`Pulled: ${result.pulled}, Pushed: ${result.pushed}, Conflicts: ${result.conflicts}`);
```

### Conflict Resolution Strategies

1. **Last-write-wins** (default) - Newest timestamp wins
2. **Server-wins** - Server data always takes precedence
3. **Client-wins** - Local changes always take precedence
4. **Manual** - Store conflict data for user resolution

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### Integration Tests
```bash
npm run test:ui
```

### Coverage
```bash
npm run test:coverage
```

### Example Test Scenarios

- ✅ Add/update/delete products
- ✅ Stock adjustments (in/out)
- ✅ Sale transactions with stock deduction
- ✅ Search and filter operations
- ✅ Insufficient stock validation
- ✅ UI interactions and state updates

## 📊 Usage Examples

### Add a Product

```typescript
import { useProductActions } from '@/hooks/useProducts';

const { addProduct } = useProductActions();

await addProduct({
  sku: 'WIDGET-001',
  name: 'Blue Widget',
  barcode: '123456789012',
  category: 'Widgets',
  currentStock: 100,
  minStockLevel: 20,
  reorderQuantity: 50,
  unitCost: 5.0,
  unitPrice: 9.99,
});
```

### Adjust Stock

```typescript
import { useStockActions } from '@/hooks/useStockAdjustments';

const { adjustStock } = useStockActions();

await adjustStock(
  productId,
  50,
  'in',
  'Received shipment',
  'PO-12345'
);
```

### Create Sale

```typescript
import { useTransactionActions } from '@/hooks/useTransactions';

const { createSale } = useTransactionActions();

await createSale([
  { productId: 1, quantity: 2, unitPrice: 9.99 },
  { productId: 2, quantity: 1, unitPrice: 14.99 },
]);
```

## 🔐 Security & Privacy

- All data stored locally in IndexedDB
- No third-party analytics or tracking
- Optional end-to-end encryption for sync (implement in sync adapter)
- User roles for access control (admin/staff)
- Audit log for compliance

## 🌐 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers with IndexedDB support

## 📦 Deployment

### Static Hosting (Netlify, Vercel, Cloudflare Pages)

```bash
npm run build
# Upload the `dist` folder
```

### Docker

```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Environment Variables

- `VITE_API_URL` - Backend API URL (optional)
- `VITE_API_KEY` - API authentication key (optional)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Ensure all tests pass: `npm test`
5. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

## 🆘 Support

For issues, questions, or feature requests, please open an issue on GitHub.

## 🗺️ Roadmap

- [ ] Multi-warehouse support
- [ ] Real-time sync with WebSockets
- [ ] Batch operations and bulk import
- [ ] Advanced reporting and analytics
- [ ] Mobile native apps (React Native)
- [ ] End-to-end encryption
- [ ] Role-based permissions
- [ ] Barcode label printing
- [ ] Supplier management
- [ ] Purchase order workflow

## 📸 Screenshots

_Add screenshots of Dashboard, Products, Scanner, etc._

---

Built with ❤️ using React, Vite, and Dexie
