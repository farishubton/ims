import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/schema';
import { createSaleTransaction } from '@/db/operations';

export function useTransactions() {
  const transactions = useLiveQuery(
    () => db.transactions.orderBy('createdAt').reverse().limit(100).toArray(),
    []
  );

  return {
    transactions: transactions || [],
    loading: !transactions,
  };
}

export function useRecentTransactions(limit = 10) {
  const transactions = useLiveQuery(
    () => db.transactions.orderBy('createdAt').reverse().limit(limit).toArray(),
    [limit]
  );

  return {
    transactions: transactions || [],
    loading: !transactions,
  };
}

export function useTransactionActions() {
  return {
    createSale: async (items: Array<{ productId: number; quantity: number; unitPrice: number }>) => {
      return await createSaleTransaction(items);
    },
  };
}
