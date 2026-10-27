"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, Phone, X } from "lucide-react";
import Ibi from "@/components/brand/Ibi";
import { churchInfo } from "@/data/churchInfo";

// Áreas com login ou de uso interno: o assistente é só do site público.
const ROTAS_OCULTAS = [
  "/admin",
  "/central-do-membro",
  "/congregacoes",
  "/checkin",
  "/entrar",
  "/esqueci-senha",
  "/redefinir-senha",
];

interface Resposta {
  texto: string;
  links?: { label: string; href: string; externo?: boolean }[];
}

const whatsappLink = (mensagem: string) =>
  `${churchInfo.social.whatsapp}?text=${encodeURIComponent(mensagem)}`;

const horarios = churchInfo.serviceTimes
  .map((s) => `${s.day}, ${s.time}: ${s.label}`)
  .join(" · ");

// Respostas fixas, tiradas de churchInfo: nada de IA, então nada de resposta inventada.
const PERGUNTAS: { id: string; pergunta: string; resposta: Resposta }[] = [
  {
    id: "horarios",
    pergunta: "Horários dos cultos",
    resposta: {
      texto: `Estes são os nossos encontros semanais. ${horarios}.`,
      links: [{ label: "Ver programação", href: "/para-voce/programacoes" }],
    },
  },
  {
    id: "onde",
    pergunta: "Onde fica a igreja?",
    resposta: {
      texto: `Estamos na ${churchInfo.address.full}. Será uma alegria receber você!`,
      links: [{ label: "Abrir no mapa", href: churchInfo.address.mapsUrl, externo: true }],
    },
  },
  {
    id: "visitar",
    pergunta: "Quero visitar",
    resposta: {
      texto:
        "Venha como você está! Se quiser, conte um pouco sobre você e nossa equipe de acolhimento entra em contato.",
      links: [{ label: "Cadastro de visitante", href: "/visitantes/cadastro" }],
    },
  },
  {
    id: "oracao",
    pergunta: "Pedido de oração",
    resposta: {
      texto:
        "Você não precisa orar sozinho(a). Compartilhe seu pedido com a nossa equipe de intercessão.",
      links: [{ label: "Fazer pedido de oração", href: "/para-voce/pedidos-de-oracao" }],
    },
  },
  {
    id: "membro",
    pergunta: "Quero ser membro",
    resposta: {
      texto:
        "Que bom! Crie sua conta na Central do Membro e envie seus dados. A diretoria analisa o cadastro e avisa você.",
      links: [{ label: "Central do Membro", href: "/central-do-membro" }],
    },
  },
  {
    id: "contato",
    pergunta: "Falar com a igreja",
    resposta: {
      texto: `Atendimento: ${churchInfo.contact.businessHours}. WhatsApp ${churchInfo.contact.whatsapp}, telefone ${churchInfo.contact.phone} ou e-mail ${churchInfo.contact.email}.`,
      links: [
        {
          label: "Chamar no WhatsApp",
          href: whatsappLink("Olá! Vim pelo site da IBCI."),
          externo: true,
        },
        { label: "Página de contato", href: "/contato" },
      ],
    },
  },
];

interface Mensagem {
  de: "ibi" | "voce";
  texto: string;
  links?: Resposta["links"];
}

const SAUDACAO: Mensagem = {
  de: "ibi",
  texto: "Oi, eu sou o Ibi! Escolha uma pergunta abaixo ou fale direto com a nossa equipe.",
};

export default function AssistenteIbi() {
  const pathname = usePathname();
  const [aberto, setAberto] = useState(false);
  const [mensagens, setMensagens] = useState<Mensagem[]>([SAUDACAO]);
  const fimRef = useRef<HTMLDivElement>(null);
  const botaoRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!aberto) return;
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setAberto(false);
        botaoRef.current?.focus();
      }
    }
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [aberto]);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ block: "end" });
  }, [mensagens, aberto]);

  if (ROTAS_OCULTAS.some((r) => pathname === r || pathname.startsWith(`${r}/`))) {
    return null;
  }

  function perguntar(id: string) {
    const item = PERGUNTAS.find((p) => p.id === id);
    if (!item) return;
    setMensagens((atual) => [
      ...atual,
      { de: "voce", texto: item.pergunta },
      { de: "ibi", texto: item.resposta.texto, links: item.resposta.links },
    ]);
  }

  return (
    <div className="assistente-ibi fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3 print:hidden">
      {aberto && (
        <section
          role="dialog"
          aria-label="Assistente Ibi"
          className="flex max-h-[min(34rem,calc(100vh-7rem))] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-hairline bg-marfim shadow-[var(--shadow-soft)]"
        >
          <header className="flex items-center gap-3 bg-primary px-4 py-3 text-white">
            <Ibi pose="marca" size={40} />
            <div className="flex-1">
              <p className="font-heading text-base font-semibold leading-tight">Ibi</p>
              <p className="text-xs text-white/75">Assistente da IBCI</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setAberto(false);
                botaoRef.current?.focus();
              }}
              aria-label="Fechar assistente"
              className="rounded-full p-1 text-white/80 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {mensagens.map((m, i) => (
              <div key={i} className={m.de === "voce" ? "flex justify-end" : "flex"}>
                <div
                  className={
                    m.de === "voce"
                      ? "max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3.5 py-2 text-sm text-white"
                      : "max-w-[90%] rounded-2xl rounded-bl-sm border border-hairline bg-white px-3.5 py-2.5 text-sm text-text-neutral"
                  }
                >
                  <p className="leading-relaxed">{m.texto}</p>
                  {m.links && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {m.links.map((l) =>
                        l.externo ? (
                          <a
                            key={l.href}
                            href={l.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full border-2 border-outline bg-sol px-3 py-1 text-xs font-bold text-on-accent"
                          >
                            {l.label}
                          </a>
                        ) : (
                          <Link
                            key={l.href}
                            href={l.href}
                            onClick={() => setAberto(false)}
                            className="rounded-full border-2 border-outline bg-sol px-3 py-1 text-xs font-bold text-on-accent"
                          >
                            {l.label}
                          </Link>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={fimRef} />
          </div>

          <div className="border-t border-hairline px-4 py-3">
            <div className="flex flex-wrap gap-2">
              {PERGUNTAS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => perguntar(p.id)}
                  className="rounded-full border-[1.5px] border-outline px-3 py-1.5 text-xs font-semibold text-ink hover:bg-nevoa"
                >
                  {p.pergunta}
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between text-xs font-semibold text-primary">
              <a
                href={whatsappLink("Olá! Vim pelo site da IBCI.")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:underline"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                WhatsApp
              </a>
              <a
                href={`tel:${churchInfo.contact.phone.replace(/\D/g, "")}`}
                className="flex items-center gap-1 hover:underline"
              >
                <Phone className="h-3.5 w-3.5" />
                Ligar
              </a>
              <button
                type="button"
                onClick={() => setMensagens([SAUDACAO])}
                className="text-ink-muted hover:underline"
              >
                Recomeçar
              </button>
            </div>
          </div>
        </section>
      )}

      <button
        ref={botaoRef}
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        aria-label={aberto ? "Fechar assistente" : "Abrir assistente: fale com o Ibi"}
        className="flex items-center gap-2 rounded-full border-2 border-outline bg-marfim py-1.5 pl-1.5 pr-4 text-sm font-bold text-ink shadow-[var(--shadow-soft)] transition-colors hover:bg-nevoa"
      >
        <Ibi pose="marca" size={36} />
        Fale com o Ibi
      </button>
    </div>
  );
}
