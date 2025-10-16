import { useState } from 'react';
import { useProduct } from '@/hooks/useProducts';
import { useStockActions } from '@/hooks/useStockAdjustments';
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
import type { AdjustmentType } from '@/types/models';

interface StockAdjustmentDialogProps {
  productId: number;
  onClose: () => void;
}

export function StockAdjustmentDialog({ productId, onClose }: StockAdjustmentDialogProps) {
  const { product } = useProduct(productId);
  const { adjustStock } = useStockActions();
  const [type, setType] = useState<AdjustmentType>('in');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');
  const [reference, setReference] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adjustStock(productId, quantity, type, reason || undefined, reference || undefined);
      onClose();
    } catch (error) {
      console.error('Failed to adjust stock:', error);
      alert('Failed to adjust stock');
    }
  };

  if (!product) return null;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust Stock - {product.name}</DialogTitle>
          <DialogDescription>Current stock: {product.currentStock} units</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="type">Adjustment Type</Label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as AdjustmentType)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="in">Stock In</option>
                <option value="out">Stock Out</option>
                <option value="purchase">Purchase</option>
                <option value="return">Return</option>
                <option value="adjustment">Adjustment</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Input
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Optional reason"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference">Reference</Label>
              <Input
                id="reference"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="PO number, invoice, etc."
              />
            </div>

            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm">
                <strong>New Stock:</strong>{' '}
                {type === 'in' || type === 'purchase' || type === 'return'
                  ? product.currentStock + quantity
                  : Math.max(0, product.currentStock - quantity)}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Adjust Stock</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
