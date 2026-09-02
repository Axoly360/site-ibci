import Image from "next/image";
import Link from "next/link";
import { CalendarDays } from "lucide-react";

/** Seção de 2 banners de destaque. Projeto PEPE já tem arte real; Evento Principal aguarda conteúdo. */
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

        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-primary/20 bg-primary/5 p-10 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CalendarDays className="h-6 w-6" />
          </span>
          <h3 className="font-heading text-lg font-semibold text-primary">
            Evento Principal
          </h3>
          <p className="text-sm text-text-neutral/50">Em breve</p>
        </div>
      </div>
    </section>
  );
}
