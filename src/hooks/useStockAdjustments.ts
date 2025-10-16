import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/schema';
import { adjustStock } from '@/db/operations';
import type { AdjustmentType } from '@/types/models';

export function useStockAdjustments(productId?: number) {
  const adjustments = useLiveQuery(
    () => {
      if (productId) {
        return db.stockAdjustments
          .where('productId')
          .equals(productId)
          .reverse()
          .sortBy('createdAt');
      }
      return db.stockAdjustments.orderBy('createdAt').reverse().limit(50).toArray();
    },
    [productId]
  );

  return {
    adjustments: adjustments || [],
    loading: !adjustments,
  };
}

export function useStockActions() {
  return {
    adjustStock: async (
      productId: number,
      quantity: number,
      type: AdjustmentType,
      reason?: string,
      reference?: string
    ) => {
      return await adjustStock(productId, quantity, type, reason, reference);
    },
  };
}
