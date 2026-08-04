import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/lib/types';
import { unitPriceForQuantity } from '@/lib/pricing';

export interface CartItem {
  productId: string;
  name: string;
  quantity: number;
  imageUrl?: string;
  // Se guardan los 3 niveles de precio del producto para poder recalcular el precio
  // por unidad en vivo cada vez que cambia la cantidad en el carrito.
  retailPriceInCents: number | null;
  priceInCents: number; // precio "por mayor" (desde wholesaleMinQty)
  wholesaleMinQty: number;
  boxQuantity: number | null;
  boxPriceInCents: number | null;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
  unitPrice: (item: CartItem) => number;
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
            quantity,
            imageUrl: product.images?.[0]?.url,
            retailPriceInCents: product.retailPriceInCents,
            priceInCents: product.priceInCents,
            wholesaleMinQty: product.wholesaleMinQty,
            boxQuantity: product.boxQuantity,
            boxPriceInCents: product.boxPriceInCents,
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

      // Precio por unidad según la cantidad actual de esa línea (detalle / por mayor / caja)
      unitPrice: (item) => unitPriceForQuantity(item, item.quantity),

      totalInCents: () => get().items.reduce((sum, i) => sum + get().unitPrice(i) * i.quantity, 0),
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'tienda-cart' },
  ),
);
