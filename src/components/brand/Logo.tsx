import type { CSSProperties } from "react";

type Variant = "horizontal" | "principal" | "marca";
type Tone = "cores" | "sobre-verde" | "preto" | "branco";

/**
 * Logotipo oficial da IBCI (sistema de design): SVGs vetoriais com as letras
 * em curvas, em public/brand. Escolha o tom pelo fundo: "cores" sobre linho ou
 * marfim, "sobre-verde" sobre verde-floresta, "preto"/"branco" para uma cor só.
 * Não estique, não coloque sombra nem degradê. Tamanhos mínimos: marca 24px de
 * altura; principal 72px de largura; horizontal 220px de largura.
 */
const ASPECT: Record<Variant, number> = {
  horizontal: 410 / 120,
  principal: 1,
  marca: 148 / 160,
};

export default function Logo({
  variant = "horizontal",
  tone = "cores",
  height,
  className = "",
  style,
}: {
  variant?: Variant;
  tone?: Tone;
  /** Altura em px; a largura segue a proporção do desenho. */
  height: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/brand/ibci-${variant === "marca" ? "marca" : `logo-${variant}`}-${tone}.svg`}
      alt="Igreja Batista Central do Ibura"
      height={height}
      width={Math.round(height * ASPECT[variant])}
      className={className}
      style={{ height, width: "auto", ...style }}
    />
  );
}
