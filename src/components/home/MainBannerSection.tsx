import Image from "next/image";

/** Banner principal de destaque em largura total. */
export default function MainBannerSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="relative aspect-[1600/500] w-full overflow-hidden rounded-2xl">
        <Image
          src="/banner-principal.png"
          alt="Congresso de Casais — 12 e 13 de setembro, das 10h às 12h, no Hotel Porto da Serra, Gravatá. Inscrições com Maurício e Gineide. Investimento R$ 350,00 por casal."
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>
    </section>
  );
}
