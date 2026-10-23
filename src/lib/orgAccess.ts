import { getSession } from "@/lib/session";
import { sql } from "@/lib/db";

export interface BoardOrg {
  id: string;
  name: string;
  short_name: string;
}

/**
 * Organizações em que o membro logado (validado) tem cargo de diretoria em
 * exercício — Presidente ou Vice-presidente com o mandato vigente hoje.
 * Retorna null se não tiver nenhuma.
 */
export async function getBoardOrgs(): Promise<{ memberId: string; orgs: BoardOrg[] } | null> {
  const session = await getSession();
  if (!session) return null;

  const rows = await sql`
    select distinct g.id, g.name, g.short_name, g.position
    from member_offices o
    join church_organizations g on g.id = o.organization_id
    join members m on m.id = o.member_id
    where o.member_id = ${session.memberId}
      and m.is_validated_member = true
      and o.start_date <= current_date
      and (o.end_date is null or o.end_date >= current_date)
    order by g.position asc
  `;
  if (rows.length === 0) return null;

  return {
    memberId: session.memberId,
    orgs: rows.map((r) => ({ id: r.id as string, name: r.name as string, short_name: r.short_name as string })),
  };
}

/** id do membro logado se ele faz parte da diretoria em exercício desta organização; senão null. */
export async function getBoardMemberFor(orgId: string): Promise<string | null> {
  const board = await getBoardOrgs();
  return board && board.orgs.some((o) => o.id === orgId) ? board.memberId : null;
}
