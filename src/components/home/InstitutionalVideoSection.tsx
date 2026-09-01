import { PlayCircle } from "lucide-react";

/** Vídeo institucional da igreja — aguardando arquivo ou link do YouTube. */
export default function InstitutionalVideoSection() {
  return (
    <section className="bg-primary/[0.03] py-20">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="font-heading text-3xl font-bold text-primary sm:text-4xl">
          Conheça a IBCI
        </h2>
        <p className="mt-3 text-text-neutral/80">
          Aqui vamos usar um vídeo institucional da igreja.
        </p>

        <div className="mx-auto mt-10 flex aspect-video w-full items-center justify-center rounded-2xl border border-dashed border-primary/20 bg-primary/5">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <PlayCircle className="h-7 w-7" />
          </span>
        </div>
      </div>
    </section>
  );
}
