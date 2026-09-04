import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import {
  SESSION_COOKIE,
  createSessionCookieValue,
  sessionCookieOptions,
} from "@/lib/session";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const email =
    typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "E-mail e senha são obrigatórios." },
      { status: 400 }
    );
  }

  const [member] = await sql`select * from members where email = ${email}`;

  if (!member || !member.password_hash || !(await verifyPassword(password, member.password_hash))) {
    return NextResponse.json({ error: "E-mail ou senha inválidos." }, { status: 401 });
  }

  const response = NextResponse.json({
    ok: true,
    validated: member.is_validated_member,
  });
  response.cookies.set(
    SESSION_COOKIE,
    createSessionCookieValue({
      memberId: member.id,
      name: member.name,
      email: member.email,
    }),
    sessionCookieOptions
  );
  return response;
}
