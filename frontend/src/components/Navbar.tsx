'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';

export default function Navbar() {
  const totalItems = useCartStore((s) => s.totalItems());
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-1hora.png" alt="1Hora" className="h-9 w-auto" />
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700">
          <Link href="/catalogo" className="hover:text-brand-accent transition-colors">Catálogo</Link>
          <Link href="/catalogo?featured=true" className="hover:text-brand-accent transition-colors">Destacados</Link>
          <Link href="/marca" className="hover:text-brand-accent transition-colors">La Marca</Link>
          <Link href="/contacto" className="hover:text-brand-accent transition-colors">Contacto</Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/catalogo" aria-label="Buscar" className="p-2 hover:text-brand-accent transition-colors">
            <Search size={20} />
          </Link>
          <Link href="/carrito" aria-label="Carrito" className="relative p-2 hover:text-brand-accent transition-colors">
            <ShoppingBag size={20} />
            {mounted && totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-accent text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
