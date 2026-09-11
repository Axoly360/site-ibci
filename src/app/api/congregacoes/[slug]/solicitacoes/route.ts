import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCongregationSession } from "@/lib/congregation-session";

const CATEGORIES = ["Verba", "Material", "Evento", "Visita Pastoral", "Outro"];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const session = await getCongregationSession();
  if (!session || session.congregationSlug !== slug) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const category = typeof body?.category === "string" ? body.category.trim() : "";
  const description = typeof body?.description === "string" ? body.description.trim() : "";
  const estimatedAmount =
    body?.estimatedAmount !== undefined && body?.estimatedAmount !== ""
      ? Number(body.estimatedAmount)
      : null;

  if (!CATEGORIES.includes(category)) {
    return NextResponse.json({ error: "Escolha uma categoria válida." }, { status: 400 });
  }
  if (!description) {
    return NextResponse.json({ error: "Descreva a solicitação." }, { status: 400 });
  }
  if (estimatedAmount !== null && (!Number.isFinite(estimatedAmount) || estimatedAmount < 0)) {
    return NextResponse.json({ error: "Valor estimado inválido." }, { status: 400 });
  }

  await sql`
    insert into congregation_requests
      (congregation_id, congregation_user_id, category, description, estimated_amount)
    values (${session.congregationId}, ${session.id}, ${category}, ${description}, ${estimatedAmount})
  `;

  return NextResponse.json({ ok: true });
}
