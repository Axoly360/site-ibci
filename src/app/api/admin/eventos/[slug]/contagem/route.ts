import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminSession, hasPermission } from "@/lib/admin-session";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getAdminSession();
  if (!hasPermission(session, "eventos")) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const { slug } = await params;

  const [{ total, checkins }] = await sql`
    select count(*)::int as total,
           count(checked_in_at)::int as checkins
    from event_attendees
    where event_slug = ${slug}
  `;

  return NextResponse.json({ total, checkins });
}
