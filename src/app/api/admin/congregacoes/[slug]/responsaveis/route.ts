import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { getAdminSession, hasPermission } from "@/lib/admin-session";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const session = await getAdminSession();
  if (!hasPermission(session, "congregacoes")) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const [congregation] = await sql`select id from congregations where slug = ${slug}`;
  if (!congregation) {
    return NextResponse.json({ error: "Congregação não encontrada." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "Nome, e-mail e senha inicial são obrigatórios." },
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
      insert into congregation_users (congregation_id, name, email, password_hash, status)
      values (${congregation.id}, ${name}, ${email}, ${passwordHash}, 'ativo')
    `;
  } catch {
    return NextResponse.json(
      { error: "Já existe um responsável com esse e-mail." },
      { status: 409 }
    );
  }

  return NextResponse.json({ ok: true });
}
