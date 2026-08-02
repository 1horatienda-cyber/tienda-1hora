import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/lib/types';

export interface CartItem {
  productId: string;
  name: string;
  priceInCents: number;
  quantity: number;
  imageUrl?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
  totalInCents: () => number;
  totalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity) => {
        const items = [...get().items];
        const existing = items.find((i) => i.productId === product.id);
        if (existing) {
          existing.quantity += quantity;
        } else {
          items.push({
            productId: product.id,
            name: product.name,
            priceInCents: product.priceInCents,
            quantity,
            imageUrl: product.images?.[0]?.url,
          });
        }
        set({ items });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
        });
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) });
      },

      clear: () => set({ items: [] }),

      totalInCents: () => get().items.reduce((sum, i) => sum + i.priceInCents * i.quantity, 0),
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'tienda-cart' },
  ),
);
