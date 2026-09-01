"use client";

import { useRef, useState, type UIEvent } from "react";
import Image from "next/image";
import { Construction } from "lucide-react";
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
        {heroBanners.map((banner) =>
          banner.src ? (
            <div
              key={banner.id}
              className="relative aspect-[390/546] w-full shrink-0 snap-start overflow-hidden sm:aspect-[1360/460]"
            >
              {/* Mobile: quadro 390x546 — imagem inteira, sem corte (a proporção não bate com a arte atual). */}
              <Image
                src={banner.src}
                alt={banner.alt ?? ""}
                fill
                priority
                sizes="100vw"
                className="object-contain sm:hidden"
              />
              {/* Desktop/tablet: quadro 1360x460 — corte focado no texto mais acionável (horários/selo "ao vivo"). */}
              <Image
                src={banner.src}
                alt={banner.alt ?? ""}
                fill
                priority
                sizes="100vw"
                className="hidden object-cover sm:block"
                style={{ objectPosition: banner.objectPosition ?? "center" }}
              />
            </div>
          ) : (
            <div
              key={banner.id}
              className="relative flex aspect-[390/546] w-full shrink-0 snap-start flex-col items-center justify-center gap-2 border border-dashed border-white/20 bg-primary text-center sm:aspect-[1360/460]"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white/70">
                <Construction className="h-6 w-6" />
              </span>
              <p className="font-heading text-lg font-semibold text-white/70">
                {banner.placeholderTitle}
              </p>
              <p className="text-sm text-white/50">Em breve</p>
            </div>
          )
        )}
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
