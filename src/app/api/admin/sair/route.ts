import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/admin-session";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/admin/entrar", request.url));
  response.cookies.delete(ADMIN_COOKIE);
  return response;
}
