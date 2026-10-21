import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, BookOpen, CalendarClock, MapPin, Users } from "lucide-react";
import PageBanner from "@/components/layout/PageBanner";
import BackToMemberArea from "@/components/membros/BackToMemberArea";
import Card from "@/components/ui/Card";
import { getActiveTeacher } from "@/lib/teacherAccess";
import { sql } from "@/lib/db";

export const metadata: Metadata = {
  title: "Área do Professor | IBCI - Igreja Batista Central do Ibura",
  robots: { index: false, follow: false },
};

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export default async function AreaDoProfessorPage() {
  const teacher = await getActiveTeacher();
  if (!teacher) redirect("/central-do-membro/area");

  const rooms = await sql`
    select c.id, c.name, c.audience, c.meeting_time, c.location, c.description, c.teacher_name,
           (select count(*)::int from ebd_enrollments e where e.class_id = c.id) as students,
           (select count(*)::int from ebd_sessions s where s.class_id = c.id) as sessions,
           (select count(*)::int from ebd_attendance a join ebd_sessions s on s.id = a.session_id
              where s.class_id = c.id) as total_present,
           (select s.session_date::text from ebd_sessions s where s.class_id = c.id
              order by s.session_date desc limit 1) as last_date,
           (select count(*)::int from ebd_attendance a where a.session_id = (
              select s.id from ebd_sessions s where s.class_id = c.id
              order by s.session_date desc limit 1)) as last_present
    from ebd_classes c
    where c.id in (select class_id from ebd_class_teachers where member_id = ${teacher.memberId})
    order by c.name asc
  `;

  return (
    <div className="bg-bg-light">
      <PageBanner
        title="Área do Professor"
        description="Suas salas da EBD, seus alunos e a chamada de cada domingo."
      />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <BackToMemberArea />

        {rooms.length === 0 ? (
          <Card className="p-6">
            <p className="font-semibold text-text-neutral">Você ainda não tem sala atribuída.</p>
            <p className="mt-1 text-sm text-text-neutral/70">
              A Secretaria define o professor de cada sala em Admin → EBD. Assim que a sua sala for
              atribuída, ela aparece aqui.
            </p>
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            {rooms.map((room) => {
              const avg =
                room.sessions > 0 ? Math.round((room.total_present / room.sessions) * 10) / 10 : null;
              return (
                <Card key={room.id} className="flex flex-col gap-3 p-6">
                  <h2 className="font-heading text-lg font-semibold text-primary">
                    {room.name}
                    {room.audience && (
                      <span className="ml-2 rounded-full bg-primary/10 px-2.5 py-0.5 align-middle text-xs font-semibold text-primary">
                        {room.audience}
                      </span>
                    )}
                  </h2>
                  <div className="flex flex-col gap-1 text-sm text-text-neutral/70">
                    {room.meeting_time && (
                      <span className="flex items-center gap-1.5">
                        <CalendarClock className="h-4 w-4 shrink-0" />
                        {room.meeting_time}
                      </span>
                    )}
                    {room.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 shrink-0" />
                        {room.location}
                      </span>
                    )}
                    {room.teacher_name && (
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="h-4 w-4 shrink-0" />
                        Professores: {room.teacher_name}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Users className="h-4 w-4 shrink-0" />
                      {room.students} {room.students === 1 ? "aluno" : "alunos"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="h-4 w-4 shrink-0" />
                      {room.sessions === 0
                        ? "Nenhuma chamada lançada ainda"
                        : `Última chamada: ${formatDate(room.last_date)} — ${room.last_present} de ${room.students} presentes · média ${avg} por domingo (${room.sessions} chamada${room.sessions > 1 ? "s" : ""})`}
                    </span>
                  </div>
                  {room.description && (
                    <p className="text-sm text-text-neutral/80">{room.description}</p>
                  )}
                  <Link
                    href={`/central-do-membro/professor/sala/${room.id}`}
                    className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-dark"
                  >
                    Alunos e chamada
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
