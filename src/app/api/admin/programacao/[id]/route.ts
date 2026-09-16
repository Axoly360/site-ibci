import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { getAdminSession, hasPermission } from "@/lib/admin-session";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

  await sql`
    update weekly_schedule_items
    set day = ${day}, title = ${title}, time = ${time}, description = ${description}
    where id = ${id}
  `;

  revalidatePath("/");

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getAdminSession();
  if (!hasPermission(session, "paginas")) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  await sql`delete from weekly_schedule_items where id = ${id}`;

  revalidatePath("/");

  return NextResponse.json({ ok: true });
}
