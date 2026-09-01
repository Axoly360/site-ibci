import { Construction } from "lucide-react";

/** Banner principal de destaque — aguardando imagem, texto e link. */
export default function MainBannerSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-primary/20 bg-primary/5 px-6 py-16 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Construction className="h-6 w-6" />
        </span>
        <h3 className="font-heading text-lg font-semibold text-primary">
          Banner Principal
        </h3>
        <p className="text-sm text-text-neutral/50">Em breve</p>
      </div>
    </section>
  );
}
