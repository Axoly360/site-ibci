import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { getAdminSession } from "@/lib/admin-session";

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const senhaAtual = typeof body?.senhaAtual === "string" ? body.senhaAtual : "";
  const novaSenha = typeof body?.novaSenha === "string" ? body.novaSenha : "";

  if (novaSenha.length < 6) {
    return NextResponse.json(
      { error: "A nova senha precisa ter pelo menos 6 caracteres." },
      { status: 400 }
    );
  }

  const [admin] = await sql`select password_hash from admin_users where id = ${session.id}`;
  if (!admin || !(await verifyPassword(senhaAtual, admin.password_hash))) {
    return NextResponse.json({ error: "Senha atual incorreta." }, { status: 401 });
  }

  const novoHash = await hashPassword(novaSenha);
  await sql`update admin_users set password_hash = ${novoHash} where id = ${session.id}`;

  return NextResponse.json({ ok: true });
}
