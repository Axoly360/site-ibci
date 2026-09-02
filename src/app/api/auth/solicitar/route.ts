import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { sql } from "@/lib/db";
import { sendConfirmationEmail } from "@/lib/email";
import { events } from "@/data/events";

const TOKEN_TTL_MS = 1000 * 60 * 30; // 30 minutos

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email =
    typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const eventSlug =
    typeof body?.eventSlug === "string" ? body.eventSlug : undefined;

  if (!name || !email || !email.includes("@")) {
    return NextResponse.json(
      { error: "Nome e e-mail válidos são obrigatórios." },
      { status: 400 }
    );
  }

  const event = eventSlug ? events.find((e) => e.slug === eventSlug) : null;
  if (eventSlug && !event) {
    return NextResponse.json({ error: "Evento não encontrado." }, { status: 404 });
  }

  const [member] = await sql`
    insert into members (name, email)
    values (${name}, ${email})
    on conflict (email) do update set name = excluded.name
    returning id, name, email
  `;

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS).toISOString();

  await sql`
    insert into login_tokens (token, member_id, event_slug, expires_at)
    values (${token}, ${member.id}, ${eventSlug ?? null}, ${expiresAt})
  `;

  const confirmUrl = new URL("/api/auth/confirmar", request.url);
  confirmUrl.searchParams.set("token", token);

  await sendConfirmationEmail({
    to: email,
    name,
    confirmUrl: confirmUrl.toString(),
    eventTitle: event?.title,
  });

  return NextResponse.json({ ok: true });
}
