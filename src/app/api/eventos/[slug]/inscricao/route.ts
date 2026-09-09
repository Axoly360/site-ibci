import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { sql } from "@/lib/db";
import { events } from "@/data/events";
import { generateCheckinCode } from "@/lib/checkinCode";
import { sendCheckinQrEmail } from "@/lib/email";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const event = events.find((e) => e.slug === slug);
  if (!event) {
    return NextResponse.json({ error: "Evento não encontrado." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";

  if (!name) {
    return NextResponse.json({ error: "Informe seu nome." }, { status: 400 });
  }
  if (!phone) {
    return NextResponse.json({ error: "Informe seu telefone/WhatsApp." }, { status: 400 });
  }

  let code = "";
  let inserted = false;
  for (let attempt = 0; attempt < 5 && !inserted; attempt++) {
    code = generateCheckinCode();
    try {
      await sql`
        insert into event_attendees (event_slug, name, phone, email, code)
        values (${slug}, ${name}, ${phone}, ${email || null}, ${code})
      `;
      inserted = true;
    } catch (err) {
      // Colisão de código único (extremamente raro) — tenta de novo com outro.
      const message = err instanceof Error ? err.message : "";
      if (!message.includes("event_attendees_code_key")) throw err;
    }
  }

  if (!inserted) {
    return NextResponse.json(
      { error: "Não foi possível gerar seu código. Tente novamente." },
      { status: 500 }
    );
  }

  // Envio do QR por e-mail é nice-to-have — não bloqueia a inscrição se falhar
  // (ex.: RESEND_API_KEY ainda não configurado).
  if (email) {
    try {
      const proto = request.headers.get("x-forwarded-proto") ?? "https";
      const host = request.headers.get("host");
      const checkinUrl = `${proto}://${host}/checkin/validar/${code}`;
      const qrBuffer = await QRCode.toBuffer(checkinUrl, { margin: 1, width: 320 });
      await sendCheckinQrEmail({
        to: email,
        name,
        eventTitle: event.title,
        code,
        qrBase64: qrBuffer.toString("base64"),
      });
    } catch {
      // Ignorado de propósito — a pessoa ainda vê o QR na tela de confirmação.
    }
  }

  return NextResponse.json({ ok: true, code });
}
