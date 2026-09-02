export interface ChurchEvent {
  slug: string;
  title: string;
  description: string;
  dateLabel: string;
  location: string;
  /** Vagas totais. Ausente = sem limite de vagas. */
  capacity?: number;
}

/**
 * Eventos reais da igreja com inscrição aberta. Populado conforme os
 * eventos forem confirmados — nada aqui é inventado.
 */
export const events: ChurchEvent[] = [];
