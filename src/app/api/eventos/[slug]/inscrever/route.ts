import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/session";
import { events } from "@/data/events";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const event = events.find((e) => e.slug === slug);
  if (!event) {
    return NextResponse.json({ error: "Evento não encontrado." }, { status: 404 });
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "É preciso confirmar seu e-mail primeiro." }, { status: 401 });
  }

  if (event.capacity) {
    const [{ count }] = await sql`
      select count(*)::int as count from registrations where event_slug = ${slug}
    `;
    if (count >= event.capacity) {
      return NextResponse.json({ error: "Não há mais vagas disponíveis." }, { status: 409 });
    }
  }

  await sql`
    insert into registrations (event_slug, member_id)
    values (${slug}, ${session.memberId})
    on conflict (event_slug, member_id) do nothing
  `;

  return NextResponse.json({ ok: true });
}
