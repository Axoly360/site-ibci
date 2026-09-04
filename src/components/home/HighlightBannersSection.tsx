import Image from "next/image";
import Link from "next/link";

interface HighlightBannerData {
  image: string;
  alt: string;
  href: string;
}

interface HighlightBannersSectionProps {
  pepe: HighlightBannerData;
  eventoPrincipal: HighlightBannerData;
}

/** Seção de 2 banners de destaque: Projeto PEPE e Congregação IBCI Milagres. */
export default function HighlightBannersSection({
  pepe,
  eventoPrincipal,
}: HighlightBannersSectionProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Link
          href={pepe.href}
          className="group relative block aspect-[760/560] overflow-hidden rounded-2xl"
        >
          <Image
            src={pepe.image}
            alt={pepe.alt}
            fill
            unoptimized={pepe.image.startsWith("http")}
            sizes="(min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        <Link
          href={eventoPrincipal.href}
          className="group relative block aspect-[760/560] overflow-hidden rounded-2xl"
        >
          <Image
            src={eventoPrincipal.image}
            alt={eventoPrincipal.alt}
            fill
            unoptimized={eventoPrincipal.image.startsWith("http")}
            sizes="(min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
      </div>
    </section>
  );
}
