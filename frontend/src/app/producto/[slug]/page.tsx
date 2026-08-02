import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import AddToCartPanel from '@/components/AddToCartPanel';

interface Props {
  params: { slug: string };
}

export default async function ProductoPage({ params }: Props) {
  const product = await api.getProduct(params.slug).catch(() => null);
  if (!product) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Fotos */}
        <div>
          <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden">
            {product.images?.[0]?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">Sin foto</div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3 mt-3">
              {product.images.slice(1).map((img) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={img.id} src={img.url} alt="" className="aspect-square object-cover rounded-lg" />
              ))}
            </div>
          )}
        </div>

        {/* Detalles + acción de compra */}
        <div>
          {product.category && (
            <p className="text-sm text-brand-accent font-medium mb-2">{product.category.name}</p>
          )}
          <h1 className="text-3xl font-semibold">{product.name}</h1>
          <p className="text-sm text-gray-400 mt-1">Código: {product.sku}</p>
          <p className="text-gray-600 mt-4 leading-relaxed">{product.description}</p>

          <AddToCartPanel product={product} />
        </div>
      </div>

      {/* Relacionados */}
      {product.related && product.related.length > 0 && (
        <section className="mt-20">
          <h2 className="text-2xl font-semibold mb-6">Productos relacionados</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {product.related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
