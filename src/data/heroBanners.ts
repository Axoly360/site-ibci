export interface HeroBanner {
  id: string;
  /** Ausente = slide placeholder ("em breve"), sem imagem real ainda. */
  srcDesktop?: string;
  srcMobile?: string;
  alt?: string;
  /** Para onde o banner leva ao ser clicado. Ausente = não clicável. */
  href?: string;
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
    id: "congresso-de-casais",
    srcDesktop: "/hero-2-desktop.png",
    srcMobile: "/hero-2-mobile.png",
    alt: "Congresso de Casais — 12 e 13 de setembro, das 10h às 12h, no Hotel Porto da Serra, Gravatá. Inscrições com Maurício e Gineide. Investimento R$ 350,00 por casal.",
    href: "/para-voce/eventos/congresso-de-casais",
  },
  {
    id: "conferencia-aniversario-57-anos",
    srcDesktop: "/hero-3-desktop.png",
    srcMobile: "/hero-3-mobile.png",
    alt: "Conferência de Aniversário — 57 Anos. Preletoras: Solange Paiva, Evily Menezes e Nivânia Gonçalves.",
  },
];
