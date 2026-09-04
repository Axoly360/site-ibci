"use client";

import { useState } from "react";
import { Clock, MapPin, Heart, Gift, X, Copy, Check } from "lucide-react";
import { churchInfo } from "@/data/churchInfo";
import Card from "@/components/ui/Card";

interface QuickAccessSectionProps {
  title?: string;
  subtitle?: string;
}

export default function QuickAccessSection({
  title = "Acesso Rápido",
  subtitle = "Tudo o que você precisa saber sobre a nossa igreja, em um só lugar.",
}: QuickAccessSectionProps) {
  const [pixOpen, setPixOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(churchInfo.pix.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const cards = [
    {
      title: "Horários dos Cultos",
      description: `Domingo: 8h30, EBD 10h e 18h. Quarta: Oração 19h.`,
      icon: Clock,
    },
    {
      title: "Localização",
      description: churchInfo.address.full,
      icon: MapPin,
      href: churchInfo.address.mapsUrl,
      external: true,
      cta: "Como chegar",
    },
    {
      title: "Pedido de Oração",
      description: "Está passando por um momento difícil? Fale conosco.",
      icon: Heart,
      href: churchInfo.social.whatsapp,
      external: true,
      cta: "Enviar no WhatsApp",
    },
    {
      title: "Dízimos e Ofertas",
      description: "Contribua com a obra de Deus através da nossa chave PIX.",
      icon: Gift,
      cta: "Ver chave PIX",
      onClick: () => setPixOpen(true),
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-heading text-3xl font-bold text-primary sm:text-4xl">
          {title}
        </h2>
        <p className="mt-3 text-text-neutral/80">{subtitle}</p>
      </div>

      <div className="mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:pb-0 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          const content = (
            <Card className="flex h-full flex-col items-start gap-4 p-6">
              <div className="rounded-xl bg-primary/5 p-3 text-primary">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-primary">
                {card.title}
              </h3>
              <p className="flex-1 text-sm text-text-neutral/80">
                {card.description}
              </p>
              {card.cta && (
                <span className="text-sm font-semibold text-secondary">
                  {card.cta} →
                </span>
              )}
            </Card>
          );

          if (card.href) {
            return (
              <a
                key={card.title}
                href={card.href}
                target={card.external ? "_blank" : undefined}
                rel={card.external ? "noopener noreferrer" : undefined}
                className="block h-full w-64 shrink-0 snap-start sm:w-auto sm:shrink"
              >
                {content}
              </a>
            );
          }

          return (
            <button
              key={card.title}
              type="button"
              onClick={card.onClick}
              className="block h-full w-64 shrink-0 snap-start text-left sm:w-auto sm:shrink"
            >
              {content}
            </button>
          );
        })}
      </div>

      {pixOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setPixOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-xl font-bold text-primary">
                Dízimos e Ofertas
              </h3>
              <button
                type="button"
                onClick={() => setPixOpen(false)}
                aria-label="Fechar"
                className="text-text-neutral/60 hover:text-text-neutral"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <p className="mt-3 text-sm text-text-neutral/80">
              Contribua com a obra de Deus através da nossa chave PIX (
              {churchInfo.pix.keyType}):
            </p>
            <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-bg-light px-4 py-3">
              <span className="truncate font-mono text-sm text-primary">
                {churchInfo.pix.key}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="flex shrink-0 items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-dark"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied ? "Copiado" : "Copiar"}
              </button>
            </div>
            <p className="mt-3 text-xs text-text-neutral/60">
              Titular: {churchInfo.pix.holder}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
