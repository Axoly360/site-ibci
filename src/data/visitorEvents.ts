/**
 * Eventos pré-definidos para o cadastro de visitante (QR fixo por culto/
 * evento). Não tem relação com src/data/events.ts (eventos com página e
 * inscrição própria) — aqui é só uma etiqueta usada para gerar o QR e depois
 * filtrar a listagem de visitantes no admin.
 */
export const VISITOR_EVENT_OPTIONS = [
  { slug: "culto-manha", label: "Culto Manhã" },
  { slug: "culto-noite", label: "Culto Noite" },
  { slug: "culto-de-oracao", label: "Culto de Oração" },
  { slug: "conferencia", label: "Conferência" },
];

export function visitorEventLabel(slug: string): string {
  return VISITOR_EVENT_OPTIONS.find((e) => e.slug === slug)?.label ?? slug;
}
