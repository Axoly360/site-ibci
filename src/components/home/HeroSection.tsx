"use client";

import { useRef, useState, type UIEvent } from "react";
import Image from "next/image";
import { heroBanners } from "@/data/heroBanners";

export default function HeroSection() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const goTo = (index: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
    setActive(index);
  };

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.clientWidth === 0) return;
    setActive(Math.round(el.scrollLeft / el.clientWidth));
  };

  return (
    <section className="relative bg-primary">
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {heroBanners.map((banner) => (
          <div key={banner.id} className="w-full shrink-0 snap-start">
            {/* Mobile: recorte focado nos horários/selo "ao vivo" — texto mais acionável; nome da igreja e foto do pastor já aparecem no header e no restante da home. */}
            <div className="relative h-56 w-full overflow-hidden sm:hidden">
              <Image
                src={banner.src}
                alt={banner.alt}
                fill
                priority
                sizes="100vw"
                className="object-cover"
                style={{ objectPosition: banner.mobileObjectPosition ?? "center" }}
              />
            </div>

            {/* Tablet/desktop: banner inteiro, sem corte. */}
            <Image
              src={banner.src}
              alt={banner.alt}
              width={banner.width}
              height={banner.height}
              priority
              sizes="100vw"
              className="hidden h-auto w-full sm:block"
            />
          </div>
        ))}
      </div>

      {heroBanners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {heroBanners.map((banner, index) => (
            <button
              key={banner.id}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Ir para o banner ${index + 1}`}
              className={`h-2.5 w-2.5 rounded-full transition-colors ${
                index === active ? "bg-secondary" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
