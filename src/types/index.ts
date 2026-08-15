import type { LucideIcon } from "lucide-react";

export interface ServiceTime {
  day: string;
  label: string;
  time: string;
}

export interface WeeklyScheduleItem {
  day: string;
  title: string;
  time: string;
  description: string;
}

export interface SocialLinks {
  youtube: string;
  instagram: string;
  whatsapp: string;
  /** Número em formato E.164 sem símbolos (ex.: "5581999999999"), usado para montar links wa.me dinâmicos. */
  whatsappNumber: string;
}

export interface ChurchInfo {
  name: string;
  shortName: string;
  fullName: string;
  seniorPastor: string;
  address: {
    street: string;
    neighborhood: string;
    city: string;
    state: string;
    zip: string;
    full: string;
    mapsUrl: string;
  };
  serviceTimes: ServiceTime[];
  weeklySchedule: WeeklyScheduleItem[];
  cnpj: string;
  pix: {
    /** Chave formatada, usada para exibição (ex.: "11.238.163/0001-08"). */
    key: string;
    /** Chave sem pontuação, usada no payload EMV/BR Code (ex.: "11238163000108"). */
    keyRaw: string;
    keyType: string;
    holder: string;
    /** Nome do recebedor para o campo 59 do BR Code (máx. 25 caracteres, sem acentos). */
    merchantName: string;
    /** Cidade do recebedor para o campo 60 do BR Code (máx. 15 caracteres, sem acentos). */
    merchantCity: string;
    /** Identificador da transação (campo 62/05). */
    txid: string;
  };
  bank: {
    name: string;
    agency: string;
    account: string;
    accountType: string;
  };
  social: SocialLinks;
  contact: {
    email: string;
    phone: string;
  };
}

export interface NavLink {
  label: string;
  href: string;
}

export interface QuickAccessCard {
  title: string;
  description: string;
  icon: LucideIcon;
  href?: string;
  external?: boolean;
  action?: "pix-modal";
}
