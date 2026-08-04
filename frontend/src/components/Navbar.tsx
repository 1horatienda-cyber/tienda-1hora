'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Search, X } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import BrandLogos from './BrandLogos';

export default function Navbar() {
  const router = useRouter();
  const totalItems = useCartStore((s) => s.totalItems());
  const [mounted, setMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/catalogo?search=${encodeURIComponent(trimmed)}` : '/catalogo');
    setSearchOpen(false);
    setQuery('');
  }

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center shrink-0">
          <BrandLogos heightClass="h-8" />
        </Link>

        {searchOpen ? (
          <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2 max-w-md">
            <input
              ref={searchInputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar producto..."
              className="w-full border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
            />
            <button type="submit" aria-label="Buscar" className="p-2 hover:text-brand-accent transition-colors shrink-0">
              <Search size={20} />
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchOpen(false);
                setQuery('');
              }}
              aria-label="Cerrar búsqueda"
              className="p-2 text-gray-400 hover:text-gray-700 transition-colors shrink-0"
            >
              <X size={20} />
            </button>
          </form>
        ) : (
          <>
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700">
              <Link href="/catalogo" className="hover:text-brand-accent transition-colors">Catálogo</Link>
              <Link href="/catalogo?featured=true" className="hover:text-brand-accent transition-colors">Destacados</Link>
              <Link href="/marca" className="hover:text-brand-accent transition-colors">La Marca</Link>
              <Link href="/contacto" className="hover:text-brand-accent transition-colors">Contacto</Link>
            </nav>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Buscar"
                className="p-2 hover:text-brand-accent transition-colors"
              >
                <Search size={20} />
              </button>
              <Link href="/carrito" aria-label="Carrito" className="relative p-2 hover:text-brand-accent transition-colors">
                <ShoppingBag size={20} />
                {mounted && totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-accent text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
