import Image from "next/image";
import Link from "next/link";

interface MainBannerSectionProps {
  image: string;
  alt: string;
  href: string;
}

/** Banner principal de destaque em largura total. */
export default function MainBannerSection({ image, alt, href }: MainBannerSectionProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Link
        href={href}
        className="relative block aspect-[1600/500] w-full overflow-hidden rounded-2xl"
      >
        <Image
          src={image}
          alt={alt}
          fill
          unoptimized={image.startsWith("http")}
          sizes="100vw"
          className="object-cover"
        />
      </Link>
    </section>
  );
}
