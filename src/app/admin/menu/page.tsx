import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PageBanner from "@/components/layout/PageBanner";
import AdminNav from "@/components/admin/AdminNav";
import MenuManager from "@/components/admin/MenuManager";
import { getAdminSession, hasPermission } from "@/lib/admin-session";
import { sql } from "@/lib/db";
import type { NavItemRow } from "@/lib/navItems";

export const metadata: Metadata = {
  title: "Menu | Painel IBCI",
  robots: { index: false, follow: false },
};

export default async function AdminMenuPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/entrar");
  if (!hasPermission(session, "paginas")) redirect("/admin");

  const items: NavItemRow[] = await sql`
    select id, parent_id, label, href, value, position, visible
    from nav_items
    order by position asc
  `;

  return (
    <div className="bg-bg-light">
      <AdminNav session={session} />
      <PageBanner
        title="Menu"
        description="Categorias e subcategorias do menu do site."
      />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <MenuManager items={items} />
      </div>
    </div>
  );
}
