import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const whatsapp = typeof body?.whatsapp === "string" ? body.whatsapp.trim() : "";
  const sex = typeof body?.sex === "string" ? body.sex.trim() : "";
  const firstVisit = Boolean(body?.firstVisit);
  const visitTimes =
    !firstVisit && Number.isFinite(Number(body?.visitTimes)) && Number(body?.visitTimes) > 0
      ? Math.trunc(Number(body.visitTimes))
      : null;
  const isChristian = Boolean(body?.isChristian);
  const churchName =
    isChristian && typeof body?.churchName === "string" ? body.churchName.trim() : "";
  const location = typeof body?.location === "string" ? body.location.trim() : "";
  const eventSlug = typeof body?.eventSlug === "string" ? body.eventSlug.trim() : "";

  if (!name) {
    return NextResponse.json({ error: "Informe seu nome." }, { status: 400 });
  }
  if (!whatsapp) {
    return NextResponse.json({ error: "Informe seu WhatsApp." }, { status: 400 });
  }

  await sql`
    insert into visitor_registrations
      (name, whatsapp, sex, first_visit, visit_times, is_christian, church_name, location, event_slug)
    values
      (${name}, ${whatsapp}, ${sex || null}, ${firstVisit}, ${visitTimes}, ${isChristian},
       ${churchName || null}, ${location || null}, ${eventSlug || null})
  `;

  return NextResponse.json({ ok: true });
}
