import Link from "next/link";
import { LogOut } from "lucide-react";
import type { AdminSessionPayload } from "@/lib/admin-session";

export default function AdminNav({ session }: { session: AdminSessionPayload }) {
  return (
    <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 pt-8 sm:px-6 lg:px-8">
      <nav className="flex flex-wrap gap-4 text-sm font-semibold">
        <Link href="/admin" className="text-primary hover:underline">
          Painel
        </Link>
        {session.permissions.includes("banners") && (
          <Link href="/admin/banners" className="text-primary hover:underline">
            Banners
          </Link>
        )}
        {session.permissions.includes("paginas") && (
          <Link href="/admin/textos" className="text-primary hover:underline">
            Seções
          </Link>
        )}
        {session.permissions.includes("paginas") && (
          <Link href="/admin/menu" className="text-primary hover:underline">
            Menu
          </Link>
        )}
        {session.permissions.includes("paginas") && (
          <Link href="/admin/programacao" className="text-primary hover:underline">
            Programação
          </Link>
        )}
        {session.permissions.includes("paginas") && (
          <Link href="/admin/mensagens" className="text-primary hover:underline">
            Mensagens
          </Link>
        )}
        {session.permissions.includes("paginas") && (
          <Link href="/admin/consentimento" className="text-primary hover:underline">
            Consentimento
          </Link>
        )}
        {session.permissions.includes("paginas") && (
          <Link href="/admin/documentos" className="text-primary hover:underline">
            Documentos
          </Link>
        )}
        {session.permissions.includes("membros") && (
          <Link href="/admin/membros" className="text-primary hover:underline">
            Membros
          </Link>
        )}
        {session.permissions.includes("membros") && (
          <Link href="/admin/grupos" className="text-primary hover:underline">
            Grupos
          </Link>
        )}
        {session.permissions.includes("membros") && (
          <Link href="/admin/servir" className="text-primary hover:underline">
            Servir
          </Link>
        )}
        {session.permissions.includes("eventos") && (
          <Link href="/admin/eventos" className="text-primary hover:underline">
            Eventos
          </Link>
        )}
        {session.permissions.includes("visitantes") && (
          <Link href="/admin/visitantes" className="text-primary hover:underline">
            Visitantes
          </Link>
        )}
        {session.permissions.includes("congregacoes") && (
          <Link href="/admin/congregacoes" className="text-primary hover:underline">
            Congregações
          </Link>
        )}
        {session.permissions.includes("financeiro") && (
          <Link href="/admin/financeiro" className="text-primary hover:underline">
            Financeiro
          </Link>
        )}
        {session.permissions.includes("admins") && (
          <Link href="/admin/administradores" className="text-primary hover:underline">
            Administradores
          </Link>
        )}
        <Link href="/admin/conta" className="text-primary hover:underline">
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
