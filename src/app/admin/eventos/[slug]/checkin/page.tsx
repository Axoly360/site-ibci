import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import PageBanner from "@/components/layout/PageBanner";
import AdminNav from "@/components/admin/AdminNav";
import CheckinPanel from "@/components/admin/CheckinPanel";
import { getAdminSession, hasPermission } from "@/lib/admin-session";
import { getEventBySlug } from "@/lib/events";

export const metadata: Metadata = {
  title: "Check-in | Painel IBCI",
  robots: { index: false, follow: false },
};

export default async function AdminCheckinPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/entrar");
  if (!hasPermission(session, "eventos")) redirect("/admin");

  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  return (
    <div className="bg-bg-light">
      <AdminNav session={session} />
      <PageBanner title="Check-in" description={event.title} />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <CheckinPanel eventSlug={slug} />
      </div>
    </div>
  );
}
