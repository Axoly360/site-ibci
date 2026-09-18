import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminSession, hasPermission } from "@/lib/admin-session";

function csvEscape(value: string) {
  if (/[";\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!hasPermission(session, "financeiro")) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const congregacao = searchParams.get("congregacao") || "";
  const tipoParam = searchParams.get("tipo");
  const tipo = tipoParam === "entrada" || tipoParam === "saida" ? tipoParam : "";
  const membro = searchParams.get("membro")?.trim() || null;

  if (!from || !to) {
    return NextResponse.json({ error: "Informe o período (from/to)." }, { status: 400 });
  }

  const entries =
    congregacao === "sede"
      ? await sql`
          select financial_entries.entry_date, financial_entries.type, financial_entries.category,
                 financial_entries.amount, financial_entries.description, members.name as member_name
          from financial_entries
          left join members on members.id = financial_entries.member_id
          where financial_entries.entry_date >= ${from} and financial_entries.entry_date <= ${to}
            and financial_entries.congregation_id is null
            and (${tipo}::text = '' or financial_entries.type = ${tipo})
            and (${membro}::text is null or members.name ilike '%' || ${membro} || '%' or financial_entries.requested_by ilike '%' || ${membro} || '%')
          order by financial_entries.entry_date asc
        `
      : congregacao
        ? await sql`
            select financial_entries.entry_date, financial_entries.type, financial_entries.category,
                   financial_entries.amount, financial_entries.description, members.name as member_name
            from financial_entries
            left join members on members.id = financial_entries.member_id
            join congregations on congregations.id = financial_entries.congregation_id
            where financial_entries.entry_date >= ${from} and financial_entries.entry_date <= ${to}
              and congregations.slug = ${congregacao}
              and (${tipo}::text = '' or financial_entries.type = ${tipo})
              and (${membro}::text is null or members.name ilike '%' || ${membro} || '%' or financial_entries.requested_by ilike '%' || ${membro} || '%')
            order by financial_entries.entry_date asc
          `
        : await sql`
            select financial_entries.entry_date, financial_entries.type, financial_entries.category,
                   financial_entries.amount, financial_entries.description, members.name as member_name
            from financial_entries
            left join members on members.id = financial_entries.member_id
            where financial_entries.entry_date >= ${from} and financial_entries.entry_date <= ${to}
              and (${tipo}::text = '' or financial_entries.type = ${tipo})
              and (${membro}::text is null or members.name ilike '%' || ${membro} || '%' or financial_entries.requested_by ilike '%' || ${membro} || '%')
            order by financial_entries.entry_date asc
          `;

  const header = ["Data", "Tipo", "Categoria", "Valor", "Membro", "Descrição"];
  const rows = entries.map((entry) => [
    entry.entry_date,
    entry.type === "entrada" ? "Entrada" : "Saída",
    entry.category,
    Number(entry.amount).toFixed(2).replace(".", ","),
    entry.member_name || "",
    entry.description || "",
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map((cell) => csvEscape(String(cell))).join(";"))
    .join("\n");
  const bom = String.fromCharCode(0xfeff);

  return new NextResponse(bom + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="financeiro-${from}-a-${to}.csv"`,
    },
  });
}
