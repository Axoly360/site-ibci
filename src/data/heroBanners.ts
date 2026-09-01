export interface HeroBanner {
  id: string;
  /** Ausente = slide placeholder ("em breve"), sem imagem real ainda. */
  src?: string;
  alt?: string;
  /** Título curto mostrado no slide placeholder, quando não há `src`. */
  placeholderTitle?: string;
  /**
   * Object-position do corte (o quadro é fixo em 16:9 / 1920×1080 em todas
   * as telas). Default: "center". Ajuste aqui se a imagem original tiver
   * outra proporção e o conteúdo importante ficar fora do corte.
   */
  objectPosition?: string;
}

/**
 * Banners do carrossel do Hero. Quadro de exibição padronizado em
 * 1920x1080 (16:9) para todas as telas — imagens fora dessa proporção são
 * cortadas (object-cover) usando `objectPosition`. Estrutura pronta para
 * até 3 (ou mais) banners; os placeholders "em breve" viram reais assim
 * que a arte (já pensada pra 1920x1080) chegar.
 */
export const heroBanners: HeroBanner[] = [
  {
    id: "transmissao-ao-vivo",
    src: "/hero-transmissao-ao-vivo.jpg",
    alt: "Igreja Batista Central do Ibura — Transmissão ao vivo às quartas-feiras 19h e domingos 8h30–18h. Instagram @ibci_ibura.",
    // Imagem original é 5036x832 (~6:1) — bem mais larga que o quadro
    // 16:9. O corte foca à direita pra manter "Transmissão ao vivo" e os
    // horários visíveis, sacrificando o texto da esquerda (redundante com
    // o header) e boa parte da foto do pastor.
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
