import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PageBanner from "@/components/layout/PageBanner";
import AdminNav from "@/components/admin/AdminNav";
import Card from "@/components/ui/Card";
import { getAdminSession, hasPermission } from "@/lib/admin-session";
import { sql } from "@/lib/db";
import { MINISTRIES } from "@/lib/ministries";

export const metadata: Metadata = {
  title: "Servir | Painel IBCI",
  robots: { index: false, follow: false },
};

export default async function AdminServirPage({
  searchParams,
}: {
  searchParams: Promise<{ ministerio?: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/entrar");
  if (!hasPermission(session, "membros")) redirect("/admin");

  const { ministerio } = await searchParams;

  const rows = ministerio
    ? await sql`
        select volunteer_registrations.id, members.name, members.email, members.phone,
               volunteer_registrations.ministries, volunteer_registrations.note,
               volunteer_registrations.updated_at, congregations.name as congregation_name
        from volunteer_registrations
        join members on members.id = volunteer_registrations.member_id
        left join congregations on congregations.id = volunteer_registrations.congregation_id
        where ${ministerio} = any(volunteer_registrations.ministries)
        order by members.name asc
      `
    : await sql`
        select volunteer_registrations.id, members.name, members.email, members.phone,
               volunteer_registrations.ministries, volunteer_registrations.note,
               volunteer_registrations.updated_at, congregations.name as congregation_name
        from volunteer_registrations
        join members on members.id = volunteer_registrations.member_id
        left join congregations on congregations.id = volunteer_registrations.congregation_id
        order by members.name asc
      `;

  return (
    <div className="bg-bg-light">
      <AdminNav session={session} />
      <PageBanner
        title="Servir"
        description="Membros que se cadastraram para servir em cada ministério."
      />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap gap-2">
          <a
            href="/admin/servir"
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              !ministerio ? "bg-primary text-white" : "bg-white text-text-neutral/70"
            }`}
          >
            Todos
          </a>
          {MINISTRIES.map((m) => (
            <a
              key={m}
              href={`/admin/servir?ministerio=${encodeURIComponent(m)}`}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                ministerio === m ? "bg-primary text-white" : "bg-white text-text-neutral/70"
              }`}
            >
              {m}
            </a>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {rows.length === 0 ? (
            <p className="text-sm text-text-neutral/60">Nenhum voluntário cadastrado ainda.</p>
          ) : (
            rows.map((r) => (
              <Card key={r.id} className="p-4">
                <p className="font-semibold text-text-neutral">{r.name}</p>
                <p className="text-sm text-text-neutral/60">
                  {[r.email, r.phone].filter(Boolean).join(" · ")}
                </p>
                <p className="mt-1 text-xs font-semibold text-secondary">
                  {r.congregation_name ? `Congregação ${r.congregation_name}` : "Sede"}
                </p>
                <p className="mt-2 flex flex-wrap gap-1.5">
                  {(r.ministries as string[]).map((m) => (
                    <span
                      key={m}
                      className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary"
                    >
                      {m}
                    </span>
                  ))}
                </p>
                {r.note && <p className="mt-2 text-sm text-text-neutral/80">{r.note}</p>}
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
