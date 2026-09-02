import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import {
  SESSION_COOKIE,
  createSessionCookieValue,
  sessionCookieOptions,
} from "@/lib/session";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/para-voce/eventos", request.url));
  }

  const [row] = await sql`
    select login_tokens.member_id, login_tokens.event_slug, login_tokens.expires_at,
           login_tokens.used_at, members.name, members.email
    from login_tokens
    join members on members.id = login_tokens.member_id
    where login_tokens.token = ${token}
  `;

  if (!row || row.used_at || new Date(row.expires_at) < new Date()) {
    const invalidUrl = new URL("/para-voce/eventos", request.url);
    invalidUrl.searchParams.set("erro", "link-invalido");
    return NextResponse.redirect(invalidUrl);
  }

  await sql`update login_tokens set used_at = now() where token = ${token}`;
  await sql`
    update members set email_verified_at = coalesce(email_verified_at, now())
    where id = ${row.member_id}
  `;

  let destination = new URL("/para-voce/eventos", request.url);
  destination.searchParams.set("confirmado", "1");

  if (row.event_slug) {
    await sql`
      insert into registrations (event_slug, member_id)
      values (${row.event_slug}, ${row.member_id})
      on conflict (event_slug, member_id) do nothing
    `;
    destination = new URL(`/para-voce/eventos/${row.event_slug}`, request.url);
    destination.searchParams.set("inscrito", "1");
  }

  const response = NextResponse.redirect(destination);
  response.cookies.set(
    SESSION_COOKIE,
    createSessionCookieValue({
      memberId: row.member_id,
      name: row.name,
      email: row.email,
    }),
    sessionCookieOptions
  );
  return response;
}
