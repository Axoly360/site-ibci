import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import {
  CONGREGATION_COOKIE,
  congregationCookieOptions,
  createCongregationCookieValue,
} from "@/lib/congregation-session";
import { isLoginRateLimited, recordLoginAttempt, LOGIN_RATE_LIMIT_MESSAGE } from "@/lib/rateLimit";

const SCOPE = "congregacao";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json({ error: "E-mail e senha são obrigatórios." }, { status: 400 });
  }

  // Identificador inclui o slug: um bloqueio numa congregação não afeta
  // o mesmo e-mail tentando logar em outra por engano.
  const rateLimitId = `${slug}:${email}`;
  if (await isLoginRateLimited(SCOPE, rateLimitId)) {
    return NextResponse.json({ error: LOGIN_RATE_LIMIT_MESSAGE }, { status: 429 });
  }

  const [congregation] = await sql`select id, name, slug from congregations where slug = ${slug}`;
  if (!congregation) {
    return NextResponse.json({ error: "Congregação não encontrada." }, { status: 404 });
  }

  const [user] = await sql`
    select id, name, email, password_hash, status from congregation_users
    where email = ${email} and congregation_id = ${congregation.id}
  `;

  if (!user) {
    await recordLoginAttempt(SCOPE, rateLimitId, false);
    return NextResponse.json({ error: "E-mail ou senha inválidos." }, { status: 401 });
  }
  if (user.status !== "ativo") {
    await recordLoginAttempt(SCOPE, rateLimitId, false);
    return NextResponse.json({ error: "Este acesso está desativado." }, { status: 403 });
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    await recordLoginAttempt(SCOPE, rateLimitId, false);
    return NextResponse.json({ error: "E-mail ou senha inválidos." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(
    CONGREGATION_COOKIE,
    createCongregationCookieValue({
      id: user.id,
      name: user.name,
      email: user.email,
      congregationId: congregation.id,
      congregationSlug: congregation.slug,
      congregationName: congregation.name,
    }),
    congregationCookieOptions
  );
  await recordLoginAttempt(SCOPE, rateLimitId, true);
  return response;
}
