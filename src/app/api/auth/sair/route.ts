import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

export async function POST(request: NextRequest) {
  const body = await request.formData().catch(() => null);
  const next = typeof body?.get("next") === "string" ? String(body.get("next")) : "/";
  const response = NextResponse.redirect(new URL(next, request.url));
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
