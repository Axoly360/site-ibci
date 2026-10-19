import { getSession } from "@/lib/session";
import { sql } from "@/lib/db";

/** Membro logado que é diácono ativo e faz parte da diretoria diaconal. */
export async function getDeaconBoardMember(): Promise<{ memberId: string } | null> {
  const session = await getSession();
  if (!session) return null;

  const [row] = await sql`
    select 1 as ok
    from members
    join deacon_profiles on deacon_profiles.member_id = members.id
    where members.id = ${session.memberId}
      and members.is_validated_member = true
      and deacon_profiles.status = 'ativo'
      and deacon_profiles.is_board = true
  `;
  return row ? { memberId: session.memberId } : null;
}
