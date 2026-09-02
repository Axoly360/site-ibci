import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin, MessageCircle } from "lucide-react";
import PageBanner from "@/components/layout/PageBanner";
import InscricaoForm from "@/components/eventos/InscricaoForm";
import Button from "@/components/ui/Button";
import { events } from "@/data/events";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/session";
import { churchInfo } from "@/data/churchInfo";

interface EventoPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: EventoPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = events.find((e) => e.slug === slug);
  return {
    title: event
      ? `${event.title} | IBCI - Igreja Batista Central do Ibura`
      : "Evento | IBCI",
  };
}

export default async function EventoPage({ params }: EventoPageProps) {
  const { slug } = await params;
  const event = events.find((e) => e.slug === slug);
  if (!event) notFound();

  // Eventos com contato externo (ex.: pagos, combinados com um responsável)
  // não usam o fluxo de conta/e-mail nem o banco de dados.
  if (event.externalContact) {
    const waLink = `${churchInfo.social.whatsapp}?text=${encodeURIComponent(
      event.externalContact.whatsappMessage
    )}`;

    return (
      <div className="bg-bg-light">
        <PageBanner title={event.title} />

        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-md flex-col gap-2 text-left sm:flex-row sm:justify-center sm:gap-8">
            <p className="flex items-center gap-2 text-sm text-text-neutral/80">
              <CalendarDays className="h-4 w-4 shrink-0 text-secondary" />
              {event.dateLabel}
            </p>
            <p className="flex items-center gap-2 text-sm text-text-neutral/80">
              <MapPin className="h-4 w-4 shrink-0 text-secondary" />
              {event.location}
            </p>
          </div>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-text-neutral/80">
            {event.description}
          </p>

          {event.price && (
            <p className="mt-4 text-sm font-semibold text-primary">
              {event.price}
            </p>
          )}

          <div className="mt-10">
            <Button href={waLink} external variant="primary">
              <MessageCircle className="h-5 w-5" />
              {event.externalContact.label}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const session = await getSession();

  const [{ count: registeredCount }] = await sql`
    select count(*)::int as count from registrations where event_slug = ${slug}
  `;

  let alreadyRegistered = false;
  if (session) {
    const [row] = await sql`
      select 1 from registrations where event_slug = ${slug} and member_id = ${session.memberId}
    `;
    alreadyRegistered = Boolean(row);
  }

  const soldOut = Boolean(event.capacity) && registeredCount >= (event.capacity ?? 0);

  return (
    <div className="bg-bg-light">
      <PageBanner title={event.title} />

      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-md flex-col gap-2 text-left sm:flex-row sm:justify-center sm:gap-8">
          <p className="flex items-center gap-2 text-sm text-text-neutral/80">
            <CalendarDays className="h-4 w-4 shrink-0 text-secondary" />
            {event.dateLabel}
          </p>
          <p className="flex items-center gap-2 text-sm text-text-neutral/80">
            <MapPin className="h-4 w-4 shrink-0 text-secondary" />
            {event.location}
          </p>
        </div>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-text-neutral/80">
          {event.description}
        </p>

        {event.capacity && (
          <p className="mt-4 text-sm font-semibold text-primary">
            {Math.max(event.capacity - registeredCount, 0)} de {event.capacity}{" "}
            vagas disponíveis
          </p>
        )}

        <div className="mt-10">
          <InscricaoForm
            eventSlug={event.slug}
            session={session}
            alreadyRegistered={alreadyRegistered}
            soldOut={soldOut}
          />
        </div>
      </div>
    </div>
  );
}
