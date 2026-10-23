import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

// Sistema de design IBCI: botão em pílula com contorno de 2px.
//  - primary: ação principal (verde-floresta com texto linho)
//  - sun: a ÚNICA chamada de destaque da tela (sol com sombra dura em sálvia)
//  - ghost: ação secundária (só contorno)
//  - outline: sobre fundo verde (contorno e texto claros)
// "secondary" é apelido antigo de primary.
type Variant = "primary" | "sun" | "ghost" | "outline" | "secondary";
type Size = "sm" | "md" | "lg";

interface CommonProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
}

interface ButtonAsLink extends CommonProps {
  href: string;
  external?: boolean;
  onClick?: never;
  type?: never;
}

interface ButtonAsButton
  extends CommonProps,
    Pick<ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "type" | "disabled" | "aria-label"> {
  href?: undefined;
  external?: never;
}

type ButtonProps = ButtonAsLink | ButtonAsButton;

const primary = "border-outline bg-action text-action-ink hover:bg-action-hover";

const variantClasses: Record<Variant, string> = {
  primary,
  secondary: primary,
  sun:
    "border-outline bg-sol text-on-accent shadow-[var(--shadow-hard)] hover:-translate-x-px hover:-translate-y-px motion-reduce:hover:transform-none",
  ghost: "border-outline bg-transparent text-ink hover:bg-nevoa",
  outline: "border-white bg-transparent text-white hover:bg-white hover:text-primary",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-[22px] py-3 text-[15px]",
  lg: "px-7 py-4 text-[17px]",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-full border-2 font-bold tracking-[0.01em] transition-[transform,background-color,box-shadow] duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none";

export default function Button(props: ButtonProps) {
  const { children, variant = "primary", size = "md", className = "" } = props;

  const classes = `${base} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  if ("href" in props && props.href) {
    const { href, external } = props;
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  const { onClick, type = "button", disabled, ...rest } = props as ButtonAsButton;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
      aria-label={rest["aria-label"]}
    >
      {children}
    </button>
  );
}
