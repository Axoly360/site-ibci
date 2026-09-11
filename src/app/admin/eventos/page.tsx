import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PageBanner from "@/components/layout/PageBanner";
import AdminNav from "@/components/admin/AdminNav";
import EventsManager from "@/components/admin/EventsManager";
import { getAdminSession, hasPermission } from "@/lib/admin-session";
import { sql } from "@/lib/db";

export const metadata: Metadata = {
  title: "Eventos | Painel IBCI",
  robots: { index: false, follow: false },
};

export default async function AdminEventosPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/entrar");
  if (!hasPermission(session, "eventos")) redirect("/admin");

  const events = await sql`
    select id, slug, title, description, date_label, location, capacity, price, image_url,
           external_contact_label, external_contact_whatsapp_message
    from events
    order by created_at desc
  `;

  return (
    <div className="bg-bg-light">
      <AdminNav session={session} />
      <PageBanner
        title="Eventos"
        description="Crie, edite e remova os eventos exibidos no site — inclusive o carrossel Eventos do Mês da home."
      />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <EventsManager events={events} />
      </div>
    </div>
  );
}
