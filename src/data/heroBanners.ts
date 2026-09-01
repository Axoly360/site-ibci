export interface HeroBanner {
  id: string;
  /** Ausente = slide placeholder ("em breve"), sem imagem real ainda. */
  src?: string;
  alt?: string;
  /** Título curto mostrado no slide placeholder, quando não há `src`. */
  placeholderTitle?: string;
  /**
   * Object-position do corte usado só no desktop/tablet (quadro fixo
   * 1360x460, object-cover). Default: "center". No mobile (quadro
   * 390x546) a imagem é sempre exibida inteira, sem corte — não precisa
   * de position.
   */
  objectPosition?: string;
}

/**
 * Banners do carrossel do Hero. Quadros de exibição fixos:
 * - Mobile: 390x546 — imagem inteira, sem corte (object-contain).
 * - Desktop/tablet: 1360x460 — recorte focado (object-cover +
 *   `objectPosition`).
 * Estrutura pronta para até 3 (ou mais) banners; os placeholders "em
 * breve" viram reais assim que a arte chegar.
 */
export const heroBanners: HeroBanner[] = [
  {
    id: "transmissao-ao-vivo",
    src: "/hero-transmissao-ao-vivo.jpg",
    alt: "Igreja Batista Central do Ibura — Transmissão ao vivo às quartas-feiras 19h e domingos 8h30–18h. Instagram @ibci_ibura.",
    // Imagem original é 5036x832 (~6:1). No desktop (1360x460) o corte
    // foca à direita pra manter "Transmissão ao vivo" e os horários
    // visíveis (testado e confirmado). No mobile (390x546) não há corte —
    // essa proporção é alta demais pra recortar sem perder o texto.
    objectPosition: "90% center",
  },
  {
    id: "banner-2",
    placeholderTitle: "Banner 2",
  },
  {
    id: "banner-3",
    placeholderTitle: "Banner 3",
  },
];
