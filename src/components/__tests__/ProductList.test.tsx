import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductList } from '../ProductList';
import * as useProductsHook from '@/hooks/useProducts';

vi.mock('react-router-dom', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => <a href={to}>{children}</a>,
  useLocation: () => ({ pathname: '/products' }),
}));

describe('ProductList', () => {
  it('should render loading state', () => {
    vi.spyOn(useProductsHook, 'useProducts').mockReturnValue({
      products: [],
      loading: true,
    });

    render(<ProductList />);
    expect(screen.getByText(/loading products/i)).toBeInTheDocument();
  });

  it('should render products', () => {
    vi.spyOn(useProductsHook, 'useProducts').mockReturnValue({
      products: [
        {
          id: 1,
          sku: 'TEST-001',
          name: 'Test Product',
          currentStock: 10,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ],
      loading: false,
    });

    render(<ProductList />);
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('TEST-001')).toBeInTheDocument();
  });

  it('should filter products by search', async () => {
    const user = userEvent.setup();
    
    vi.spyOn(useProductsHook, 'useProducts').mockReturnValue({
      products: [
        {
          id: 1,
          sku: 'WIDGET-001',
          name: 'Widget',
          currentStock: 5,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 2,
          sku: 'GADGET-001',
          name: 'Gadget',
          currentStock: 3,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ],
      loading: false,
    });

    render(<ProductList />);
    
    const searchInput = screen.getByPlaceholderText(/search products/i);
    await user.type(searchInput, 'widget');

    await waitFor(() => {
      expect(screen.getByText('Widget')).toBeInTheDocument();
      expect(screen.queryByText('Gadget')).not.toBeInTheDocument();
    });
  });
});
