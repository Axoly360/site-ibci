import { HandHeart, CalendarDays } from "lucide-react";

const banners = [
  { icon: HandHeart, title: "Projeto PEPE" },
  { icon: CalendarDays, title: "Evento Principal" },
];

/** Seção de 2 banners de destaque — aguardando imagem, texto e link de cada um. */
export default function HighlightBannersSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {banners.map((banner) => {
          const Icon = banner.icon;
          return (
            <div
              key={banner.title}
              className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-primary/20 bg-primary/5 p-10 text-center"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="font-heading text-lg font-semibold text-primary">
                {banner.title}
              </h3>
              <p className="text-sm text-text-neutral/50">Em breve</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
