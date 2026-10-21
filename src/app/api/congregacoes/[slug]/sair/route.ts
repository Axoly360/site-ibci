import { NextRequest, NextResponse } from "next/server";
import { CONGREGATION_COOKIE } from "@/lib/congregation-session";

export async function POST(request: NextRequest) {
  const formData = await request.formData().catch(() => null);
  const raw = formData?.get("next");
  // Só caminhos internos: "//site.com" e URLs absolutas viram a página inicial.
  const next = typeof raw === "string" && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/";

  // 303 (See Other) troca o POST por GET no destino; o 307 padrão reenviaria o
  // POST para a página, que só aceita GET, e o navegador mostraria erro 405.
  const response = NextResponse.redirect(new URL(next, request.url), 303);
  response.cookies.delete(CONGREGATION_COOKIE);
  return response;
}
