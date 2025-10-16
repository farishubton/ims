# Quick Start Guide

## Prerequisites

- Node.js 18+ and npm

## Installation

```bash
# Clone or download the repository
cd offline-ims

# Install dependencies
npm install
```

## Development

```bash
# Start the development server
npm run dev

# Open browser to http://localhost:3000
```

## First Steps

### 1. Add Your First Product

1. Click "Products" in the navigation
2. Click "Add Product"
3. Fill in the form:
   - SKU: `WIDGET-001`
   - Name: `Blue Widget`
   - Current Stock: `100`
   - Min Stock: `10`
   - Unit Price: `9.99`
4. Click "Create"

### 2. Adjust Stock

1. Find the product in the list
2. Click the package icon (📦)
3. Select adjustment type (Stock In/Out)
4. Enter quantity
5. Add optional reason/reference
6. Click "Adjust Stock"

### 3. Create a Sale

1. Go to Dashboard
2. Note current stock levels
3. Go to Products
4. Find a product
5. Adjust stock with type "Sale"
6. Check Dashboard - stock decremented, transaction recorded

### 4. Scan Barcodes

1. Click "Scan" in navigation
2. Option 1: Click "Start Camera" to use device camera
3. Option 2: Type barcode manually in the input field
4. If product found: Details displayed
5. If not found: Prompt to create new product

### 5. View Audit Log

1. Click "Audit Log" in navigation
2. See all changes with timestamps
3. Filter by entity type if needed

### 6. Export Data

1. Click "Export CSV" button (top right)
2. CSV file downloads with all products
3. Open in spreadsheet application

## Testing Offline Mode

### Chrome/Edge
1. Open DevTools (F12)
2. Go to "Network" tab
3. Select "Offline" from dropdown
4. All features still work!
5. Changes queue for sync

### Firefox
1. File → Work Offline
2. Test adding/editing products
3. Go back online
4. Changes can be synced

## Install as PWA

### Desktop (Chrome/Edge)
1. Look for install icon in address bar
2. Click "Install"
3. App opens in standalone window

### Mobile (iOS Safari)
1. Tap Share button
2. "Add to Home Screen"
3. Name the app
4. Tap "Add"

### Mobile (Android Chrome)
1. Tap menu (⋮)
2. "Install app" or "Add to Home Screen"
3. Confirm installation

## Common Tasks

### Search Products
- Type in search box on Products page
- Searches: Name, SKU, Barcode, Category

### Low Stock Alert
- Dashboard shows products below min stock
- Red badge on stock count
- Reorder quantity suggested

### Keyboard Shortcuts
- `/` - Focus search
- `Esc` - Close dialogs
- `Tab` - Navigate form fields

## Troubleshooting

### "IndexedDB not available"
- Use a modern browser (Chrome, Firefox, Safari, Edge)
- Check browser settings allow local storage
- Private/Incognito mode may limit IndexedDB

### Database Reset
Open browser console and run:
```javascript
await Dexie.delete('OfflineIMS')
```
Then refresh page.

### Clear Service Worker
1. DevTools → Application → Service Workers
2. Click "Unregister"
3. Refresh page

## Next Steps

- Read [README.md](./README.md) for full documentation
- Check [EXAMPLES.md](./EXAMPLES.md) for code examples
- Review [ARCHITECTURE.md](./ARCHITECTURE.md) for system design

## Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview

# Deploy dist/ folder to your hosting provider
```

## Run Tests

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Check coverage
npm run test:coverage
```

## Need Help?

- Check the README for detailed docs
- Review EXAMPLES.md for common patterns
- Open an issue on GitHub
- Contact the development team

---

**Happy Inventory Management! 📦**
