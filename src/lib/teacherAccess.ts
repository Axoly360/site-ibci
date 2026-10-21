import { getSession } from "@/lib/session";
import { sql } from "@/lib/db";

/** Membro logado, validado e aprovado como professor ativo da EBD. */
export async function getActiveTeacher(): Promise<{ memberId: string } | null> {
  const session = await getSession();
  if (!session) return null;

  const [row] = await sql`
    select 1 as ok
    from members
    join teacher_profiles on teacher_profiles.member_id = members.id
    where members.id = ${session.memberId}
      and members.is_validated_member = true
      and teacher_profiles.status = 'ativo'
  `;
  return row ? { memberId: session.memberId } : null;
}
