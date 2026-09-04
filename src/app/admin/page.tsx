import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Camera, FileText, Menu, UserRound, Lock } from "lucide-react";
import PageBanner from "@/components/layout/PageBanner";
import AdminNav from "@/components/admin/AdminNav";
import Card from "@/components/ui/Card";
import { getAdminSession, hasPermission } from "@/lib/admin-session";

export const metadata: Metadata = {
  title: "Painel IBCI",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/entrar");
  }

  const links = [
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
      title: "Textos",
      description: "Título e subtítulo de cada seção da home.",
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
      href: "/admin/membros",
      icon: UserRound,
      title: "Membros",
      description: "Validar cadastros, arquivos e a escala de serviços.",
      show: hasPermission(session, "membros"),
    },
    {
      href: "/admin/administradores",
      icon: Lock,
      title: "Administradores",
      description: "Quem tem acesso ao painel e o que cada um pode fazer.",
      show: hasPermission(session, "admins"),
    },
  ].filter((link) => link.show);

  return (
    <div className="bg-bg-light">
      <AdminNav session={session} />
      <PageBanner
        title="Painel IBCI"
        description={`Olá, ${session.name} — você está logado como ${session.role}.`}
      />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        {links.length === 0 ? (
          <p className="text-center text-text-neutral/70">
            Sua função ({session.role}) ainda não tem acesso a nenhuma área do painel.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.href} href={link.href}>
                  <Card className="flex h-full flex-col items-start gap-3 p-6">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h2 className="font-heading text-lg font-semibold text-primary">
                      {link.title}
                    </h2>
                    <p className="text-sm text-text-neutral/70">{link.description}</p>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
