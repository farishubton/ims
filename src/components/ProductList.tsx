import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react';
import { useProducts, useProductActions } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ProductEditor } from './ProductEditor';
import { StockAdjustmentDialog } from './StockAdjustmentDialog';
import { formatCurrency } from '@/lib/utils';

export function ProductList() {
  const { products, loading } = useProducts();
  const { deleteProduct } = useProductActions();
  const [search, setSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<number | null>(null);
  const [adjustingStock, setAdjustingStock] = useState<number | null>(null);

  const filteredProducts = products.filter((p) => {
    const query = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(query) ||
      p.sku.toLowerCase().includes(query) ||
      (p.barcode && p.barcode.toLowerCase().includes(query))
    );
  });

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(id);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Products</CardTitle>
              <CardDescription>Manage your product catalog</CardDescription>
            </div>
            <Button onClick={() => setEditingProduct(-1)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading products...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {search ? 'No products found' : 'No products yet. Add your first product!'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-mono">{product.sku}</TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category || '-'}</TableCell>
                    <TableCell>
                      <span
                        className={
                          product.minStockLevel && product.currentStock <= product.minStockLevel
                            ? 'text-destructive font-semibold'
                            : ''
                        }
                      >
                        {product.currentStock}
                      </span>
                    </TableCell>
                    <TableCell>{product.unitPrice ? formatCurrency(product.unitPrice) : '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setAdjustingStock(product.id!)}
                          title="Adjust Stock"
                        >
                          <Package className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingProduct(product.id!)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(product.id!)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {editingProduct !== null && (
        <ProductEditor
          productId={editingProduct === -1 ? undefined : editingProduct}
          onClose={() => setEditingProduct(null)}
        />
      )}

      {adjustingStock !== null && (
        <StockAdjustmentDialog productId={adjustingStock} onClose={() => setAdjustingStock(null)} />
      )}
    </div>
  );
}
