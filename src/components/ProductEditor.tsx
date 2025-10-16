import { useEffect, useState } from 'react';
import { useProduct, useProductActions } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ProductEditorProps {
  productId?: number;
  onClose: () => void;
}

export function ProductEditor({ productId, onClose }: ProductEditorProps) {
  const { product } = useProduct(productId);
  const { addProduct, updateProduct } = useProductActions();
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    category: '',
    barcode: '',
    currentStock: 0,
    minStockLevel: 0,
    reorderQuantity: 0,
    unitCost: 0,
    unitPrice: 0,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        sku: product.sku,
        name: product.name,
        description: product.description || '',
        category: product.category || '',
        barcode: product.barcode || '',
        currentStock: product.currentStock,
        minStockLevel: product.minStockLevel || 0,
        reorderQuantity: product.reorderQuantity || 0,
        unitCost: product.unitCost || 0,
        unitPrice: product.unitPrice || 0,
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (productId) {
        await updateProduct(productId, formData);
      } else {
        await addProduct(formData);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save product:', error);
      alert('Failed to save product');
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{productId ? 'Edit Product' : 'Add Product'}</DialogTitle>
          <DialogDescription>
            {productId ? 'Update product details' : 'Create a new product in your inventory'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => handleChange('sku', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="barcode">Barcode</Label>
                <Input
                  id="barcode"
                  value={formData.barcode}
                  onChange={(e) => handleChange('barcode', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentStock">Current Stock</Label>
                <Input
                  id="currentStock"
                  type="number"
                  min="0"
                  value={formData.currentStock}
                  onChange={(e) => handleChange('currentStock', Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minStockLevel">Min Stock</Label>
                <Input
                  id="minStockLevel"
                  type="number"
                  min="0"
                  value={formData.minStockLevel}
                  onChange={(e) => handleChange('minStockLevel', Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reorderQuantity">Reorder Qty</Label>
                <Input
                  id="reorderQuantity"
                  type="number"
                  min="0"
                  value={formData.reorderQuantity}
                  onChange={(e) => handleChange('reorderQuantity', Number(e.target.value))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unitCost">Unit Cost</Label>
                <Input
                  id="unitCost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.unitCost}
                  onChange={(e) => handleChange('unitCost', Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unitPrice">Unit Price</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.unitPrice}
                  onChange={(e) => handleChange('unitPrice', Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{productId ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
