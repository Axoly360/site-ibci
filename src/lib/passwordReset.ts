import { randomBytes } from "crypto";
import { sql } from "@/lib/db";

const TOKEN_TTL_MS = 1000 * 60 * 30; // 30 minutos

export type ResetScope = "admin" | "membro";

export async function createResetToken(scope: ResetScope, accountId: string): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS).toISOString();
  await sql`
    insert into password_reset_tokens (token, scope, account_id, expires_at)
    values (${token}, ${scope}, ${accountId}, ${expiresAt})
  `;
  return token;
}

interface ConsumedToken {
  scope: ResetScope;
  accountId: string;
}

/** Valida o token (existe, não usado, não expirado) e já marca como usado —
 * atômico, pra não dar pra reaproveitar o mesmo link duas vezes mesmo em
 * requisições simultâneas. */
export async function consumeResetToken(token: string): Promise<ConsumedToken | null> {
  const [row] = await sql`
    update password_reset_tokens
    set used_at = now()
    where token = ${token} and used_at is null and expires_at > now()
    returning scope, account_id
  `;
  if (!row) return null;
  return { scope: row.scope, accountId: row.account_id };
}
