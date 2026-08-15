"use client";

import { useState } from "react";
import {
  BookOpen,
  Sparkles,
  Heart,
  Users,
  ShieldCheck,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";

interface FaithItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

const faithItems: FaithItem[] = [
  {
    icon: BookOpen,
    title: "A Bíblia Sagrada",
    description:
      "Cremos que a Bíblia Sagrada é a Palavra de Deus, inspirada por Ele e nossa única regra de fé e prática.",
  },
  {
    icon: Sparkles,
    title: "A Trindade",
    description:
      "Cremos em um único Deus, eterno e subsistente em três pessoas: Pai, Filho e Espírito Santo.",
  },
  {
    icon: Heart,
    title: "Salvação pela Graça",
    description:
      "Cremos que a salvação é dom de Deus, alcançada exclusivamente pela graça mediante a fé em Jesus Cristo.",
  },
  {
    icon: Users,
    title: "O Batismo e a Ceia",
    description:
      "Cremos no batismo por imersão e na Ceia do Senhor como as duas ordenanças instituídas por Cristo para a Igreja.",
  },
  {
    icon: ShieldCheck,
    title: "A Afiliação Denominacional",
    description:
      "Somos uma igreja batista vinculada à Convenção Batista Brasileira (CBB) e à Convenção Batista Pernambucana (CBPE).",
  },
];

export default function FaithAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="divide-y divide-black/5 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
      {faithItems.map((item, index) => {
        const Icon = item.icon;
        const isOpen = openIndex === index;

        return (
          <div key={item.title}>
            <button
              type="button"
              onClick={() => toggle(index)}
              aria-expanded={isOpen}
              className="flex w-full items-center gap-4 px-5 py-5 text-left transition-colors hover:bg-primary/[0.03] sm:px-8"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/5 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <span className="flex-1 font-heading text-base font-semibold text-primary sm:text-lg">
                {item.title}
              </span>
              <ChevronDown
                className={`h-5 w-5 shrink-0 text-secondary transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            <div
              className={`grid transition-all duration-300 ease-in-out ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-5 pl-[4.75rem] text-sm leading-relaxed text-text-neutral/80 sm:px-8 sm:pb-6">
                  {item.description}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
