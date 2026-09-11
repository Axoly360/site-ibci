import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminSession, hasPermission } from "@/lib/admin-session";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const session = await getAdminSession();
  if (!hasPermission(session, "financeiro")) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const annualBudget = Number(body?.annualBudget);

  if (!Number.isFinite(annualBudget) || annualBudget < 0) {
    return NextResponse.json({ error: "Informe um valor válido." }, { status: 400 });
  }

  const [updated] = await sql`
    update congregations set annual_budget = ${annualBudget} where slug = ${slug}
    returning id
  `;
  if (!updated) {
    return NextResponse.json({ error: "Congregação não encontrada." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
