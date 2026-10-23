import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import PageBanner from "@/components/layout/PageBanner";
import Card from "@/components/ui/Card";
import ChamadaForm from "@/components/membros/ChamadaForm";
import AddGuestStudentForm from "@/components/membros/AddGuestStudentForm";
import { getActiveTeacher } from "@/lib/teacherAccess";
import { sql } from "@/lib/db";

export const metadata: Metadata = {
  title: "Chamada da EBD | IBCI - Igreja Batista Central do Ibura",
  robots: { index: false, follow: false },
};

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function lastSunday(): string {
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Recife" }));
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default async function SalaProfessorPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ data?: string }>;
}) {
  const teacher = await getActiveTeacher();
  if (!teacher) redirect("/central-do-membro/area");

  const { id } = await params;
  const { data } = await searchParams;
  const date = data && /^\d{4}-\d{2}-\d{2}$/.test(data) ? data : lastSunday();

  const [room] = await sql`
    select c.id, c.name from ebd_classes c
    join ebd_class_teachers t on t.class_id = c.id
    where c.id = ${id} and t.member_id = ${teacher.memberId}
  `;
  if (!room) notFound();

  const [students, attendance, history] = await Promise.all([
    sql`
      select e.id as enrollment_id, coalesce(m.name, c.name, e.guest_name) as name,
             case when e.member_id is not null then 'Membro'
                  when e.child_id is not null then 'Criança'
                  else 'Sem cadastro' end as kind,
             p.name as parent_name,
             (e.guest_name is not null) as is_guest
      from ebd_enrollments e
      left join members m on m.id = e.member_id
      left join member_children c on c.id = e.child_id
      left join members p on p.id = c.member_id
      where e.class_id = ${id}
      order by name asc
    `,
    sql`
      select a.enrollment_id
      from ebd_attendance a
      join ebd_sessions s on s.id = a.session_id
      where s.class_id = ${id} and s.session_date = ${date}::date
    `,
    sql`
      select s.session_date::text as session_date, count(a.enrollment_id)::int as present
      from ebd_sessions s
      left join ebd_attendance a on a.session_id = s.id
      where s.class_id = ${id}
      group by s.id
      order by s.session_date desc
      limit 8
    `,
  ]);

  return (
    <div className="bg-bg-light">
      <PageBanner title="Chamada da EBD" description={room.name} />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Link
          href="/central-do-membro/professor"
          className="mb-6 inline-block text-sm font-semibold text-primary hover:underline"
        >
          ← Voltar à Área do Professor
        </Link>

        <AddGuestStudentForm classId={id} />

        <form method="get" className="mb-6 flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="data" className="mb-1.5 block text-sm font-semibold text-text-neutral">
              Data da aula
            </label>
            <input
              id="data"
              name="data"
              type="date"
              defaultValue={date}
              className="rounded-lg border border-black/10 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button
            type="submit"
            className="rounded-full border border-hairline bg-white px-5 py-2.5 text-sm font-semibold text-primary"
          >
            Ver essa data
          </button>
        </form>

        <p className="mb-4 text-sm text-text-neutral/70">
          Chamada de <strong>{formatDate(date)}</strong>. Marque quem esteve presente e salve; você
          pode corrigir a mesma data quando quiser.
        </p>

        <ChamadaForm
          key={`${id}-${date}`}
          classId={id}
          date={date}
          students={students.map((s) => ({
            enrollmentId: s.enrollment_id,
            name: s.name,
            kind: s.kind,
            parentName: s.parent_name,
            isGuest: Boolean(s.is_guest),
          }))}
          initialPresent={attendance.map((a) => a.enrollment_id)}
        />

        {history.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-3 font-heading text-lg font-semibold text-primary">
              Últimas chamadas
            </h2>
            <div className="flex flex-col gap-2">
              {history.map((h) => (
                <Card key={h.session_date} className="flex items-center justify-between p-4">
                  <Link
                    href={`/central-do-membro/professor/sala/${id}?data=${h.session_date}`}
                    className="font-semibold text-primary hover:underline"
                  >
                    {formatDate(h.session_date)}
                  </Link>
                  <span className="text-sm text-text-neutral/70">
                    {h.present} de {students.length} presentes
                  </span>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
