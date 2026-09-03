import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { getAdminSession, hasPermission, ROLES } from "@/lib/admin-session";

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!hasPermission(session, "admins")) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email =
    typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const role = typeof body?.role === "string" ? body.role : "";

  if (!name || !email || !password || !ROLES[role]) {
    return NextResponse.json(
      { error: "Nome, e-mail, senha inicial e função válidos são obrigatórios." },
      { status: 400 }
    );
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: "A senha inicial precisa ter pelo menos 6 caracteres." },
      { status: 400 }
    );
  }

  const passwordHash = await hashPassword(password);

  try {
    await sql`
      insert into admin_users (name, email, password_hash, role, permissions, status)
      values (${name}, ${email}, ${passwordHash}, ${role}, ${ROLES[role]}, 'ativo')
    `;
  } catch {
    return NextResponse.json(
      { error: "Já existe um administrador com esse e-mail." },
      { status: 409 }
    );
  }

  return NextResponse.json({ ok: true });
}
