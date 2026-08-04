import Link from 'next/link';
import BrandLogos from './BrandLogos';

export default function Footer() {
  return (
    <footer className="bg-brand text-gray-300 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 sm:grid-cols-3 gap-8 text-sm">
        <div>
          <div className="bg-white rounded-lg inline-block px-3 py-2 mb-3">
            <BrandLogos heightClass="h-6" />
          </div>
          <p>Catálogo online. Pedidos por retiro en tienda, envío a tu negocio o a domicilio.</p>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-3">Ayuda</h3>
          <ul className="space-y-2">
            <li><Link href="/envios" className="hover:text-white">Información de envíos</Link></li>
            <li><Link href="/faq" className="hover:text-white">Preguntas frecuentes</Link></li>
            <li><Link href="/contacto" className="hover:text-white">Contacto</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-3">La marca</h3>
          <ul className="space-y-2">
            <li><Link href="/marca" className="hover:text-white">Conócenos</Link></li>
            <li><Link href="/catalogo" className="hover:text-white">Catálogo completo</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} 1Hora — Todos los derechos reservados.
      </div>
    </footer>
  );
}
