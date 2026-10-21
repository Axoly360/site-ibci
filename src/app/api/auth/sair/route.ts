import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

export async function POST(request: NextRequest) {
  const body = await request.formData().catch(() => null);
  const raw = body?.get("next");
  // Só caminhos internos: "//site.com" e URLs absolutas viram a página inicial.
  const next = typeof raw === "string" && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/";
  // 303 (See Other) troca o POST por GET no destino; o 307 padrão reenviaria o
  // POST para a página, que só aceita GET, e o navegador mostraria erro 405.
  const response = NextResponse.redirect(new URL(next, request.url), 303);
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
