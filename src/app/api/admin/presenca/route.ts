import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminSession, hasPermission } from "@/lib/admin-session";

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function wholeNumber(value: unknown): number | null {
  if (value === "" || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isInteger(n) ? n : NaN;
}

/** Lança (ou atualiza) a presença de um culto numa data. */
export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session || !hasPermission(session, "membros")) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const date = text(body?.date);
  const label = text(body?.label);
  const total = wholeNumber(body?.total);
  const visitors = wholeNumber(body?.visitors);
  const notes = text(body?.notes);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !label || label.length > 80) {
    return NextResponse.json({ error: "Informe a data e o culto." }, { status: 400 });
  }
  if (total === null || Number.isNaN(total) || total < 0 || total > 100000) {
    return NextResponse.json({ error: "Informe o total de presentes (número inteiro)." }, { status: 400 });
  }
  if (visitors !== null && (Number.isNaN(visitors) || visitors < 0 || visitors > total)) {
    return NextResponse.json(
      { error: "Os visitantes devem ser um número entre 0 e o total de presentes." },
      { status: 400 }
    );
  }

  const [future] = await sql`select (${date}::date > current_date) as is_future`;
  if (future?.is_future) {
    return NextResponse.json({ error: "Não é possível lançar presença de data futura." }, { status: 400 });
  }

  await sql`
    insert into service_attendance (service_date, service_label, total, visitors, notes, recorded_by)
    values (${date}::date, ${label}, ${total}, ${visitors}, ${notes || null}, ${session.id})
    on conflict (service_date, service_label)
    do update set total = excluded.total, visitors = excluded.visitors,
                  notes = excluded.notes, recorded_by = excluded.recorded_by
  `;
  return NextResponse.json({ ok: true });
}
