import {
  BookOpen,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  Gift,
  HandHeart,
  Heart,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Tv,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";

/**
 * Lista fechada de ícones — só nomes já usados e comprovados no projeto,
 * para o admin escolher num <select> em vez de digitar um nome qualquer
 * (essa versão do lucide-react foge do que é padrão, então um nome errado
 * quebraria a renderização do card).
 */
export const QUICK_ACCESS_ICONS: Record<string, LucideIcon> = {
  Clock,
  MapPin,
  Heart,
  Gift,
  MessageCircle,
  Phone,
  CalendarDays,
  Users,
  BookOpen,
  HandHeart,
  ShieldCheck,
  FileText,
  Building2,
  UserRound,
  CheckCircle2,
  Tv,
};

export const QUICK_ACCESS_ICON_KEYS = Object.keys(QUICK_ACCESS_ICONS);
