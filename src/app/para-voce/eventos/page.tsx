import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, MapPin, CheckCircle2, XCircle } from "lucide-react";
import PageBanner from "@/components/layout/PageBanner";
import ComingSoon from "@/components/layout/ComingSoon";
import Card from "@/components/ui/Card";
import { events } from "@/data/events";

export const metadata: Metadata = {
  title: "Eventos | IBCI - Igreja Batista Central do Ibura",
  description: "Eventos da Igreja Batista Central do Ibura.",
};

export default async function EventosPage({
  searchParams,
}: {
  searchParams: Promise<{ confirmado?: string; erro?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="bg-bg-light">
      <PageBanner title="Eventos" />

      {params.confirmado && (
        <div className="mx-auto mt-8 flex max-w-2xl items-center gap-2 rounded-xl bg-primary/10 px-4 py-3 text-sm font-medium text-primary">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          E-mail confirmado com sucesso!
        </div>
      )}
      {params.erro === "link-invalido" && (
        <div className="mx-auto mt-8 flex max-w-2xl items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <XCircle className="h-5 w-5 shrink-0" />
          Esse link de confirmação é inválido ou já expirou.
        </div>
      )}

      {events.length === 0 ? (
        <ComingSoon label="a agenda de eventos" />
      ) : (
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Link key={event.slug} href={`/para-voce/eventos/${event.slug}`}>
                <Card className="flex h-full flex-col gap-3 p-6">
                  <h2 className="font-heading text-lg font-semibold text-primary">
                    {event.title}
                  </h2>
                  <p className="flex items-center gap-2 text-sm text-text-neutral/80">
                    <CalendarDays className="h-4 w-4 shrink-0 text-secondary" />
                    {event.dateLabel}
                  </p>
                  <p className="flex items-center gap-2 text-sm text-text-neutral/80">
                    <MapPin className="h-4 w-4 shrink-0 text-secondary" />
                    {event.location}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
