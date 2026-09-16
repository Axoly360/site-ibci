import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { getAdminSession, hasPermission } from "@/lib/admin-session";
import { QUICK_ACCESS_ICON_KEYS } from "@/lib/quickAccessIcons";

const ACTION_TYPES = ["link", "pix", "info"] as const;

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!hasPermission(session, "paginas")) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const icon = typeof body?.icon === "string" ? body.icon : "";
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const description = typeof body?.description === "string" ? body.description.trim() : "";
  const actionType = body?.actionType;
  const linkUrl = typeof body?.linkUrl === "string" ? body.linkUrl.trim() : "";
  const external = body?.external !== false;
  const ctaLabel = typeof body?.ctaLabel === "string" ? body.ctaLabel.trim() : "";

  if (!QUICK_ACCESS_ICON_KEYS.includes(icon)) {
    return NextResponse.json({ error: "Ícone inválido." }, { status: 400 });
  }
  if (!title || !description) {
    return NextResponse.json(
      { error: "Título e descrição são obrigatórios." },
      { status: 400 }
    );
  }
  if (!ACTION_TYPES.includes(actionType)) {
    return NextResponse.json({ error: "Tipo de ação inválido." }, { status: 400 });
  }
  if (actionType === "link" && !linkUrl) {
    return NextResponse.json(
      { error: "Informe o link para um card do tipo Link." },
      { status: 400 }
    );
  }

  const [{ max_position }] = await sql`
    select coalesce(max(position), -1) as max_position from quick_access_cards
  `;

  await sql`
    insert into quick_access_cards
      (icon, title, description, action_type, link_url, external, cta_label, position)
    values (
      ${icon}, ${title}, ${description}, ${actionType},
      ${actionType === "link" ? linkUrl : null}, ${external}, ${ctaLabel || null},
      ${max_position + 1}
    )
  `;

  revalidatePath("/");

  return NextResponse.json({ ok: true });
}
