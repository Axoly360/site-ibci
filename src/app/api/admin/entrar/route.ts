import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  adminCookieOptions,
  checkAdminPassword,
  createAdminCookieValue,
} from "@/lib/admin-session";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";

  let valid = false;
  try {
    valid = checkAdminPassword(password);
  } catch {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD não configurado no projeto." },
      { status: 500 }
    );
  }

  if (!valid) {
    return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, createAdminCookieValue(), adminCookieOptions);
  return response;
}
