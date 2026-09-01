export interface HeroBanner {
  id: string;
  /** Ausente = slide placeholder ("em breve"), sem imagem real ainda. */
  srcDesktop?: string;
  srcMobile?: string;
  alt?: string;
  /** Título curto mostrado no slide placeholder, quando não há imagem. */
  placeholderTitle?: string;
}

/**
 * Banners do carrossel do Hero. Cada slide usa duas artes já produzidas
 * nas dimensões exatas de exibição — sem corte via CSS:
 * - Mobile: 390x546
 * - Desktop/tablet: 1360x460
 * Estrutura pronta para até 3 (ou mais) banners; os placeholders "em
 * breve" viram reais assim que a arte chegar.
 */
export const heroBanners: HeroBanner[] = [
  {
    id: "uma-familia-para-pertencer",
    srcDesktop: "/hero-1-desktop.png",
    srcMobile: "/hero-1-mobile.png",
    alt: "Igreja Batista Central do Ibura — Uma família para pertencer. Transmissão ao vivo às quartas-feiras 19h e domingos 8h30–19h00.",
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
