import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import {
  ADMIN_COOKIE,
  adminCookieOptions,
  createAdminCookieValue,
  ROLES,
} from "@/lib/admin-session";
import { isLoginRateLimited, recordLoginAttempt, LOGIN_RATE_LIMIT_MESSAGE } from "@/lib/rateLimit";

const SCOPE = "admin";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const email =
    typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "E-mail e senha são obrigatórios." },
      { status: 400 }
    );
  }

  if (await isLoginRateLimited(SCOPE, email)) {
    return NextResponse.json({ error: LOGIN_RATE_LIMIT_MESSAGE }, { status: 429 });
  }

  const [admin] = await sql`select * from admin_users where email = ${email}`;

  if (!admin) {
    // Bootstrap: enquanto não existir nenhum administrador cadastrado, a
    // senha compartilhada (ADMIN_PASSWORD) cria a primeira conta real,
    // como Administrador geral, usando o e-mail informado agora.
    const [{ count }] = await sql`select count(*)::int as count from admin_users`;
    const legacyPassword = process.env.ADMIN_PASSWORD;

    if (count === 0 && legacyPassword && password === legacyPassword) {
      const name = email.split("@")[0].replace(/[._]/g, " ");
      const passwordHash = await hashPassword(password);
      const role = "Administrador geral";
      const [created] = await sql`
        insert into admin_users (name, email, password_hash, role, permissions, status)
        values (${name}, ${email}, ${passwordHash}, ${role}, ${ROLES[role]}, 'ativo')
        returning id, name, email, role, permissions, session_version
      `;
      const response = NextResponse.json({ ok: true });
      response.cookies.set(
        ADMIN_COOKIE,
        createAdminCookieValue({
          id: created.id,
          name: created.name,
          email: created.email,
          role: created.role,
          permissions: created.permissions,
          sessionVersion: created.session_version,
        }),
        adminCookieOptions
      );
      await recordLoginAttempt(SCOPE, email, true);
      return response;
    }

    await recordLoginAttempt(SCOPE, email, false);
    return NextResponse.json({ error: "E-mail ou senha inválidos." }, { status: 401 });
  }

  if (admin.status !== "ativo") {
    await recordLoginAttempt(SCOPE, email, false);
    return NextResponse.json(
      { error: "Este acesso está desativado." },
      { status: 403 }
    );
  }

  const valid = await verifyPassword(password, admin.password_hash);
  if (!valid) {
    await recordLoginAttempt(SCOPE, email, false);
    return NextResponse.json({ error: "E-mail ou senha inválidos." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(
    ADMIN_COOKIE,
    createAdminCookieValue({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
      sessionVersion: admin.session_version,
    }),
    adminCookieOptions
  );
  await recordLoginAttempt(SCOPE, email, true);
  return response;
}
