import type { Metadata } from "next";
import Image from "next/image";
import QRCode from "qrcode";
import { Heart, QrCode, ShieldCheck, Building2 } from "lucide-react";
import { churchInfo, generatePixPayload } from "@/data/churchInfo";
import Card from "@/components/ui/Card";
import CopyPixKey from "@/components/contribuicoes/CopyPixKey";

export const metadata: Metadata = {
  title: "Dízimos e Ofertas | IBCI - Igreja Batista Central do Ibura",
  description:
    "Contribua com dízimos e ofertas para a Igreja Batista Central do Ibura via PIX ou transferência bancária.",
};

export default async function ContribuicoesPage() {
  // Payload estático BR Code (EMV) do Banco Central — o app do banco
  // reconhece automaticamente o recebedor institucional ao escanear.
  const pixPayload = generatePixPayload({
    key: churchInfo.pix.keyRaw,
    merchantName: churchInfo.pix.merchantName,
    merchantCity: churchInfo.pix.merchantCity,
    txid: churchInfo.pix.txid,
  });

  const qrCodeDataUrl = await QRCode.toDataURL(pixPayload, {
    margin: 1,
    width: 320,
    color: {
      dark: "#0F2C59",
      light: "#FFFFFF",
    },
  });

  return (
    <div className="bg-bg-light">
      {/* Banner Header */}
      <section className="bg-primary px-4 py-16 text-white sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <h1 className="font-heading text-3xl font-bold sm:text-4xl lg:text-5xl">
            Dízimos e Ofertas
          </h1>
          <p className="mx-auto max-w-2xl text-base italic text-white/80 sm:text-lg">
            &ldquo;Cada um contribua segundo propôs no seu coração, não com
            tristeza ou por necessidade; porque Deus ama ao que dá com
            alegria.&rdquo;
          </p>
          <span className="block text-sm font-semibold text-secondary">
            — 2 Coríntios 9:7
          </span>
        </div>
      </section>

      <div className="mx-auto max-w-4xl space-y-12 px-4 py-16 sm:px-6 lg:px-8">
        {/* Por que Contribuir */}
        <Card className="space-y-4 p-8 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10 text-secondary">
            <Heart className="h-6 w-6" />
          </span>
          <h2 className="font-heading text-2xl font-bold text-primary">
            A Importância da sua Oferta
          </h2>
          <p className="mx-auto max-w-2xl leading-relaxed text-text-neutral/80">
            A sua contribuição voluntária sustenta os projetos sociais no
            bairro do Ibura, a manutenção do nosso templo, o apoio a
            missionários e as ações evangelísticas da nossa igreja.
          </p>
        </Card>

        {/* Box PIX */}
        <section className="space-y-8 rounded-2xl bg-primary p-8 text-white shadow-md sm:p-12">
          <div className="space-y-2 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary/20 px-3 py-1 text-sm font-medium text-secondary">
              <QrCode className="h-4 w-4" />
              Forma mais rápida e sem taxas
            </span>
            <h3 className="font-heading text-2xl font-bold sm:text-3xl">
              Contribua via PIX
            </h3>
            <p className="text-sm text-white/70">
              Aponte a câmera do seu banco para o QR Code ou copie a chave
              abaixo para contribuir de qualquer instituição.
            </p>
          </div>

          <div className="mx-auto max-w-md space-y-6 rounded-xl border border-white/20 bg-white/10 p-6 text-center backdrop-blur-md">
            <div className="mx-auto w-fit rounded-xl bg-white p-3 shadow-sm">
              <Image
                src={qrCodeDataUrl}
                alt={`QR Code PIX - ${churchInfo.pix.key}`}
                width={220}
                height={220}
                unoptimized
              />
            </div>

            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-white/70">
                Chave PIX ({churchInfo.pix.keyType})
              </span>
              <div className="mt-2 select-all rounded-lg bg-black/20 px-4 py-3 font-mono text-xl font-bold tracking-wider text-secondary">
                {churchInfo.pix.key}
              </div>
            </div>

            <CopyPixKey pixKey={churchInfo.pix.key} />
          </div>
        </section>

        {/* Transparência e Dados Institucionais */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card className="space-y-3 p-6">
            <div className="flex items-center gap-3 text-primary">
              <Building2 className="h-6 w-6 text-secondary" />
              <h4 className="font-heading text-lg font-bold">
                Dados Institucionais
              </h4>
            </div>
            <ul className="space-y-2 border-t border-black/5 pt-3 text-sm text-text-neutral/80">
              <li>
                <strong className="text-text-neutral">Razão Social:</strong>{" "}
                {churchInfo.fullName}
              </li>
              <li>
                <strong className="text-text-neutral">CNPJ:</strong>{" "}
                {churchInfo.cnpj}
              </li>
              <li>
                <strong className="text-text-neutral">Localização:</strong>{" "}
                {churchInfo.address.neighborhood}, {churchInfo.address.city} -{" "}
                {churchInfo.address.state}
              </li>
              <li className="pt-2 font-semibold text-text-neutral">
                Dados Bancários
              </li>
              <li>
                <strong className="text-text-neutral">Banco:</strong>{" "}
                {churchInfo.bank.name}
              </li>
              <li>
                <strong className="text-text-neutral">Agência:</strong>{" "}
                {churchInfo.bank.agency}
              </li>
              <li>
                <strong className="text-text-neutral">Conta:</strong>{" "}
                {churchInfo.bank.account} ({churchInfo.bank.accountType})
              </li>
            </ul>
          </Card>

          <Card className="space-y-3 p-6">
            <div className="flex items-center gap-3 text-primary">
              <ShieldCheck className="h-6 w-6 text-secondary" />
              <h4 className="font-heading text-lg font-bold">
                Transparência &amp; Zelo
              </h4>
            </div>
            <p className="border-t border-black/5 pt-3 text-sm leading-relaxed text-text-neutral/80">
              Todas as contribuições recebidas são administradas com rigor,
              prestação de contas periódica e auditoria aprovada pela
              assembleia de membros da igreja.
            </p>
          </Card>
        </section>
      </div>
    </div>
  );
}
