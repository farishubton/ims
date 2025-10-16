import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/schema';
import { addProduct, updateProduct, deleteProduct, searchProducts } from '@/db/operations';
import type { Product } from '@/types/models';

export function useProducts() {
  const products = useLiveQuery(
    () => db.products.filter(p => !p.deletedAt).toArray(),
    []
  );

  return {
    products: products || [],
    loading: !products,
  };
}

export function useProduct(id?: number) {
  const product = useLiveQuery(
    () => (id ? db.products.get(id) : undefined),
    [id]
  );

  return {
    product,
    loading: id ? !product : false,
  };
}

export function useLowStockProducts() {
  const products = useLiveQuery(
    () =>
      db.products
        .filter((p) => !p.deletedAt && p.minStockLevel !== undefined && p.currentStock <= (p.minStockLevel || 0))
        .toArray(),
    []
  );

  return {
    products: products || [],
    loading: !products,
  };
}

export function useProductActions() {
  return {
    addProduct: async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
      return await addProduct(product);
    },
    updateProduct: async (id: number, updates: Partial<Product>) => {
      await updateProduct(id, updates);
    },
    deleteProduct: async (id: number) => {
      await deleteProduct(id);
    },
    searchProducts: async (query: string) => {
      return await searchProducts(query);
    },
  };
}
