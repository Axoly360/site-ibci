import type { ReactNode } from "react";

interface PageBannerProps {
  title: string;
  description?: ReactNode;
}

export default function PageBanner({ title, description }: PageBannerProps) {
  return (
    <section className="bg-primary px-4 py-16 text-white sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-heading text-3xl font-bold sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/80 sm:text-lg">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
