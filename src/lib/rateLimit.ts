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

export const LOGIN_RATE_LIMIT_MESSAGE =
  "Muitas tentativas seguidas. Aguarde alguns minutos antes de tentar de novo.";
