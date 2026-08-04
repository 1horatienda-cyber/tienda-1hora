'use client';

import { useState } from 'react';
import { Product } from '@/lib/types';
import { formatRD } from '@/lib/format';
import { useCartStore } from '@/store/cart-store';
import { unitPriceForQuantity, priceTiers } from '@/lib/pricing';

export default function AddToCartPanel({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const stock = product.inventory?.quantityAvailable ?? 0;
  const outOfStock = stock <= 0;
  const unitPrice = unitPriceForQuantity(product, quantity);
  const tiers = priceTiers(product, quantity);

  const handleAdd = () => {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="mt-6 border-t border-gray-100 pt-6">
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-semibold text-brand-accent">{formatRD(unitPrice)}</p>
        <span className="text-sm text-gray-400">c/u · {quantity} {quantity === 1 ? 'unidad' : 'unidades'}</span>
      </div>
      <p className="text-sm text-gray-500 mt-1">Total: {formatRD(unitPrice * quantity)}</p>

      {/* Tabla de precios por cantidad */}
      <div className="mt-4 border border-gray-100 rounded-xl overflow-hidden">
        {tiers.map((tier) => (
          <div
            key={tier.label}
            className={`flex items-center justify-between px-4 py-2.5 text-sm ${
              tier.active ? 'bg-brand text-white' : 'text-gray-600 border-t border-gray-50 first:border-t-0'
            }`}
          >
            <span>{tier.label}</span>
            <span className="font-medium">{formatRD(tier.priceInCents)} c/u</span>
          </div>
        ))}
      </div>

      <p className={`text-sm mt-3 ${outOfStock ? 'text-red-500' : 'text-green-600'}`}>
        {outOfStock ? 'Producto agotado' : `Disponible (${stock} en stock)`}
      </p>

      {!outOfStock && (
        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center border border-gray-200 rounded-full">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-10 h-10 flex items-center justify-center text-lg hover:text-brand-accent"
              aria-label="Disminuir cantidad"
            >
              −
            </button>
            <input
              type="number"
              min={1}
              max={stock}
              value={quantity}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                if (!Number.isNaN(value)) setQuantity(Math.min(stock, Math.max(1, value)));
              }}
              className="w-12 text-center outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
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
