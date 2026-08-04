import Link from 'next/link';
import { Product } from '@/lib/types';
import { formatRD } from '@/lib/format';

export default function ProductCard({ product }: { product: Product }) {
  const image = product.images?.[0]?.url;
  const outOfStock = (product.inventory?.quantityAvailable ?? 0) <= 0;

  return (
    <Link
      href={`/producto/${product.slug}`}
      className="group block rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300"
    >
      <div className="aspect-square bg-gray-50 overflow-hidden relative">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">Sin foto</div>
        )}
        {product.isNew && (
          <span className="absolute top-3 left-3 bg-brand text-white text-xs px-2 py-1 rounded-full">Nuevo</span>
        )}
        {outOfStock && (
          <span className="absolute top-3 right-3 bg-white/90 text-gray-700 text-xs px-2 py-1 rounded-full">
            Agotado
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 truncate">{product.name}</h3>
        <p className="mt-1 text-sm font-semibold text-brand-accent">
          {formatRD(product.retailPriceInCents ?? product.priceInCents)}
        </p>
        <p className="text-xs text-gray-400">
          Por mayor ({product.wholesaleMinQty}+): {formatRD(product.priceInCents)}
        </p>
      </div>
    </Link>
  );
}
