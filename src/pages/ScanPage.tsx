import { useState } from 'react';
import { BarcodeScanner } from '@/components/BarcodeScanner';
import { useProductActions } from '@/hooks/useProducts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductEditor } from '@/components/ProductEditor';
import type { Product } from '@/types/models';

export function ScanPage() {
  const { searchProducts } = useProductActions();
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [notFound, setNotFound] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const handleScan = async (barcode: string) => {
    const results = await searchProducts(barcode);
    if (results.length > 0) {
      setScannedProduct(results[0]);
      setNotFound(null);
    } else {
      setNotFound(barcode);
      setScannedProduct(null);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div>
        <BarcodeScanner onScan={handleScan} />
      </div>

      <div>
        {scannedProduct && (
          <Card>
            <CardHeader>
              <CardTitle>Product Found</CardTitle>
              <CardDescription>{scannedProduct.sku}</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                  <dd className="text-lg font-semibold">{scannedProduct.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Category</dt>
                  <dd>{scannedProduct.category || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Current Stock</dt>
                  <dd className="text-lg font-bold">{scannedProduct.currentStock}</dd>
                </div>
                {scannedProduct.unitPrice && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Price</dt>
                    <dd>${scannedProduct.unitPrice.toFixed(2)}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        )}

        {notFound && (
          <Card>
            <CardHeader>
              <CardTitle>Product Not Found</CardTitle>
              <CardDescription>Barcode: {notFound}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                This barcode is not in your inventory.
              </p>
              <button
                onClick={() => setCreating(true)}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Create New Product
              </button>
            </CardContent>
          </Card>
        )}

        {creating && notFound && (
          <ProductEditor
            productId={undefined}
            onClose={() => {
              setCreating(false);
              setNotFound(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
