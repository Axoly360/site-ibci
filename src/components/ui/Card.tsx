import type { ReactNode } from "react";

// Sistema de design IBCI. Cartão comum: marfim, filete de 1px e cantos de 16px,
// sem sombra. "emphasis" (contorno de 2px e sombra dura) marca o que a pessoa
// deve ver primeiro — no máximo um por faixa da tela. "tint" é o cartão de
// apoio em verde-névoa e "sun" é o destaque em sol (só um por tela).
type Tone = "default" | "emphasis" | "tint" | "sun";

interface CardProps {
  children: ReactNode;
  className?: string;
  tone?: Tone;
}

const toneClasses: Record<Tone, string> = {
  default:
    "rounded-2xl border border-hairline bg-white transition-colors hover:border-outline/40",
  emphasis:
    "rounded-3xl border-2 border-outline bg-white shadow-[var(--shadow-hard)]",
  tint: "rounded-2xl border border-transparent bg-nevoa",
  sun: "rounded-3xl border-2 border-on-accent bg-sol text-on-accent shadow-[var(--shadow-hard)]",
};

export default function Card({ children, className = "", tone = "default" }: CardProps) {
  return <div className={`${toneClasses[tone]} ${className}`}>{children}</div>;
}
