import { api } from '@/lib/api';
import ProductCard from '@/components/ProductCard';

interface Props {
  searchParams: { category?: string; search?: string; featured?: string; new?: string };
}

export default async function CatalogoPage({ searchParams }: Props) {
  const [products, categories] = await Promise.all([
    api.getProducts({
      category: searchParams.category,
      search: searchParams.search,
      featured: searchParams.featured === 'true',
      isNew: searchParams.new === 'true',
    }).catch(() => []),
    api.getCategories().catch(() => []),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-semibold mb-2">Catálogo</h1>
      <p className="text-gray-500 mb-8">{products.length} productos disponibles</p>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filtros por categoría */}
        <aside className="md:w-56 shrink-0">
          <form action="/catalogo" method="get" className="mb-6">
            <input
              type="text"
              name="search"
              defaultValue={searchParams.search}
              placeholder="Buscar producto..."
              className="w-full border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
            />
          </form>
          <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">Categorías</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="/catalogo" className={`hover:text-brand-accent ${!searchParams.category ? 'font-semibold text-brand' : 'text-gray-600'}`}>
                Todas
              </a>
            </li>
            {categories.map((c) => (
              <li key={c.id}>
                <a
                  href={`/catalogo?category=${c.slug}`}
                  className={`hover:text-brand-accent ${searchParams.category === c.slug ? 'font-semibold text-brand' : 'text-gray-600'}`}
                >
                  {c.name}
                </a>
              </li>
            ))}
          </ul>
        </aside>

        {/* Grid de productos */}
        <div className="flex-1">
          {products.length === 0 ? (
            <p className="text-gray-500">No se encontraron productos.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
