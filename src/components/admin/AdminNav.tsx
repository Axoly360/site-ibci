import Link from "next/link";
import { ChevronDown, LogOut } from "lucide-react";
import type { AdminSessionPayload, Permission } from "@/lib/admin-session";

interface NavItem {
  href: string;
  label: string;
  permission: Permission;
}

interface NavSector {
  name: string;
  items: NavItem[];
}

const SECTORS: NavSector[] = [
  {
    name: "Mídias",
    items: [
      { href: "/admin/banners", label: "Banners", permission: "banners" },
      { href: "/admin/textos", label: "Seções", permission: "paginas" },
      { href: "/admin/menu", label: "Menu", permission: "paginas" },
      { href: "/admin/programacao", label: "Programação", permission: "paginas" },
      { href: "/admin/mensagens", label: "Mensagens", permission: "paginas" },
      { href: "/admin/acesso-rapido", label: "Acesso Rápido", permission: "paginas" },
    ],
  },
  {
    name: "Secretaria",
    items: [
      { href: "/admin/membros", label: "Membros", permission: "membros" },
      { href: "/admin/grupos", label: "Grupos", permission: "membros" },
      { href: "/admin/servir", label: "Servir", permission: "membros" },
      { href: "/admin/visitantes", label: "Visitantes", permission: "visitantes" },
      { href: "/admin/eventos", label: "Eventos", permission: "eventos" },
      { href: "/admin/consentimento", label: "Consentimento", permission: "documentos" },
      { href: "/admin/documentos", label: "Documentos", permission: "documentos" },
    ],
  },
];

const SINGLE_LINKS: NavItem[] = [
  { href: "/admin/financeiro", label: "Financeiro", permission: "financeiro" },
  { href: "/admin/congregacoes", label: "Congregações", permission: "congregacoes" },
  { href: "/admin/administradores", label: "Administradores", permission: "admins" },
];

export default function AdminNav({ session }: { session: AdminSessionPayload }) {
  const sectors = SECTORS.map((sector) => ({
    ...sector,
    items: sector.items.filter((item) => session.permissions.includes(item.permission)),
  })).filter((sector) => sector.items.length > 0);

  const singleLinks = SINGLE_LINKS.filter((item) =>
    session.permissions.includes(item.permission)
  );

  return (
    <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 pt-8 sm:px-6 lg:px-8">
      <nav className="flex flex-wrap items-center gap-1 text-sm font-semibold">
        <Link href="/admin" className="rounded-lg px-3 py-2 text-primary hover:bg-primary/5">
          Painel
        </Link>

        {sectors.map((sector) => (
          <div key={sector.name} className="group relative">
            <button
              type="button"
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-primary hover:bg-primary/5"
            >
              {sector.name}
              <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <div className="invisible absolute left-0 top-full z-20 min-w-[200px] rounded-xl border border-black/5 bg-white p-2 opacity-0 shadow-lg transition-opacity duration-150 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
              {sector.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-text-neutral hover:bg-primary/5 hover:text-primary"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}

        {singleLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-lg px-3 py-2 text-primary hover:bg-primary/5"
          >
            {item.label}
          </Link>
        ))}

        <Link href="/admin/conta" className="rounded-lg px-3 py-2 text-primary hover:bg-primary/5">
          Minha conta
        </Link>
      </nav>
      <div className="flex items-center gap-3 text-sm text-text-neutral/70">
        <span>
          {session.name} · {session.role}
        </span>
        <form action="/api/admin/sair" method="POST">
          <button
            type="submit"
            className="flex items-center gap-1.5 font-semibold text-text-neutral/70 hover:text-primary"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </form>
      </div>
    </div>
  );
}
