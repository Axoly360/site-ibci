import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import {
  ADMIN_COOKIE,
  adminCookieOptions,
  createAdminCookieValue,
  getAdminSession,
} from "@/lib/admin-session";

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const senhaAtual = typeof body?.senhaAtual === "string" ? body.senhaAtual : "";
  const novaSenha = typeof body?.novaSenha === "string" ? body.novaSenha : "";

  if (novaSenha.length < 8) {
    return NextResponse.json(
      { error: "A nova senha precisa ter pelo menos 8 caracteres." },
      { status: 400 }
    );
  }

  const [admin] = await sql`select password_hash from admin_users where id = ${session.id}`;
  if (!admin || !(await verifyPassword(senhaAtual, admin.password_hash))) {
    return NextResponse.json({ error: "Senha atual incorreta." }, { status: 401 });
  }

  const novoHash = await hashPassword(novaSenha);
  // Incrementa session_version: invalida qualquer outro cookie de sessão
  // deste admin que já exista (ex.: sessão roubada) — ver getAdminSession().
  const [updated] = await sql`
    update admin_users
    set password_hash = ${novoHash}, session_version = session_version + 1
    where id = ${session.id}
    returning session_version
  `;

  // Reemite o cookie da PRÓPRIA sessão atual com a nova versão — senão o
  // admin que acabou de trocar a senha seria deslogado no ato.
  const response = NextResponse.json({ ok: true });
  response.cookies.set(
    ADMIN_COOKIE,
    createAdminCookieValue({ ...session, sessionVersion: updated.session_version }),
    adminCookieOptions
  );
  return response;
}
