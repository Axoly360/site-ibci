import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/session";
import { getEventBySlug } from "@/lib/events";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) {
    return NextResponse.json({ error: "Evento não encontrado." }, { status: 404 });
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "É preciso confirmar seu e-mail primeiro." }, { status: 401 });
  }

  // Checagem de vaga e insert num único statement — evita a janela de corrida
  // entre "contar vagas" e "inserir" quando duas pessoas se inscrevem quase
  // ao mesmo tempo perto do limite (antes eram dois passos separados).
  const [inserted] = await sql`
    insert into registrations (event_slug, member_id)
    select ${slug}, ${session.memberId}
    where ${event.capacity}::int is null
       or (select count(*)::int from registrations where event_slug = ${slug}) < ${event.capacity}
    on conflict (event_slug, member_id) do nothing
    returning id
  `;

  if (!inserted) {
    const [already] = await sql`
      select id from registrations where event_slug = ${slug} and member_id = ${session.memberId}
    `;
    if (!already) {
      return NextResponse.json({ error: "Não há mais vagas disponíveis." }, { status: 409 });
    }
  }

  return NextResponse.json({ ok: true });
}
