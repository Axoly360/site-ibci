import type { CSSProperties } from "react";

type Pose = "acenar" | "ler" | "orar" | "celebrar" | "marca";

/**
 * Ibi, o cordeirinho mascote da IBCI (kit de marca): SVGs em public/brand/ibi.
 * Escolha a pose pelo assunto: acenar (boas-vindas), ler (Bíblia, estudos),
 * orar (oração), celebrar (conquistas), marca (rosto, peças pequenas).
 * Regras do guia: um Ibi por tela, como apoio; nunca em luto, finanças
 * sensíveis ou avisos de disciplina; sem texto por cima; sem mudar cores.
 * "animado" usa o SVG com animação em CSS (respeita reduzir movimento).
 */
export default function Ibi({
  pose,
  size = 160,
  halo = true,
  animado = false,
  className = "",
  style,
  alt = "",
}: {
  pose: Pose;
  /** Lado em px: todas as poses são quadradas. */
  size?: number;
  /** Sem halo só em peças muito pequenas ou de uma cor. */
  halo?: boolean;
  animado?: boolean;
  className?: string;
  style?: CSSProperties;
  /** O Ibi é decorativo: deixe alt="" salvo quando ele for a única informação. */
  alt?: string;
}) {
  const file = animado ? `${pose}-animado` : halo ? pose : `${pose}-sem-halo`;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/brand/ibi/ibi-${file}.svg`}
      alt={alt}
      aria-hidden={alt === "" ? true : undefined}
      height={size}
      width={size}
      className={className}
      style={{ height: size, width: "auto", ...style }}
    />
  );
}
