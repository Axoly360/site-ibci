import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/session";
import { CONSENT_TERMS } from "@/lib/consentTerms";

function isValidTermKey(key: unknown): key is string {
  return typeof key === "string" && CONSENT_TERMS.some((term) => term.key === key);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const termKey = body?.termKey;
  if (!isValidTermKey(termKey)) {
    return NextResponse.json({ error: "Termo inválido." }, { status: 400 });
  }

  await sql`
    insert into member_consents (member_id, term_key)
    values (${session.memberId}, ${termKey})
    on conflict (member_id, term_key) do update set accepted_at = now()
  `;

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const termKey = body?.termKey;
  if (!isValidTermKey(termKey)) {
    return NextResponse.json({ error: "Termo inválido." }, { status: 400 });
  }

  await sql`
    delete from member_consents
    where member_id = ${session.memberId} and term_key = ${termKey}
  `;

  return NextResponse.json({ ok: true });
}
