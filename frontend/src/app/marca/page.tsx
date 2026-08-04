import Link from 'next/link';
import { ShieldCheck, Package, MessageCircle, BadgeCheck, ShoppingBag, Truck } from 'lucide-react';
import { api } from '@/lib/api';
import BrandLogos from '@/components/BrandLogos';

const PILLARS = [
  {
    icon: ShieldCheck,
    title: '1 año de garantía',
    text: 'Todos nuestros productos incluyen garantía de fábrica de 1 año — calidad a tu alcance.',
  },
  {
    icon: BadgeCheck,
    title: 'Producto 100% original',
    text: 'Somos distribuidor oficial de 1Hora en República Dominicana, no revendemos réplicas.',
  },
  {
    icon: Package,
    title: 'Al por mayor y al detalle',
    text: 'Compra desde 1 unidad o aprovecha precios de mayorista desde 2, 3 o 6 unidades, según el producto.',
  },
  {
    icon: MessageCircle,
    title: 'Atención directa por WhatsApp',
    text: 'Coordina tu pedido hablando directo con un vendedor, sin intermediarios ni esperas.',
  },
];

const STEPS = [
  { icon: ShoppingBag, title: 'Elige tus productos', text: 'Navega el catálogo y agrega lo que necesites al carrito.' },
  { icon: Package, title: 'Ajusta la cantidad', text: 'El precio se ajusta solo según compres al detalle o al por mayor.' },
  { icon: Truck, title: 'Confirma por WhatsApp', text: 'Elige retiro, envío a tu negocio o a domicilio, y coordina directo con nosotros.' },
];

export default async function MarcaPage() {
  const products = await api.getProducts().catch(() => []);
  const gallery = products.filter((p) => p.images?.[0]?.url).slice(0, 6);

  return (
    <div>
      {/* Hero */}
      <section className="bg-brand text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="bg-white rounded-2xl inline-flex px-6 py-4 mb-6">
            <BrandLogos heightClass="h-10 sm:h-12" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight">Distribuidor oficial de 1Hora en RD</h1>
          <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
            Somos RA Cell Technology: importamos y distribuimos accesorios de tecnología 1Hora al por mayor y al
            detalle en toda República Dominicana. Calidad a tu alcance.
          </p>
          <Link
            href="/catalogo"
            className="mt-8 inline-block bg-white text-brand px-8 py-3 rounded-full font-medium hover:bg-brand-accent hover:text-white transition-colors"
          >
            Ver catálogo
          </Link>
        </div>
      </section>

      {/* Por qué elegirnos */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-semibold text-center mb-10">Por qué comprar con nosotros</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PILLARS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="border border-gray-100 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-brand/5 text-brand flex items-center justify-center mx-auto mb-4">
                <Icon size={24} />
              </div>
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-sm text-gray-500">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mosaico de productos reales */}
      {gallery.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-semibold text-center mb-10">Nuestro catálogo</h2>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
              {gallery.map((p) => (
                <Link
                  key={p.id}
                  href={`/producto/${p.slug}`}
                  className="aspect-square rounded-xl overflow-hidden bg-white border border-gray-100 hover:shadow-md transition-shadow"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" />
                </Link>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/catalogo" className="text-brand-accent font-medium hover:underline">
                Ver catálogo completo →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Cómo comprar */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-semibold text-center mb-10">Cómo comprar</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <div key={title} className="text-center">
              <div className="w-14 h-14 rounded-full bg-brand text-white flex items-center justify-center mx-auto mb-4 relative">
                <Icon size={26} />
                <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-brand-accent text-white text-xs flex items-center justify-center">
                  {i + 1}
                </span>
              </div>
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-sm text-gray-500">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA contacto */}
      <section className="bg-brand text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <h2 className="text-2xl font-semibold mb-3">¿Tienes alguna pregunta?</h2>
          <p className="text-gray-300 mb-6">Escríbenos directo a cualquiera de nuestros vendedores por WhatsApp.</p>
          <Link
            href="/contacto"
            className="inline-block bg-white text-brand px-8 py-3 rounded-full font-medium hover:bg-brand-accent hover:text-white transition-colors"
          >
            Contáctanos
          </Link>
        </div>
      </section>
    </div>
  );
}
