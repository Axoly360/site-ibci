import { NextRequest, NextResponse } from "next/server";
import { getAdminSession, hasPermission } from "@/lib/admin-session";
import { getContent, setContent } from "@/lib/content";
import {
  HOME_SECTION_ORDER_KEY,
  parseHomeSectionOrder,
  type HomeSectionKey,
} from "@/lib/homeSections";

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!hasPermission(session, "paginas")) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const key = typeof body?.key === "string" ? (body.key as HomeSectionKey) : null;
  const direction = body?.direction === "up" ? "up" : "down";

  if (!key) {
    return NextResponse.json({ error: "Seção inválida." }, { status: 400 });
  }

  const raw = await getContent(HOME_SECTION_ORDER_KEY, "");
  const order = parseHomeSectionOrder(raw);

  const index = order.indexOf(key);
  const swapWith = direction === "up" ? index - 1 : index + 1;

  if (index === -1 || swapWith < 0 || swapWith >= order.length) {
    return NextResponse.json({ ok: true }); // já está na ponta, nada a fazer
  }

  [order[index], order[swapWith]] = [order[swapWith], order[index]];
  await setContent(HOME_SECTION_ORDER_KEY, JSON.stringify(order));

  return NextResponse.json({ ok: true });
}
