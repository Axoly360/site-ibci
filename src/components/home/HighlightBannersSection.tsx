import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface HighlightBannerData {
  image: string;
  alt: string;
  href: string;
}

interface HighlightBannersSectionProps {
  pepe: HighlightBannerData;
  eventoPrincipal: HighlightBannerData;
}

function HighlightBanner({ image, alt, href }: HighlightBannerData) {
  return (
    <Link
      href={href}
      className="group relative block aspect-[760/560] overflow-hidden rounded-2xl"
    >
      <Image
        src={image}
        alt={alt}
        fill
        unoptimized={image.startsWith("http")}
        sizes="(min-width: 640px) 50vw, 100vw"
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4 pt-10">
        <p className="flex items-center gap-1.5 font-heading text-sm font-semibold text-white sm:text-base">
          {alt}
          <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
        </p>
      </div>
    </Link>
  );
}

/** Seção de 2 banners de destaque: Projeto PEPE e Congregação IBCI Milagres. */
export default function HighlightBannersSection({
  pepe,
  eventoPrincipal,
}: HighlightBannersSectionProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <HighlightBanner {...pepe} />
        <HighlightBanner {...eventoPrincipal} />
      </div>
    </section>
  );
}
