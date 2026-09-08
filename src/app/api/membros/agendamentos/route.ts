import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const bookings = await sql`
    select id, event_type, desired_date, message, status, requested_at
    from booking_requests
    where member_id = ${session.memberId}
    order by requested_at desc
  `;

  return NextResponse.json({ bookings });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const eventType = typeof body?.eventType === "string" ? body.eventType.trim() : "";
  const desiredDate = typeof body?.desiredDate === "string" ? body.desiredDate.trim() : "";
  const message = typeof body?.message === "string" ? body.message.trim() : "";

  if (!eventType) {
    return NextResponse.json({ error: "Informe o tipo de evento." }, { status: 400 });
  }

  await sql`
    insert into booking_requests (member_id, event_type, desired_date, message)
    values (${session.memberId}, ${eventType}, ${desiredDate || null}, ${message || null})
  `;

  return NextResponse.json({ ok: true });
}
