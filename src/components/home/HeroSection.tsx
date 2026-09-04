"use client";

import { useRef, useState, type UIEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { Construction } from "lucide-react";
import { heroBanners, type HeroBanner } from "@/data/heroBanners";

const SLIDE_CLASS =
  "relative aspect-[390/546] w-full shrink-0 snap-start overflow-hidden sm:aspect-[1360/460]";

function BannerImages({ banner }: { banner: HeroBanner }) {
  return (
    <>
      {/* Mobile: arte própria 390x546. */}
      <Image
        src={banner.srcMobile!}
        alt={banner.alt ?? ""}
        fill
        priority
        sizes="100vw"
        className="object-cover sm:hidden"
      />
      {/* Desktop/tablet: arte própria 1360x460. */}
      <Image
        src={banner.srcDesktop!}
        alt={banner.alt ?? ""}
        fill
        priority
        sizes="100vw"
        className="hidden object-cover sm:block"
      />
    </>
  );
}

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
        {heroBanners.map((banner) => {
          if (!(banner.srcDesktop && banner.srcMobile)) {
            return (
              <div
                key={banner.id}
                className={`${SLIDE_CLASS} flex flex-col items-center justify-center gap-2 border border-dashed border-white/20 text-center`}
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white/70">
                  <Construction className="h-6 w-6" />
                </span>
                <p className="font-heading text-lg font-semibold text-white/70">
                  {banner.placeholderTitle}
                </p>
                <p className="text-sm text-white/50">Em breve</p>
              </div>
            );
          }

          if (banner.href) {
            return (
              <Link key={banner.id} href={banner.href} className={SLIDE_CLASS}>
                <BannerImages banner={banner} />
              </Link>
            );
          }

          return (
            <div key={banner.id} className={SLIDE_CLASS}>
              <BannerImages banner={banner} />
            </div>
          );
        })}
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
