import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminSession, hasPermission, ROLES } from "@/lib/admin-session";

async function assertNotLastGeralAffected(id: string, willStayGeral: boolean) {
  if (willStayGeral) return null;
  const [alvo] = await sql`select role from admin_users where id = ${id}`;
  if (alvo?.role !== "Administrador geral") return null;

  const [{ count }] = await sql`
    select count(*)::int as count from admin_users
    where role = 'Administrador geral' and status = 'ativo' and id != ${id}
  `;
  if (count === 0) {
    return NextResponse.json(
      { error: "Precisa existir pelo menos um Administrador geral ativo." },
      { status: 400 }
    );
  }
  return null;
}

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
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email =
    typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const role = typeof body?.role === "string" ? body.role : "";
  const status = body?.status === "inativo" ? "inativo" : "ativo";

  if (!name || !email || !ROLES[role]) {
    return NextResponse.json(
      { error: "Nome, e-mail e função válidos são obrigatórios." },
      { status: 400 }
    );
  }

  if (status === "inativo" && session?.id === id) {
    return NextResponse.json(
      { error: "Você não pode desativar o seu próprio acesso." },
      { status: 400 }
    );
  }

  const willStayGeral = role === "Administrador geral" && status === "ativo";
  const blocked = await assertNotLastGeralAffected(id, willStayGeral);
  if (blocked) return blocked;

  try {
    await sql`
      update admin_users
      set name = ${name}, email = ${email}, role = ${role},
          permissions = ${ROLES[role]}, status = ${status}
      where id = ${id}
    `;
  } catch {
    return NextResponse.json(
      { error: "Já existe um administrador com esse e-mail." },
      { status: 409 }
    );
  }

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

  const blocked = await assertNotLastGeralAffected(id, false);
  if (blocked) return blocked;

  await sql`delete from admin_users where id = ${id}`;
  return NextResponse.json({ ok: true });
}
