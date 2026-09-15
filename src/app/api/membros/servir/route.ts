import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/session";
import { MINISTRIES } from "@/lib/ministries";
import { CONSENT_TERMS } from "@/lib/consentTerms";

const REQUIRED_CONSENT_KEYS = CONSENT_TERMS.map((t) => t.key);

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const [member] = await sql`
    select is_validated_member from members where id = ${session.memberId}
  `;
  if (!member?.is_validated_member) {
    return NextResponse.json({ error: "Cadastro ainda não validado." }, { status: 403 });
  }

  const accepted = await sql`
    select term_key from member_consents where member_id = ${session.memberId}
  `;
  const acceptedKeys = new Set(accepted.map((a: { term_key: string }) => a.term_key));
  const missing = REQUIRED_CONSENT_KEYS.filter((key) => !acceptedKeys.has(key));
  if (missing.length > 0) {
    return NextResponse.json(
      { error: "Aceite os termos de Consentimento antes de se voluntariar." },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => null);
  const ministries = Array.isArray(body?.ministries)
    ? body.ministries.filter((m: unknown): m is string => MINISTRIES.includes(m as never))
    : [];
  const note = typeof body?.note === "string" ? body.note.trim() : "";
  const congregationId = typeof body?.congregationId === "string" ? body.congregationId : "";

  if (ministries.length === 0) {
    return NextResponse.json(
      { error: "Selecione pelo menos um ministério." },
      { status: 400 }
    );
  }

  let validCongregationId: string | null = null;
  if (congregationId) {
    const [congregation] = await sql`
      select id from congregations where id = ${congregationId}
    `;
    if (!congregation) {
      return NextResponse.json({ error: "Organização inválida." }, { status: 400 });
    }
    validCongregationId = congregation.id;
  }

  await sql`
    insert into volunteer_registrations (member_id, ministries, note, congregation_id)
    values (${session.memberId}, ${ministries}, ${note || null}, ${validCongregationId})
    on conflict (member_id) do update
      set ministries = excluded.ministries, note = excluded.note,
          congregation_id = excluded.congregation_id, updated_at = now()
  `;

  return NextResponse.json({ ok: true });
}
