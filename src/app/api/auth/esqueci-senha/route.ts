import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { createResetToken } from "@/lib/passwordReset";
import { sendPasswordResetEmail } from "@/lib/email";
import { isLoginRateLimited, recordLoginAttempt, LOGIN_RATE_LIMIT_MESSAGE } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const scope = body?.scope === "admin" ? "admin" : "membro";

  if (!email) {
    return NextResponse.json({ error: "Informe o e-mail." }, { status: 400 });
  }

  const rateLimitScope = `reset-${scope}`;
  if (await isLoginRateLimited(rateLimitScope, email)) {
    return NextResponse.json({ error: LOGIN_RATE_LIMIT_MESSAGE }, { status: 429 });
  }
  await recordLoginAttempt(rateLimitScope, email, false);

  const [account] =
    scope === "admin"
      ? await sql`select id, name from admin_users where email = ${email} and status = 'ativo'`
      : await sql`select id, name from members where email = ${email}`;

  // Sempre responde com sucesso genérico, exista ou não a conta — evita que
  // alguém use este formulário pra descobrir quais e-mails têm cadastro.
  if (account) {
    const token = await createResetToken(scope, account.id);
    const resetUrl = new URL("/redefinir-senha", request.url);
    resetUrl.searchParams.set("token", token);
    try {
      await sendPasswordResetEmail({ to: email, name: account.name, resetUrl: resetUrl.toString() });
    } catch (err) {
      console.error("Falha ao enviar e-mail de redefinição de senha:", err);
    }
  }

  return NextResponse.json({ ok: true });
}
