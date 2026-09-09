import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageBanner from "@/components/layout/PageBanner";
import InscricaoVisitanteForm from "@/components/eventos/InscricaoVisitanteForm";
import { events } from "@/data/events";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = events.find((e) => e.slug === slug);
  return {
    title: event
      ? `Inscrição — ${event.title} | IBCI`
      : "Inscrição em Evento | IBCI",
  };
}

export default async function InscricaoVisitantePage({ params }: PageProps) {
  const { slug } = await params;
  const event = events.find((e) => e.slug === slug);
  if (!event) notFound();

  return (
    <div className="bg-bg-light">
      <PageBanner
        title={`Check-in — ${event.title}`}
        description="Preencha seus dados para gerar seu QR Code de entrada."
      />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <InscricaoVisitanteForm eventSlug={event.slug} />
      </div>
    </div>
  );
}
