"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Building2,
  CalendarClock,
  CalendarDays,
  ChevronDown,
  FileText,
  Gift,
  HandHeart,
  Heart,
  Home,
  Menu,
  ShieldCheck,
  UserRoundCheck,
  Users,
  X,
} from "lucide-react";
import { churchInfo } from "@/data/churchInfo";

function waLink(message: string) {
  return `https://wa.me/${churchInfo.social.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export default function DashboardCategoryTiles({
  isLeadership = false,
}: {
  isLeadership?: boolean;
}) {
  return (
    <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      <Tile
        href="/central-do-membro/grupos"
        icon={Users}
        iconBg="bg-salvia"
        borderColor="border-t-primary"
        titleColor="text-primary"
        title="Grupos"
        subtitle="Conhecer & Participar"
      />
      <FinanceiroTile />
      <Tile
        href="/central-do-membro/ebd"
        icon={BookOpen}
        iconBg="bg-salvia"
        borderColor="border-t-primary"
        titleColor="text-primary"
        title="Ensino"
        subtitle="Escola Bíblica & Cursos"
      />
      <Tile
        href="/central-do-membro/grupo-familiar"
        icon={Home}
        iconBg="bg-salvia"
        borderColor="border-t-primary"
        titleColor="text-primary"
        title="Grupo Familiar"
        subtitle="Cônjuge, filhos e familiares"
      />
      <ServirTile />
      <MaisTile isLeadership={isLeadership} />
    </div>
  );
}

function Tile({
  href,
  icon: Icon,
  iconBg,
  borderColor,
  titleColor,
  title,
  subtitle,
}: {
  href: string;
  icon: typeof Users;
  iconBg: string;
  borderColor: string;
  titleColor: string;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-2 rounded-2xl border border-hairline border-t-4 ${borderColor} bg-white p-5 text-center transition-colors hover:border-outline/40`}
    >
      <span className={`flex h-16 w-16 items-center justify-center rounded-2xl ${iconBg} text-on-accent`}>
        <Icon className="h-7 w-7" />
      </span>
      <p className={`font-heading text-sm font-bold underline decoration-2 underline-offset-2 ${titleColor}`}>
        {title}
      </p>
      <p className="text-xs text-text-neutral/60">{subtitle}</p>
    </Link>
  );
}

const FINANCEIRO_OPTIONS = [
  { label: "Dízimo", icon: Gift, href: "/central-do-membro/contribuicoes" },
  { label: "IBCI Contribua", icon: Heart, href: "/para-voce/dizimos-e-ofertas" },
  { label: "Centro de Formação", icon: BookOpen, href: "/central-do-membro/matriculas" },
  { label: "Relatório", icon: FileText, href: "/central-do-membro/contribuicoes" },
];

