import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/admin-session";

export async function POST(request: NextRequest) {
  // 303 (See Other) troca o POST por GET no destino; o 307 padrão reenviaria o
  // POST para a página, que só aceita GET, e o navegador mostraria erro 405.
  const response = NextResponse.redirect(new URL("/admin/entrar", request.url), 303);
  response.cookies.delete(ADMIN_COOKIE);
  return response;
}
