import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { consumeResetToken } from "@/lib/passwordReset";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : "";
  const novaSenha = typeof body?.novaSenha === "string" ? body.novaSenha : "";

  if (!token) {
    return NextResponse.json({ error: "Link inválido." }, { status: 400 });
  }
  if (novaSenha.length < 8) {
    return NextResponse.json(
      { error: "A nova senha precisa ter pelo menos 8 caracteres." },
      { status: 400 }
    );
  }

  const consumed = await consumeResetToken(token);
  if (!consumed) {
    return NextResponse.json(
      { error: "Este link expirou ou já foi usado. Solicite um novo." },
      { status: 400 }
    );
  }

  const passwordHash = await hashPassword(novaSenha);

  // Incrementa session_version nos dois casos: derruba qualquer sessão
  // aberta com a senha antiga (ver getAdminSession/getSession).
  if (consumed.scope === "admin") {
    await sql`
      update admin_users
      set password_hash = ${passwordHash}, session_version = session_version + 1
      where id = ${consumed.accountId}
    `;
  } else {
    await sql`
      update members
      set password_hash = ${passwordHash}, session_version = session_version + 1
      where id = ${consumed.accountId}
    `;
  }

  return NextResponse.json({ ok: true });
}
