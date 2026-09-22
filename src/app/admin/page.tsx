import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Camera,
  FileText,
  Menu,
  UserRound,
  Lock,
  Building2,
  CalendarDays,
  UserRoundCheck,
  MapPin,
  ShieldCheck,
  Users,
  HandHeart,
  Tv,
  Clock,
  type LucideIcon,
} from "lucide-react";
import PageBanner from "@/components/layout/PageBanner";
import AdminNav from "@/components/admin/AdminNav";
import Card from "@/components/ui/Card";
import { getAdminSession, hasPermission } from "@/lib/admin-session";
import { sql } from "@/lib/db";

export const metadata: Metadata = {
  title: "Painel IBCI",
  robots: { index: false, follow: false },
};

interface AdminLink {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  show: boolean;
  /** Nº de itens pendentes de decisão — mostrado como badge no card. */
  pendingCount?: number;
}

interface Sector {
  name: string;
  icon: LucideIcon;
  iconBg: string;
  titleColor: string;
  links: AdminLink[];
}

export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/entrar");
  }

  // Contadores de pendência por setor — só consulta o que o admin logado
  // realmente tem permissão de ver, pra não gastar query à toa nem vazar
  // número de outro setor. Sem isso, o único jeito de saber que havia
  // pendência era entrar em cada tela uma por uma.
  const [membrosPendentes, gruposPendentes, financeiroPendente, congregacoesPendentes] =
    await Promise.all([
      hasPermission(session, "membros")
        ? sql`select count(*)::int as count from membership_requests where status = 'pendente'`
        : Promise.resolve([{ count: 0 }]),
      hasPermission(session, "membros")
        ? sql`select count(*)::int as count from group_join_requests where status = 'pendente'`
        : Promise.resolve([{ count: 0 }]),
      hasPermission(session, "financeiro")
        ? sql`
            select
              (select count(*)::int from contribution_receipts where status = 'pendente') +
              (select count(*)::int from congregation_financial_submissions where status = 'pendente')
              as count
          `
        : Promise.resolve([{ count: 0 }]),
      hasPermission(session, "congregacoes")
        ? sql`select count(*)::int as count from congregation_requests where status = 'pendente'`
        : Promise.resolve([{ count: 0 }]),
    ]);

  const sectors: Sector[] = [
    {
      name: "Mídias",
      icon: Camera,
      iconBg: "bg-blue-600",
      titleColor: "text-blue-700",
      links: [
        {
          href: "/admin/banners",
          icon: Camera,
          title: "Banners",
          description: "Imagens, títulos, links e o vídeo institucional da home.",
          show: hasPermission(session, "banners"),
        },
        {
          href: "/admin/textos",
          icon: FileText,
          title: "Seções",
          description: "Título, subtítulo e ordem de cada seção da home.",
          show: hasPermission(session, "paginas"),
        },
        {
          href: "/admin/menu",
          icon: Menu,
          title: "Menu",
          description: "Categorias e subcategorias do menu do site.",
          show: hasPermission(session, "paginas"),
        },
        {
          href: "/admin/programacao",
          icon: CalendarDays,
          title: "Programação",
          description: "Itens da seção Programação da Semana, na home.",
          show: hasPermission(session, "paginas"),
        },
        {
          href: "/admin/mensagens",
          icon: Tv,
          title: "Mensagens",
          description: "Vídeos do YouTube da seção Últimas Mensagens, na home.",
          show: hasPermission(session, "paginas"),
        },
        {
          href: "/admin/acesso-rapido",
          icon: Clock,
          title: "Acesso Rápido",
          description: "Cards da seção Acesso Rápido, na home.",
          show: hasPermission(session, "paginas"),
        },
      ],
    },
    {
      name: "Secretaria",
      icon: UserRound,
      iconBg: "bg-amber-500",
      titleColor: "text-amber-700",
      links: [
        {
          href: "/admin/membros",
          icon: UserRound,
          title: "Membros",
          description: "Validar cadastros, arquivos e a escala de serviços.",
          show: hasPermission(session, "membros"),
          pendingCount: membrosPendentes[0]?.count ?? 0,
        },
        {
          href: "/admin/grupos",
          icon: Users,
          title: "Grupos",
          description: "Grupos/células da igreja e quem faz parte de cada um.",
          show: hasPermission(session, "membros"),
          pendingCount: gruposPendentes[0]?.count ?? 0,
        },
        {
          href: "/admin/servir",
          icon: HandHeart,
          title: "Servir",
          description: "Membros que se cadastraram para servir em cada ministério.",
          show: hasPermission(session, "membros"),
        },
        {
          href: "/admin/visitantes",
          icon: UserRoundCheck,
          title: "Visitantes",
          description: "Cadastros espontâneos para follow-up da recepção.",
          show: hasPermission(session, "visitantes"),
        },
        {
          href: "/admin/eventos",
          icon: CalendarDays,
          title: "Eventos",
          description: "Criar, editar e remover eventos — inclusive check-in por QR Code.",
          show: hasPermission(session, "eventos"),
        },
        {
          href: "/admin/consentimento",
          icon: ShieldCheck,
          title: "Consentimento",
          description: "Textos dos termos LGPD (uso de imagem, voluntariado, proteção) aceitos pelo membro.",
          show: hasPermission(session, "documentos"),
        },
        {
          href: "/admin/documentos",
          icon: FileText,
          title: "Documentos",
          description: "Estatuto e Regimento Interno, em PDF.",
          show: hasPermission(session, "documentos"),
        },
      ],
    },
    {
      name: "Financeiro",
      icon: Building2,
      iconBg: "bg-emerald-600",
      titleColor: "text-emerald-700",
      links: [
        {
          href: "/admin/financeiro",
          icon: Building2,
          title: "Financeiro",
          description: "Comprovantes, lançamentos e relatório de dízimos e ofertas.",
          show: hasPermission(session, "financeiro"),
          pendingCount: financeiroPendente[0]?.count ?? 0,
        },
      ],
    },
    {
      name: "Congregações",
      icon: MapPin,
      iconBg: "bg-violet-600",
      titleColor: "text-violet-700",
      links: [
        {
          href: "/admin/congregacoes",
          icon: MapPin,
          title: "Congregações",
          description: "Filiais da IBCI — responsáveis, solicitações e prestação de contas.",
          show: hasPermission(session, "congregacoes"),
          pendingCount: congregacoesPendentes[0]?.count ?? 0,
        },
      ],
    },
    {
      name: "Administração",
      icon: Lock,
      iconBg: "bg-slate-600",
      titleColor: "text-slate-700",
      links: [
        {
          href: "/admin/administradores",
          icon: Lock,
          title: "Administradores",
          description: "Quem tem acesso ao painel e o que cada um pode fazer.",
          show: hasPermission(session, "admins"),
        },
      ],
    },
  ]
    .map((sector) => ({ ...sector, links: sector.links.filter((link) => link.show) }))
    .filter((sector) => sector.links.length > 0);

  return (
    <div className="bg-bg-light">
      <AdminNav session={session} />
      <PageBanner
        title="Painel IBCI"
        description={`Olá, ${session.name} — você está logado como ${session.role}.`}
      />
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        {sectors.length === 0 ? (
          <p className="text-center text-text-neutral/70">
            Sua função ({session.role}) ainda não tem acesso a nenhuma área do painel.
          </p>
        ) : (
          sectors.map((sector) => {
            const SectorIcon = sector.icon;
            return (
            <div key={sector.name} className="mb-12 last:mb-0">
              <div className="mb-4 flex items-center gap-3">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${sector.iconBg} text-white`}
                >
                  <SectorIcon className="h-4 w-4" />
                </span>
                <h2 className={`font-heading text-xl font-bold ${sector.titleColor}`}>
                  {sector.name}
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {sector.links.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link key={link.href} href={link.href}>
                      <Card className="relative flex h-full flex-col items-start gap-3 p-6">
                        {!!link.pendingCount && (
                          <span className="absolute right-4 top-4 flex min-w-[1.5rem] items-center justify-center rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white">
                            {link.pendingCount}
                          </span>
                        )}
                        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" />
                        </span>
                        <h3 className="font-heading text-lg font-semibold text-primary">
                          {link.title}
                        </h3>
                        <p className="text-sm text-text-neutral/70">{link.description}</p>
                        {!!link.pendingCount && (
                          <p className="text-xs font-semibold text-amber-700">
                            {link.pendingCount === 1
                              ? "1 pendência aguardando"
                              : `${link.pendingCount} pendências aguardando`}
                          </p>
                        )}
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
            );
          })
        )}
      </div>
    </div>
  );
}
