import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Image from "next/image";
import QRCode from "qrcode";
import { CheckCircle2 } from "lucide-react";
import PageBanner from "@/components/layout/PageBanner";
import Card from "@/components/ui/Card";
import PrintButton from "@/components/eventos/PrintButton";
import { events } from "@/data/events";
import { sql } from "@/lib/db";

export const metadata: Metadata = {
  title: "Inscrição confirmada | IBCI",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ code?: string }>;
}

export default async function InscricaoSucessoPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { code } = await searchParams;
  const event = events.find((e) => e.slug === slug);
  if (!event || !code) notFound();

  const [attendee] = await sql`
    select name from event_attendees where event_slug = ${slug} and code = ${code}
  `;
  if (!attendee) notFound();

  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("host");
  const checkinUrl = `${proto}://${host}/checkin/validar/${code}`;

  const qrCodeDataUrl = await QRCode.toDataURL(checkinUrl, {
    margin: 1,
    width: 320,
    color: { dark: "#123B2C", light: "#FFFFFF" },
  });

  return (
    <div className="bg-bg-light">
      <PageBanner title="Inscrição confirmada!" description={event.title} />
      <div className="mx-auto max-w-md px-4 py-16 text-center sm:px-6 lg:px-8">
        <Card className="space-y-4 p-8">
          <p className="flex items-center justify-center gap-2 font-semibold text-primary">
            <CheckCircle2 className="h-5 w-5" />
            {attendee.name}
          </p>
          <p className="text-sm text-text-neutral/70">
            Apresente este QR Code na entrada. Se preferir, seu código também
            pode ser informado na recepção:
          </p>

          <div className="mx-auto w-fit rounded-xl bg-white p-3 shadow-sm">
            <Image
              src={qrCodeDataUrl}
              alt={`QR Code de check-in - ${code}`}
              width={220}
              height={220}
              unoptimized
            />
          </div>

          <div className="select-all rounded-lg bg-primary/5 px-4 py-3 font-mono text-2xl font-bold tracking-widest text-primary">
            {code}
          </div>
        </Card>

        <PrintButton />
      </div>
    </div>
  );
}
