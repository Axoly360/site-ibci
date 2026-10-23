import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { sql } from "@/lib/db";
import { sendConfirmationEmail } from "@/lib/email";
import { getEventBySlug } from "@/lib/events";
import { getClientIp, isFormRateLimited, LOGIN_RATE_LIMIT_MESSAGE } from "@/lib/rateLimit";

const TOKEN_TTL_MS = 1000 * 60 * 30; // 30 minutos

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email =
    typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const eventSlug =
    typeof body?.eventSlug === "string" ? body.eventSlug : undefined;
  const next = typeof body?.next === "string" ? body.next : undefined;

  if (!name || !email || !email.includes("@")) {
    return NextResponse.json(
      { error: "Nome e e-mail válidos são obrigatórios." },
      { status: 400 }
    );
  }

  // Cada envio manda um e-mail para um endereço escolhido por quem preenche:
  // limita por IP e, principalmente, por destinatário, para o formulário não
  // virar ferramenta de spam contra uma pessoa.
  if (
    (await isFormRateLimited("form-magic-link-ip", getClientIp(request), 30)) ||
    (await isFormRateLimited("form-magic-link-email", email, 3))
  ) {
    return NextResponse.json({ error: LOGIN_RATE_LIMIT_MESSAGE }, { status: 429 });
  }

  const event = eventSlug ? await getEventBySlug(eventSlug) : null;
  if (eventSlug && !event) {
    return NextResponse.json({ error: "Evento não encontrado." }, { status: 404 });
  }

  // Se o e-mail já tem cadastro, o nome existente é mantido: antes, este
  // formulário público sobrescrevia o nome de qualquer membro (inclusive já
  // validado) só por digitar o e-mail dele. O "do update" é apenas para o
  // RETURNING devolver a linha existente.
  const [member] = await sql`
    insert into members (name, email)
    values (${name}, ${email})
    on conflict (email) do update set email = excluded.email
    returning id, name, email
  `;

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS).toISOString();

  await sql`
    insert into login_tokens (token, member_id, event_slug, next_path, expires_at)
    values (${token}, ${member.id}, ${eventSlug ?? null}, ${next ?? null}, ${expiresAt})
  `;

  const confirmUrl = new URL("/api/auth/confirmar", request.url);
  confirmUrl.searchParams.set("token", token);

  try {
    await sendConfirmationEmail({
      to: email,
      name,
      confirmUrl: confirmUrl.toString(),
      eventTitle: event?.title,
    });
  } catch (err) {
    // Sem isso, uma falha de envio (ex.: domínio do Resend não verificado)
    // derrubava a rota com 500 genérico DEPOIS de já ter criado o cadastro e
    // o token — a pessoa nunca recebia o e-mail e via um erro sem sentido.
    console.error("Falha ao enviar e-mail de confirmação:", err);
    return NextResponse.json(
      {
        error:
          "Não foi possível enviar o e-mail de confirmação agora. Tente novamente em alguns minutos ou fale com a secretaria.",
      },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
