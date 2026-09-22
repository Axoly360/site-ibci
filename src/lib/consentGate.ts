import { sql } from "@/lib/db";
import { CONSENT_TERMS } from "@/lib/consentTerms";

/**
 * Antes, só a tela de Servir cobrava aceite dos termos de consentimento
 * (LGPD) — o resto da Central do Membro nunca checava isso, então um termo
 * novo adicionado depois (ou um membro que nunca abriu Servir) nunca era
 * forçado a aceitar. Use isto nas páginas da Central do Membro (depois do
 * `is_validated_member`) para redirecionar a `/central-do-membro/consentimento`
 * enquanto houver termo pendente.
 */
export async function hasMissingConsent(memberId: string): Promise<boolean> {
  const accepted = await sql`
    select term_key from member_consents where member_id = ${memberId}
  `;
  const acceptedKeys = new Set(accepted.map((a: { term_key: string }) => a.term_key));
  return CONSENT_TERMS.some((term) => !acceptedKeys.has(term.key));
}
