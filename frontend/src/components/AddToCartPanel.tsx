'use client';

import { useState } from 'react';
import { Product } from '@/lib/types';
import { formatRD } from '@/lib/format';
import { useCartStore } from '@/store/cart-store';

export default function AddToCartPanel({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const stock = product.inventory?.quantityAvailable ?? 0;
  const outOfStock = stock <= 0;

  const handleAdd = () => {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="mt-6 border-t border-gray-100 pt-6">
      <p className="text-2xl font-semibold text-brand-accent">{formatRD(product.priceInCents)}</p>

      <p className={`text-sm mt-2 ${outOfStock ? 'text-red-500' : 'text-green-600'}`}>
        {outOfStock ? 'Producto agotado' : `Disponible (${stock} en stock)`}
      </p>

      {!outOfStock && (
        <div className="mt-6 flex items-center gap-4">
          <div className="flex items-center border border-gray-200 rounded-full">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-10 h-10 flex items-center justify-center text-lg hover:text-brand-accent"
              aria-label="Disminuir cantidad"
            >
              −
            </button>
            <span className="w-8 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
              className="w-10 h-10 flex items-center justify-center text-lg hover:text-brand-accent"
              aria-label="Aumentar cantidad"
            >
              +
            </button>
          </div>

          <button
            onClick={handleAdd}
            className="flex-1 bg-brand text-white py-3 rounded-full font-medium hover:bg-brand-accent transition-colors"
          >
            {added ? 'Agregado ✓' : 'Agregar al carrito'}
          </button>
        </div>
      )}
    </div>
  );
}
