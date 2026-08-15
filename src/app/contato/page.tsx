import type { Metadata } from "next";
import { MapPin, Clock, Mail, Phone, Navigation } from "lucide-react";
import { churchInfo } from "@/data/churchInfo";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ContatoForm from "@/components/contato/ContatoForm";

export const metadata: Metadata = {
  title: "Contato | IBCI - Igreja Batista Central do Ibura",
  description:
    "Fale com a Igreja Batista Central do Ibura. Envie uma mensagem, um pedido de oração ou venha nos visitar no Ibura, Recife-PE.",
};

export default function ContatoPage() {
  const mapsEmbedSrc = `https://www.google.com/maps?q=${encodeURIComponent(
    churchInfo.address.full
  )}&output=embed`;

  return (
    <div className="bg-bg-light">
      {/* Banner Header */}
      <section className="bg-primary px-4 py-16 text-white sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <h1 className="font-heading text-3xl font-bold sm:text-4xl lg:text-5xl">
            Fale Conosco
          </h1>
          <p className="mx-auto max-w-2xl text-base text-white/80 sm:text-lg">
            Estamos de portas e corações abertos para receber você e sua
            família. Entre em contato ou venha nos visitar!
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-12 px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Coluna 1: Informações de Contato */}
          <div className="space-y-6">
            <Card className="space-y-6 p-8">
              <h2 className="font-heading text-2xl font-bold text-primary">
                Informações da Igreja
              </h2>

              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                  <MapPin className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-semibold text-text-neutral">
                    Endereço
                  </h3>
                  <p className="text-sm text-text-neutral/80">
                    {churchInfo.address.street}
                  </p>
                  <p className="text-sm text-text-neutral/80">
                    {churchInfo.address.neighborhood} —{" "}
                    {churchInfo.address.city}/{churchInfo.address.state}
                  </p>
                  <p className="mt-1 text-xs text-text-neutral/60">
                    CEP: {churchInfo.address.zip}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 border-t border-black/5 pt-6">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                  <Clock className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-semibold text-text-neutral">
                    Horários das Reuniões
                  </h3>
                  <p className="text-sm text-text-neutral/80">
                    Domingos: EBD às 09h | Culto de Celebração às 18h
                  </p>
                  <p className="text-sm text-text-neutral/80">
                    Quartas-feiras: Oração e Doutrina às 19h30
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 border-t border-black/5 pt-6">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                  <Mail className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-semibold text-text-neutral">E-mail</h3>
                  <p className="text-sm text-text-neutral/80">
                    {churchInfo.contact.email}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 border-t border-black/5 pt-6">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                  <Phone className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-semibold text-text-neutral">
                    Telefone
                  </h3>
                  <p className="text-sm text-text-neutral/80">
                    {churchInfo.contact.phone}
                  </p>
                </div>
              </div>

              <Button
                href={churchInfo.social.whatsapp}
                external
                variant="secondary"
                className="w-full"
              >
                Falar no WhatsApp
              </Button>

              <div className="flex items-center justify-center gap-3 border-t border-black/5 pt-6">
                <a
                  href={churchInfo.social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="rounded-full bg-primary/5 p-2.5 text-primary transition-colors hover:bg-primary hover:text-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5"
                  >
                    <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8ZM9.6 15.5v-7l6.3 3.5-6.3 3.5Z" />
                  </svg>
                </a>
                <a
                  href={churchInfo.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="rounded-full bg-primary/5 p-2.5 text-primary transition-colors hover:bg-primary hover:text-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5"
                  >
                    <path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 2 .2 2.4.4a4.8 4.8 0 0 1 1.8 1.1 4.8 4.8 0 0 1 1.1 1.8c.2.5.4 1.2.4 2.4.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 2-.4 2.4a4.8 4.8 0 0 1-1.1 1.8 4.8 4.8 0 0 1-1.8 1.1c-.5.2-1.2.4-2.4.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-2-.2-2.4-.4a4.8 4.8 0 0 1-1.8-1.1 4.8 4.8 0 0 1-1.1-1.8c-.2-.5-.4-1.2-.4-2.4C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.2-2 .4-2.4a4.8 4.8 0 0 1 1.1-1.8A4.8 4.8 0 0 1 5.6 1.7c.5-.2 1.2-.4 2.4-.4C9.4 2.2 9.8 2.2 12 2.2Zm0 1.8c-3.2 0-3.5 0-4.8.1-1 .1-1.6.2-1.9.3a3 3 0 0 0-1.1.7 3 3 0 0 0-.7 1.1c-.1.3-.3.9-.3 1.9C3.1 9.5 3.1 9.8 3.1 13s0 3.5.1 4.8c.1 1 .2 1.6.3 1.9a3 3 0 0 0 .7 1.1 3 3 0 0 0 1.1.7c.3.1.9.3 1.9.3 1.3.1 1.6.1 4.8.1s3.5 0 4.8-.1c1-.1 1.6-.2 1.9-.3a3 3 0 0 0 1.1-.7 3 3 0 0 0 .7-1.1c.1-.3.3-.9.3-1.9.1-1.3.1-1.6.1-4.8s0-3.5-.1-4.8c-.1-1-.2-1.6-.3-1.9a3 3 0 0 0-.7-1.1 3 3 0 0 0-1.1-.7c-.3-.1-.9-.3-1.9-.3-1.3-.1-1.6-.1-4.8-.1Z" />
                    <path d="M12 7.4a4.6 4.6 0 1 0 0 9.2 4.6 4.6 0 0 0 0-9.2Zm0 7.6a3 3 0 1 1 0-6 3 3 0 0 1 0 6ZM18 6.9a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0Z" />
                  </svg>
                </a>
              </div>
            </Card>
          </div>

          {/* Coluna 2: Formulário */}
          <Card className="p-8">
            <h2 className="font-heading text-2xl font-bold text-primary">
              Envie uma Mensagem
            </h2>
            <p className="mt-2 text-sm text-text-neutral/70">
              Preencha o formulário abaixo — sua mensagem será enviada
              diretamente para o nosso WhatsApp.
            </p>
            <div className="mt-6">
              <ContatoForm />
            </div>
          </Card>
        </div>

        {/* Mapa */}
        <section>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-2xl font-bold text-primary sm:text-3xl">
              Como Chegar
            </h2>
            <p className="mt-3 text-text-neutral/80">
              Estamos localizados no bairro do Ibura, em Recife-PE.
            </p>
          </div>

          <div className="mt-8 overflow-hidden rounded-2xl border border-black/5 shadow-sm">
            <iframe
              src={mapsEmbedSrc}
              className="h-[400px] w-full"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Mapa - ${churchInfo.address.full}`}
            />
          </div>

          <div className="mt-6 flex justify-center">
            <Button href={churchInfo.address.mapsUrl} external variant="secondary">
              <Navigation className="h-5 w-5" />
              Como Chegar
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
