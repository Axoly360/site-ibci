export interface HeroBanner {
  id: string;
  src: string;
  width: number;
  height: number;
  alt: string;
  /** Object-position usado só no recorte mobile (h-56). Default: "center". */
  mobileObjectPosition?: string;
}

/**
 * Banners do carrossel do Hero. Estrutura pronta para até 3 (ou mais) —
 * hoje só há 1 banner de verdade disponível; adicionar o 2º e 3º é só
 * incluir novos itens aqui.
 */
export const heroBanners: HeroBanner[] = [
  {
    id: "transmissao-ao-vivo",
    src: "/hero-transmissao-ao-vivo.jpg",
    width: 5036,
    height: 832,
    alt: "Igreja Batista Central do Ibura — Transmissão ao vivo às quartas-feiras 19h e domingos 8h30–18h. Instagram @ibci_ibura.",
    mobileObjectPosition: "90% center",
  },
];
