let warned = false;

/**
 * Segredo usado para assinar (HMAC) os cookies de sessão do admin e do
 * responsável de congregação. Deveria ser um valor próprio (ADMIN_SESSION_SECRET),
 * nunca a senha de bootstrap do admin (ADMIN_PASSWORD) — reaproveitar a
 * senha como chave de assinatura significa que vazar essa única variável
 * permite forjar um cookie de sessão com qualquer permissão, sem precisar
 * de nenhuma senha real. O fallback existe só para não quebrar quem ainda
 * não configurou ADMIN_SESSION_SECRET na Vercel; avisa nos logs para isso
 * ser corrigido o quanto antes.
 */
export function getSessionSecret(): string {
  const dedicated = process.env.ADMIN_SESSION_SECRET;
  if (dedicated) return dedicated;

  const fallback = process.env.ADMIN_PASSWORD;
  if (!fallback) {
    throw new Error("ADMIN_SESSION_SECRET (ou ADMIN_PASSWORD) não configurado.");
  }
  if (!warned) {
    warned = true;
    console.warn(
      "[aviso de segurança] ADMIN_SESSION_SECRET não configurado — usando ADMIN_PASSWORD " +
        "para assinar sessões. Configure ADMIN_SESSION_SECRET (ex.: `openssl rand -hex 32`) " +
        "nas Environment Variables do projeto para não reaproveitar a senha de bootstrap."
    );
  }
  return fallback;
}
