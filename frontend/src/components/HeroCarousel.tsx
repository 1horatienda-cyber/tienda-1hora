'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface HeroSlide {
  id: string;
  imageUrl: string;
  href: string;
  // Opcionales: solo se usan si la imagen del banner no trae ya su propio texto/diseño.
  title?: string;
  subtitle?: string;
  alt?: string;
}

const AUTOPLAY_MS = 5000;
const SWIPE_THRESHOLD_PX = 40;

export default function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;

  function goTo(next: number) {
    setIndex((next + slides.length) % slides.length);
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > SWIPE_THRESHOLD_PX) {
      goTo(index + (delta < 0 ? 1 : -1));
    }
    touchStartX.current = null;
  }

  return (
    <div
      className="relative overflow-hidden bg-brand"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((slide) => (
          <Link key={slide.id} href={slide.href} className="relative w-full shrink-0 aspect-[2/1]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.imageUrl}
              alt={slide.alt || slide.title || 'Promoción'}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {slide.title && (
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center text-white px-4">
                <h2 className="text-2xl sm:text-5xl font-semibold tracking-tight">{slide.title}</h2>
                {slide.subtitle && <p className="mt-2 text-sm sm:text-lg text-gray-200">{slide.subtitle}</p>}
              </div>
            )}
          </Link>
        ))}
      </div>

      {slides.length > 1 && (
        <>
          <button
            onClick={() => goTo(index - 1)}
            aria-label="Anterior"
            className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white items-center justify-center transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => goTo(index + 1)}
            aria-label="Siguiente"
            className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white items-center justify-center transition-colors"
          >
            <ChevronRight size={20} />
          </button>

          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                onClick={() => goTo(i)}
                aria-label={`Ir a la diapositiva ${i + 1}`}
                className={`w-2 h-2 rounded-full transition-colors ${i === index ? 'bg-white' : 'bg-white/40'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
