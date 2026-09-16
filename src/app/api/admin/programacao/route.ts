import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { getAdminSession, hasPermission } from "@/lib/admin-session";

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!hasPermission(session, "paginas")) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const day = typeof body?.day === "string" ? body.day.trim() : "";
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const time = typeof body?.time === "string" ? body.time.trim() : "";
  const description = typeof body?.description === "string" ? body.description.trim() : "";

  if (!day || !title || !time || !description) {
    return NextResponse.json(
      { error: "Dia, título, horário e descrição são obrigatórios." },
      { status: 400 }
    );
  }

  const [{ max_position }] = await sql`
    select coalesce(max(position), -1) as max_position from weekly_schedule_items
  `;

  await sql`
    insert into weekly_schedule_items (day, title, time, description, position)
    values (${day}, ${title}, ${time}, ${description}, ${max_position + 1})
  `;

  revalidatePath("/");

  return NextResponse.json({ ok: true });
}
