export interface ChurchEvent {
  slug: string;
  title: string;
  description: string;
  dateLabel: string;
  location: string;
  /** Vagas totais (só usado quando a inscrição é pelo site). */
  capacity?: number;
  price?: string;
  /**
   * Quando definido, a inscrição de verdade acontece por fora do site (ex.:
   * evento pago, combinado com um responsável) — a página mostra um contato
   * em vez do fluxo de conta/e-mail.
   */
  externalContact?: {
    label: string;
    whatsappMessage: string;
  };
}

/**
 * Eventos reais da igreja. Populado conforme os eventos forem confirmados —
 * nada aqui é inventado.
 */
export const events: ChurchEvent[] = [
  {
    slug: "congresso-de-casais",
    title: "Congresso de Casais IBCI",
    description:
      "Está chegando o nosso Congresso de Casais, que acontecerá no Hotel Porto da Serra, em Gravatá, nos dias 12 e 13 de setembro. Teremos uma programação muito especial e emocionante, preparada com muito carinho para abençoar nossas famílias e fortalecer nossos casamentos. Serão mais de 40 casais desfrutando juntos desse momento tão especial. Além da presença dos nossos pastores e líderes, teremos conosco, no sábado pela manhã, ministrando a Palavra de Deus, o Pr. Gilberto Paz, da Igreja Batista Betânia, em Gravatá, e Presidente da OPBPE.",
    dateLabel: "12 e 13 de setembro — Hotel Porto da Serra, Gravatá",
    location: "Hotel Porto da Serra, Gravatá - PE",
    price: "R$ 350,00 por casal",
    externalContact: {
      label: "Falar com Maurício e Gineide",
      whatsappMessage:
        "Olá! Gostaria de me inscrever no Congresso de Casais IBCI, com Maurício e Gineide.",
    },
  },
];
