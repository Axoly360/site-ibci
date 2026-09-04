import Link from "next/link";
import { CalendarDays, MapPin, Construction } from "lucide-react";
import Card from "@/components/ui/Card";
import Carousel from "@/components/ui/Carousel";
import { events } from "@/data/events";

/** Eventos do mês — carrossel na home, logo abaixo de Últimas Mensagens. */
export default function EventsOfMonthSection() {
  return (
    <section className="bg-primary/[0.03] py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold text-primary sm:text-4xl">
            Eventos do Mês
          </h2>
          <p className="mt-3 text-text-neutral/80">
            Fique por dentro dos próximos eventos da nossa igreja.
          </p>
        </div>

        <div className="mt-10">
          {events.length === 0 ? (
            <div className="mx-auto flex max-w-md flex-col items-center gap-2 rounded-2xl border border-dashed border-primary/20 bg-white p-10 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Construction className="h-6 w-6" />
              </span>
              <p className="font-heading text-lg font-semibold text-primary">
                Em breve
              </p>
              <p className="text-sm text-text-neutral/60">
                Nenhum evento programado no momento.
              </p>
            </div>
          ) : (
            <Carousel>
              {events.map((event) => (
                <Link
                  key={event.slug}
                  href={`/para-voce/eventos/${event.slug}`}
                  className="w-72 shrink-0 sm:w-80"
                >
                  <Card className="flex h-full flex-col gap-3 p-6">
                    <h3 className="font-heading text-lg font-semibold text-primary">
                      {event.title}
                    </h3>
                    <p className="flex items-center gap-2 text-sm text-text-neutral/80">
                      <CalendarDays className="h-4 w-4 shrink-0 text-secondary" />
                      {event.dateLabel}
                    </p>
                    <p className="flex items-center gap-2 text-sm text-text-neutral/80">
                      <MapPin className="h-4 w-4 shrink-0 text-secondary" />
                      {event.location}
                    </p>
                    <span className="mt-auto text-sm font-semibold text-secondary">
                      Saiba mais →
                    </span>
                  </Card>
                </Link>
              ))}
            </Carousel>
          )}
        </div>
      </div>
    </section>
  );
}
