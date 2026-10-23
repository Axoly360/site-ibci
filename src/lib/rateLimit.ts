import { sql } from "@/lib/db";

const WINDOW_MINUTES = 15;
const MAX_FAILED_ATTEMPTS = 5;

/**
 * Rate limit simples para os formulários de login, persistido no banco (não
 * em memória) — em memória não funcionaria de forma confiável aqui, já que
 * cada invocação serverless pode rodar numa instância diferente. Antes
 * disso, login de admin/membro/congregação aceitava tentativas ilimitadas
 * de força bruta.
 */
export async function isLoginRateLimited(scope: string, identifier: string): Promise<boolean> {
  const cutoff = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString();
  const [{ count }] = await sql`
    select count(*)::int as count from login_attempts
    where scope = ${scope} and identifier = ${identifier}
      and success = false and created_at > ${cutoff}
  `;
  return count >= MAX_FAILED_ATTEMPTS;
}

export async function recordLoginAttempt(
  scope: string,
  identifier: string,
  success: boolean
): Promise<void> {
  await sql`
    insert into login_attempts (scope, identifier, success)
    values (${scope}, ${identifier}, ${success})
  `;
  // Limpeza oportunista (2% das chamadas) — mantém a tabela pequena sem
  // precisar de um job/cron separado só para isso.
  if (Math.random() < 0.02) {
    await sql`delete from login_attempts where created_at < now() - interval '7 days'`;
  }
}

/** IP do visitante atrás da Vercel (primeiro endereço de x-forwarded-for). */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "desconhecido";
}

/**
 * Limite para formulários públicos (cadastro, inscrição): conta cada envio
 * como uma tentativa na mesma tabela do login. Os tetos devem ser generosos —
 * numa rede compartilhada (Wi-Fi da igreja, internet móvel) muita gente divide
 * o mesmo IP; o objetivo é barrar robôs, não pessoas.
 */
export async function isFormRateLimited(
  scope: string,
  identifier: string,
  maxAttempts: number,
  windowMinutes = 15
): Promise<boolean> {
  const cutoff = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();
  const [{ count }] = await sql`
    select count(*)::int as count from login_attempts
    where scope = ${scope} and identifier = ${identifier} and created_at > ${cutoff}
  `;
  if (count >= maxAttempts) return true;
  await recordLoginAttempt(scope, identifier, false);
  return false;
}

export const LOGIN_RATE_LIMIT_MESSAGE =
  "Muitas tentativas seguidas. Aguarde alguns minutos antes de tentar de novo.";