function ServirTile() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex flex-col items-center gap-2 rounded-2xl border border-hairline border-t-4 border-t-primary bg-white p-5 text-center transition-colors hover:border-outline/40"
      >
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-salvia text-on-accent">
          <HandHeart className="h-7 w-7" />
        </span>
        <p className="font-heading text-sm font-bold text-primary underline decoration-2 underline-offset-2">
          Servir
        </p>
        <p className="text-xs text-text-neutral/60">Oportunidades de Voluntariado</p>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between bg-primary px-6 py-4">
              <p className="flex items-center gap-2 font-heading text-base font-bold text-white">
                <HandHeart className="h-5 w-5" />
                Servir na IBCI
              </p>
              <button type="button" onClick={() => setOpen(false)} className="text-white/80 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-col gap-3 p-6">
              <p className="text-sm text-text-neutral/70">
                Escolha uma das opções abaixo para prosseguir com seu voluntariado:
              </p>
              <Link
                href="/central-do-membro/servir"
                className="rounded-xl bg-primary px-4 py-3.5 text-center font-bold text-white transition-colors hover:bg-action-hover"
              >
                Já estou servindo
                <span className="block text-xs font-normal text-white/80">
                  e vou informar onde
                </span>
              </Link>
              <Link
                href="/para-voce/servir"
                className="rounded-xl border border-black/10 px-4 py-3.5 text-center font-bold text-text-neutral transition-colors hover:bg-bg-light"
              >
                Quero conhecer
                <span className="block text-xs font-normal text-text-neutral/60">
                  as oportunidades disponíveis
                </span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function FinanceiroTile() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative flex flex-col items-center gap-2 rounded-2xl border border-hairline border-t-4 border-t-primary bg-white p-5 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-salvia text-on-accent">
        <Building2 className="h-7 w-7" />
      </span>
      <p className="font-heading text-sm font-bold text-primary">Financeiro</p>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white hover:bg-action-hover"
      >
        Opções
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-1/2 top-full z-10 mt-2 w-56 -translate-x-1/2 rounded-xl border border-hairline bg-marfim p-2 text-left shadow-[var(--shadow-soft)]">
          {FINANCEIRO_OPTIONS.map((option) => {
            const OptionIcon = option.icon;
            return (
              <Link
                key={option.label}
                href={option.href}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-neutral hover:bg-bg-light"
              >
                <OptionIcon className="h-4 w-4 shrink-0 text-primary" />
                {option.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MaisTile({ isLeadership }: { isLeadership: boolean }) {
  const [open, setOpen] = useState(false);

  const options = [
    ...(isLeadership
      ? [
          {
            label: "Escala de Serviços",
            icon: CalendarDays,
            href: "/central-do-membro/escala",
            external: false,
          },
        ]
      : []),
    {
      label: "Pedido de Oração",
      icon: Heart,
      href: waLink("Olá! Gostaria de compartilhar um pedido de oração."),
      external: true,
    },
    {
      label: "Escala de Cultos & Avisos",
      icon: CalendarClock,
      href: "/central-do-membro/programacao",
      external: false,
    },
    {
      label: "Solicitação de Visita Pastoral",
      icon: UserRoundCheck,
      href: waLink(
        `Olá! Gostaria de solicitar uma visita pastoral do ${churchInfo.seniorPastor} ou da equipe.`
      ),
      external: true,
    },
    {
      label: "Eventos",
      icon: CalendarDays,
      href: "/central-do-membro/agendamentos",
      external: false,
    },
    {
      label: "Consentimento",
      icon: ShieldCheck,
      href: "/central-do-membro/consentimento",
      external: false,
    },
    {
      label: "Organizações (SHB, MM…)",
      icon: Users,
      href: "/central-do-membro/organizacoes",
      external: false,
    },
    {
      label: "Ajuda",
      icon: BookOpen,
      href: "/central-do-membro/ajuda",
      external: false,
    },
  ];

  return (
    <div className="relative flex flex-col items-center gap-2 rounded-2xl border border-hairline border-t-4 border-t-primary bg-white p-5 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-salvia text-on-accent">
        <Menu className="h-7 w-7" />
      </span>
      <p className="font-heading text-sm font-bold text-primary">Mais</p>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white hover:bg-action-hover"
      >
        Opções
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-1/2 top-full z-10 mt-2 w-64 -translate-x-1/2 rounded-xl border border-hairline bg-marfim p-2 text-left shadow-[var(--shadow-soft)]">
          {options.map((option) => {
            const OptionIcon = option.icon;
            return (
              <Link
                key={option.label}
                href={option.href}
                target={option.external ? "_blank" : undefined}
                rel={option.external ? "noopener noreferrer" : undefined}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-neutral hover:bg-bg-light"
              >
                <OptionIcon className="h-4 w-4 shrink-0 text-primary" />
                {option.label}
              </Link>
            );
          })}
          <div className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-neutral/40">
            <FileText className="h-4 w-4 shrink-0" />
            Estudos & Materiais (em breve)
          </div>
        </div>
      )}
    </div>
  );
}
