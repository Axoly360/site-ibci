import Image from "next/image";
import Link from "next/link";

/** Seção de 2 banners de destaque: Projeto PEPE e Congregação IBCI Milagres. */
export default function HighlightBannersSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Link
          href="/para-voce/projeto-pepe"
          className="group relative block aspect-[760/560] overflow-hidden rounded-2xl"
        >
          <Image
            src="/highlight-pepe.png"
            alt="Projeto PEPE IBCI"
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        <Link
          href="/a-igreja/nossa-congregacao"
          className="group relative block aspect-[760/560] overflow-hidden rounded-2xl"
        >
          <Image
            src="/highlight-evento-principal.png"
            alt="Congregação IBCI Milagres — R. Cantor Noel Rosa, 40"
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
      </div>
    </section>
  );
}
