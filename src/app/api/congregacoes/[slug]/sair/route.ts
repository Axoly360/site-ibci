import { NextRequest, NextResponse } from "next/server";
import { CONGREGATION_COOKIE } from "@/lib/congregation-session";

export async function POST(request: NextRequest) {
  const formData = await request.formData().catch(() => null);
  const next = typeof formData?.get("next") === "string" ? String(formData.get("next")) : "/";

  const response = NextResponse.redirect(new URL(next, request.url));
  response.cookies.delete(CONGREGATION_COOKIE);
  return response;
}
