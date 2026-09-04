import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { hashPassword } from "@/lib/password";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email =
    typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
  const cpf = typeof body?.cpf === "string" ? body.cpf.trim() : "";
  const birthdate = typeof body?.birthdate === "string" ? body.birthdate.trim() : "";
  const address = typeof body?.address === "string" ? body.address.trim() : "";
  const timeAtChurch =
    typeof body?.timeAtChurch === "string" ? body.timeAtChurch.trim() : "";
  const note = typeof body?.note === "string" ? body.note.trim() : "";

  if (!name || !email || !email.includes("@")) {
    return NextResponse.json(
      { error: "Nome e e-mail válidos são obrigatórios." },
      { status: 400 }
    );
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: "A senha precisa ter pelo menos 6 caracteres." },
      { status: 400 }
    );
  }

  const passwordHash = await hashPassword(password);

  const [member] = await sql`
    insert into members (name, email, password_hash)
    values (${name}, ${email}, ${passwordHash})
    on conflict (email) do update
      set name = excluded.name, password_hash = excluded.password_hash
    returning id, is_validated_member
  `;

  if (member.is_validated_member) {
    return NextResponse.json(
      { error: "Este e-mail já é de um membro validado." },
      { status: 409 }
    );
  }

  const [pendente] = await sql`
    select id from membership_requests
    where member_id = ${member.id} and status = 'pendente'
  `;
  if (pendente) {
    return NextResponse.json(
      { error: "Já existe um cadastro em análise para este e-mail." },
      { status: 409 }
    );
  }

  await sql`
    insert into membership_requests
      (member_id, phone, cpf, birthdate, address, time_at_church, note)
    values
      (${member.id}, ${phone}, ${cpf}, ${birthdate}, ${address}, ${timeAtChurch}, ${note})
  `;

  return NextResponse.json({ ok: true });
}
