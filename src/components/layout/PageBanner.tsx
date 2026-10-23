import type { ReactNode } from "react";

interface PageBannerProps {
  title: string;
  description?: ReactNode;
}

// Faixa institucional em verde-floresta (sistema de design IBCI): título em
// Fraunces, texto em linho e um filete dourado de 1px na base — o dourado só
// decora, nunca vira texto.
export default function PageBanner({ title, description }: PageBannerProps) {
  return (
    <section className="border-b border-gold-line bg-primary px-4 py-16 text-white sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-heading text-3xl font-semibold tracking-[-0.01em] sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/85 sm:text-lg">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
