import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getBoardMemberFor } from "@/lib/orgAccess";

/**
 * Busca de membros validados por nome para a diretoria adicionar integrantes.
 * Só devolve nome (sem e-mail ou telefone), no máximo 8 resultados e só com
 * 2+ letras digitadas — assim a diretoria não enxerga a lista completa de
 * membros da igreja, só quem ela procura.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params;
  if (!(await getBoardMemberFor(orgId))) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const q = (request.nextUrl.searchParams.get("q") ?? "").trim();
  if (q.length < 2 || q.length > 60) {
    return NextResponse.json({ results: [] });
  }

  const pattern = `%${q.replace(/[\\%_]/g, "\\$&")}%`;
  const results = await sql`
    select m.id, m.name
    from members m
    where m.is_validated_member = true
      and m.name ilike ${pattern}
      and m.id not in (
        select member_id from organization_members
        where organization_id = ${orgId} and status = 'ativo'
      )
    order by m.name asc
    limit 8
  `;
  return NextResponse.json({ results });
}
