import type { ReactNode } from "react";

// Etiqueta em pílula do sistema de design: "sage" para categorias, "sun" para
// o que está acontecendo agora, "ink" para novidade; sem tom, só contorno.
// Texto curto, até duas palavras.
type Tone = "outline" | "sage" | "sun" | "ink";

const toneClasses: Record<Tone, string> = {
  outline: "border-outline bg-transparent text-ink",
  sage: "border-on-accent bg-salvia text-on-accent",
  sun: "border-on-accent bg-sol text-on-accent",
  ink: "border-action bg-action text-action-ink",
};

export default function Pill({
  children,
  tone = "outline",
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border-[1.5px] px-3.5 py-[7px] text-xs font-bold leading-none tracking-[0.08em] ${toneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
