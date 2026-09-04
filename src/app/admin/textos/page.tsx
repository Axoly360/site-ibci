import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PageBanner from "@/components/layout/PageBanner";
import AdminNav from "@/components/admin/AdminNav";
import SectionTextForm from "@/components/admin/SectionTextForm";
import { getAdminSession, hasPermission } from "@/lib/admin-session";
import { getAllContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Textos | Painel IBCI",
  robots: { index: false, follow: false },
};

const sections = [
  {
    label: 'Seção "Acesso Rápido"',
    titleKey: "home.acessoRapido.title",
    subtitleKey: "home.acessoRapido.subtitle",
    defaultTitle: "Acesso Rápido",
    defaultSubtitle: "Tudo o que você precisa saber sobre a nossa igreja, em um só lugar.",
  },
  {
    label: 'Seção "Últimas Mensagens"',
    titleKey: "home.ultimasMensagens.title",
    subtitleKey: "home.ultimasMensagens.subtitle",
    defaultTitle: "Últimas Mensagens",
    defaultSubtitle: "Assista às transmissões mais recentes da nossa igreja.",
  },
  {
    label: 'Seção "Eventos do Mês"',
    titleKey: "home.eventosDoMes.title",
    subtitleKey: "home.eventosDoMes.subtitle",
    defaultTitle: "Eventos do Mês",
    defaultSubtitle: "Fique por dentro dos próximos eventos da nossa igreja.",
  },
  {
    label: 'Seção "Programação da Semana"',
    titleKey: "home.programacaoSemana.title",
    subtitleKey: "home.programacaoSemana.subtitle",
    defaultTitle: "Programação da Semana",
    defaultSubtitle: "Participe dos nossos encontros e cresça em comunhão com a igreja.",
  },
  {
    label: 'Seção "Conheça a IBCI" (vídeo)',
    titleKey: "home.conhecaIbci.title",
    subtitleKey: "home.conhecaIbci.subtitle",
    defaultTitle: "Conheça a IBCI",
    defaultSubtitle: "Aqui vamos usar um vídeo institucional da igreja.",
  },
];

export default async function AdminTextosPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/entrar");
  if (!hasPermission(session, "paginas")) redirect("/admin");

  const texts = await getAllContent();

  return (
    <div className="bg-bg-light">
      <AdminNav session={session} />
      <PageBanner
        title="Textos"
        description="Título e subtítulo de cada seção da home."
      />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6">
          {sections.map((section) => (
            <SectionTextForm
              key={section.titleKey}
              label={section.label}
              titleKey={section.titleKey}
              subtitleKey={section.subtitleKey}
              initialTitle={texts[section.titleKey] ?? section.defaultTitle}
              initialSubtitle={texts[section.subtitleKey] ?? section.defaultSubtitle}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
