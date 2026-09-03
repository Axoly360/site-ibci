import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminSession, hasPermission, ROLES } from "@/lib/admin-session";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getAdminSession();
  if (!hasPermission(session, "admins")) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const role = typeof body?.role === "string" ? body.role : "";
  const status = body?.status === "convite" ? "convite" : "ativo";

  if (!ROLES[role]) {
    return NextResponse.json({ error: "Função inválida." }, { status: 400 });
  }

  await sql`
    update admin_users
    set role = ${role}, permissions = ${ROLES[role]}, status = ${status}
    where id = ${id}
  `;

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getAdminSession();
  if (!hasPermission(session, "admins")) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }
  if (session?.id === id) {
    return NextResponse.json(
      { error: "Você não pode remover o seu próprio acesso." },
      { status: 400 }
    );
  }

  const [{ count: geraisRestantes }] = await sql`
    select count(*)::int as count from admin_users
    where role = 'Administrador geral' and id != ${id}
  `;
  const [alvo] = await sql`select role from admin_users where id = ${id}`;
  if (alvo?.role === "Administrador geral" && geraisRestantes === 0) {
    return NextResponse.json(
      { error: "Precisa existir pelo menos um Administrador geral." },
      { status: 400 }
    );
  }

  await sql`delete from admin_users where id = ${id}`;
  return NextResponse.json({ ok: true });
}
