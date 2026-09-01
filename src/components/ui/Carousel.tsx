"use client";

import { useRef, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselProps {
  children: ReactNode;
  className?: string;
}

/**
 * Carrossel horizontal genérico: scroll nativo com snap (toque funciona sem
 * nenhum JS extra no mobile) + setas opcionais para desktop/mouse.
 * Os filhos devem ter largura fixa e `shrink-0` (ex.: `w-64 shrink-0`).
 */
export default function Carousel({ children, className = "" }: CarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: "smooth" });
  };

  return (
    <div className={`relative ${className}`}>
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&>*]:snap-start"
      >
        {children}
      </div>

      <button
        type="button"
        onClick={() => scroll(-1)}
        aria-label="Anterior"
        className="absolute left-0 top-1/2 hidden -translate-x-3 -translate-y-1/2 items-center justify-center rounded-full bg-white p-2 text-primary shadow-md hover:bg-secondary sm:flex"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => scroll(1)}
        aria-label="Próximo"
        className="absolute right-0 top-1/2 hidden -translate-y-1/2 translate-x-3 items-center justify-center rounded-full bg-white p-2 text-primary shadow-md hover:bg-secondary sm:flex"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
