import Link from 'next/link';
import { api } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import HeroCarousel, { HeroSlide } from '@/components/HeroCarousel';
import BrandLogos from '@/components/BrandLogos';

export default async function HomePage() {
  const [featured, news, banners] = await Promise.all([
    api.getProducts({ featured: true }).catch(() => []),
    api.getProducts({ isNew: true }).catch(() => []),
    api.getBanners().catch(() => []),
  ]);

  const heroSlides: HeroSlide[] = banners.map((b) => ({ id: b.id, imageUrl: b.imageUrl, href: b.href }));

  return (
    <div>
      {/* Hero: banners promocionales administrables desde /admin/banners */}
      {heroSlides.length > 0 ? (
        <HeroCarousel slides={heroSlides} />
      ) : (
        <section className="relative bg-brand text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center">
            <div className="bg-white rounded-2xl inline-flex px-8 py-6">
              <BrandLogos heightClass="h-14 sm:h-16" />
            </div>
            <p className="mt-6 text-lg text-gray-300 max-w-xl mx-auto">
              Descubre nuestra colección. Pide en línea y coordina tu entrega por WhatsApp.
            </p>
            <Link
              href="/catalogo"
              className="mt-8 inline-block bg-white text-brand px-8 py-3 rounded-full font-medium hover:bg-brand-accent hover:text-white transition-colors"
            >
              Ver catálogo
            </Link>
          </div>
        </section>
      )}

      {/* Destacados */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Productos destacados</h2>
            <Link href="/catalogo?featured=true" className="text-sm text-brand-accent hover:underline">Ver todos</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Nuevos */}
      {news.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-gray-50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Nuevos productos</h2>
            <Link href="/catalogo?new=true" className="text-sm text-brand-accent hover:underline">Ver todos</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {news.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
