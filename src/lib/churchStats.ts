import { sql } from "@/lib/db";

export interface Count {
  label: string;
  value: number;
}

export interface MonthPoint {
  key: string;
  label: string;
  value: number;
}

export interface ChurchStats {
  months: number;
  members: {
    total: number;
    withBirthdate: number;
    avgAge: number | null;
    ageBuckets: Count[];
    sex: Count[];
    marital: Count[];
    baptismsByYear: Count[];
    birthdaysWeek: number;
    newByMonth: MonthPoint[];
    pending: number;
    pendingOld: number;
  };
  children: {
    total: number;
    families: number;
    avgPerFamily: number | null;
    ageBuckets: Count[];
    sex: Count[];
  };
  groups: Count[];
  ministries: Count[];
  ebdClasses: Count[];
  deacons: { ativo: number; afastado: number; emerito: number; solicitado: number; board: number };
  finance: null | {
    income: number;
    expense: number;
    incomeByMonth: MonthPoint[];
    expenseByMonth: MonthPoint[];
    byCategory: Count[];
  };
  pendingReceipts: number;
  pendingGroupRequests: number;
  visitors: { total: number; firstVisit: number; byMonth: MonthPoint[] };
  events: { title: string; registered: number; checkedIn: number }[];
  /** Seções cujas consultas falharam — mostradas no painel, nunca preenchidas com zero fingindo dado. */
  unavailable: string[];
}

const MONTH_LABELS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function recifeToday(): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "America/Recife" }));
}

function monthKeys(count: number): { key: string; label: string }[] {
  const today = recifeToday();
  const result: { key: string; label: string }[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    result.push({ key, label: `${MONTH_LABELS[d.getMonth()]}/${String(d.getFullYear()).slice(2)}` });
  }
  return result;
}

function fillSeries(keys: { key: string; label: string }[], values: Map<string, number>): MonthPoint[] {
  return keys.map((k) => ({ key: k.key, label: k.label, value: values.get(k.key) ?? 0 }));
}

function parseBR(value: unknown): { day: number; month: number; year: number } | null {
  if (typeof value !== "string") return null;
  const m = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900) return null;
  return { day, month, year };
}

function ageOf(value: unknown, today: Date): number | null {
  const p = parseBR(value);
  if (!p) return null;
  let age = today.getFullYear() - p.year;
  if (today.getMonth() + 1 < p.month || (today.getMonth() + 1 === p.month && today.getDate() < p.day)) {
    age -= 1;
  }
  return age >= 0 && age < 120 ? age : null;
}

function bucketize(ages: number[], buckets: { label: string; min: number; max: number }[]): Count[] {
  return buckets.map((b) => ({
    label: b.label,
    value: ages.filter((a) => a >= b.min && a <= b.max).length,
  }));
}

function countBy(values: unknown[], emptyLabel: string): Count[] {
  const map = new Map<string, number>();
  for (const v of values) {
    const label = typeof v === "string" && v.trim() ? v.trim() : emptyLabel;
    map.set(label, (map.get(label) ?? 0) + 1);
  }
  return Array.from(map, ([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
}

export async function getChurchStats(months: number, includeFinance: boolean): Promise<ChurchStats> {
  const unavailable: string[] = [];
  const today = recifeToday();
  const keys = monthKeys(months);
  const startMonth = `${keys[0].key}-01`;

  async function safe<T>(section: string, fn: () => Promise<T>, fallback: T): Promise<T> {
    try {
      return await fn();
    } catch {
      unavailable.push(section);
      return fallback;
    }
  }

  const [
    memberRows,
    pendingRow,
    newRows,
    childRows,
    groupRows,
    ministryRows,
    ebdRows,
    deaconRows,
    boardRow,
    financeRows,
    categoryRows,
    receiptsRow,
    groupReqRow,
    visitorRows,
    eventRows,
  ] = await Promise.all([
    safe(
      "Membros",
      () =>
        sql`select birthdate, sex, marital_status, baptism_date from members where is_validated_member = true`,
      [] as any[] // eslint-disable-line @typescript-eslint/no-explicit-any
    ),
    safe(
      "Cadastros pendentes",
      () =>
        sql`select count(*)::int as total,
                   count(*) filter (where requested_at < now() - interval '7 days')::int as old
            from membership_requests where status = 'pendente'`,
      [{ total: 0, old: 0 }] as any[] // eslint-disable-line @typescript-eslint/no-explicit-any
    ),
    safe(
      "Novos membros",
      () =>
        sql`select to_char(decided_at, 'YYYY-MM') as month, count(*)::int as count
            from membership_requests
            where status = 'aprovado' and decided_at >= ${startMonth}::date
            group by 1`,
      [] as any[] // eslint-disable-line @typescript-eslint/no-explicit-any
    ),
    safe(
      "Crianças",
      () => sql`select birthdate, sex, member_id from member_children`,
      [] as any[] // eslint-disable-line @typescript-eslint/no-explicit-any
    ),
    safe(
      "Grupos",
      () =>
        sql`select g.name, count(m.id)::int as count
            from member_groups g
            left join member_group_members m on m.group_id = g.id
            group by g.id, g.name
            order by count desc, g.name asc`,
      [] as any[] // eslint-disable-line @typescript-eslint/no-explicit-any
    ),
    safe(
      "Ministérios",
      () =>
        sql`select m as name, count(*)::int as count
            from volunteer_registrations, unnest(ministries) as m
            group by m
            order by count desc, m asc`,
      [] as any[] // eslint-disable-line @typescript-eslint/no-explicit-any
    ),
    safe(
      "Salas da EBD",
      () =>
        sql`select c.name, count(e.id)::int as count
            from ebd_classes c
            left join ebd_enrollments e on e.class_id = c.id
            group by c.id, c.name
            order by count desc, c.name asc`,
      [] as any[] // eslint-disable-line @typescript-eslint/no-explicit-any
    ),
    safe(
      "Diáconos",
      () => sql`select status, count(*)::int as count from deacon_profiles group by status`,
      [] as any[] // eslint-disable-line @typescript-eslint/no-explicit-any
    ),
    safe(
      "Diretoria diaconal",
      () =>
        sql`select count(*)::int as count from deacon_profiles where is_board = true and status = 'ativo'`,
      [{ count: 0 }] as any[] // eslint-disable-line @typescript-eslint/no-explicit-any
    ),
    includeFinance
      ? safe(
          "Financeiro",
          () =>
            sql`select substring(entry_date from 1 for 7) as month, type, sum(amount)::float8 as total
                from financial_entries
                where entry_date >= ${startMonth}
                group by 1, 2`,
          [] as any[] // eslint-disable-line @typescript-eslint/no-explicit-any
        )
      : Promise.resolve([] as any[]), // eslint-disable-line @typescript-eslint/no-explicit-any
    includeFinance
      ? safe(
          "Financeiro por categoria",
          () =>
            sql`select category, sum(amount)::float8 as total
                from financial_entries
                where type = 'entrada' and entry_date >= ${startMonth}
                group by category
                order by total desc`,
          [] as any[] // eslint-disable-line @typescript-eslint/no-explicit-any
        )
      : Promise.resolve([] as any[]), // eslint-disable-line @typescript-eslint/no-explicit-any
    safe(
      "Comprovantes pendentes",
      () =>
        sql`select
              (select count(*)::int from contribution_receipts where status = 'pendente') +
              (select count(*)::int from congregation_financial_submissions where status = 'pendente')
              as count`,
      [{ count: 0 }] as any[] // eslint-disable-line @typescript-eslint/no-explicit-any
    ),
    safe(
      "Pedidos de grupo",
      () => sql`select count(*)::int as count from group_join_requests where status = 'pendente'`,
      [{ count: 0 }] as any[] // eslint-disable-line @typescript-eslint/no-explicit-any
    ),
    safe(
      "Visitantes",
      () =>
        sql`select to_char(created_at, 'YYYY-MM') as month, count(*)::int as count,
                   count(*) filter (where first_visit)::int as first
            from visitor_registrations
            where created_at >= ${startMonth}::date
            group by 1`,
      [] as any[] // eslint-disable-line @typescript-eslint/no-explicit-any
    ),
    safe(
      "Eventos",
      () =>
        sql`select e.title,
                   (count(a.id) + (select count(*) from registrations r where r.event_slug = e.slug))::int as registered,
                   count(a.checked_in_at)::int as checked_in
            from events e
            left join event_attendees a on a.event_slug = e.slug
            group by e.id, e.title, e.slug, e.created_at
            order by e.created_at desc
            limit 6`,
      [] as any[] // eslint-disable-line @typescript-eslint/no-explicit-any
    ),
  ]);

  // Membros validados
  const adultAges = memberRows.map((r) => ageOf(r.birthdate, today)).filter((a): a is number => a !== null);
  const avgAge = adultAges.length
    ? Math.round((adultAges.reduce((s, a) => s + a, 0) / adultAges.length) * 10) / 10
    : null;

  const sexCounts = countBy(
    memberRows.map((r) => (r.sex === "Feminino" || r.sex === "Masculino" ? r.sex : null)),
    "Não informado"
  );

  const baptismYears = new Map<string, number>();
  for (const r of memberRows) {
    const p = parseBR(r.baptism_date);
    if (p) baptismYears.set(String(p.year), (baptismYears.get(String(p.year)) ?? 0) + 1);
  }
  const baptismsByYear = Array.from(baptismYears, ([label, value]) => ({ label, value }))
    .sort((a, b) => Number(b.label) - Number(a.label))
    .slice(0, 8)
    .reverse();

  let birthdaysWeek = 0;
  for (const r of memberRows) {
    const p = parseBR(r.birthdate);
    if (!p) continue;
    for (let i = 0; i < 7; i++) {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
      if (d.getDate() === p.day && d.getMonth() + 1 === p.month) {
        birthdaysWeek += 1;
        break;
      }
    }
  }

  // Crianças
  const childAges = childRows.map((r) => ageOf(r.birthdate, today)).filter((a): a is number => a !== null);
  const families = new Set(childRows.map((r) => r.member_id)).size;

  // Séries mensais
  const newMap = new Map<string, number>(newRows.map((r) => [r.month as string, Number(r.count)]));
  const visitorMap = new Map<string, number>(visitorRows.map((r) => [r.month as string, Number(r.count)]));

  let finance: ChurchStats["finance"] = null;
  if (includeFinance) {
    const incomeMap = new Map<string, number>();
    const expenseMap = new Map<string, number>();
    for (const r of financeRows) {
      const target = r.type === "entrada" ? incomeMap : expenseMap;
      target.set(r.month as string, Number(r.total));
    }
    const incomeByMonth = fillSeries(keys, incomeMap);
    const expenseByMonth = fillSeries(keys, expenseMap);
    finance = {
      income: incomeByMonth.reduce((s, p) => s + p.value, 0),
      expense: expenseByMonth.reduce((s, p) => s + p.value, 0),
      incomeByMonth,
      expenseByMonth,
      byCategory: categoryRows.map((r) => ({ label: String(r.category), value: Number(r.total) })),
    };
  }

  const deaconByStatus = new Map<string, number>(deaconRows.map((r) => [r.status as string, Number(r.count)]));

  return {
    months,
    members: {
      total: memberRows.length,
      withBirthdate: adultAges.length,
      avgAge,
      ageBuckets: bucketize(adultAges, [
        { label: "Até 17", min: 0, max: 17 },
        { label: "18–29", min: 18, max: 29 },
        { label: "30–44", min: 30, max: 44 },
        { label: "45–59", min: 45, max: 59 },
        { label: "60+", min: 60, max: 200 },
      ]),
      sex: sexCounts,
      marital: countBy(
        memberRows.map((r) => r.marital_status),
        "Não informado"
      ),
      baptismsByYear,
      birthdaysWeek,
      newByMonth: fillSeries(keys, newMap),
      pending: Number(pendingRow[0]?.total ?? 0),
      pendingOld: Number(pendingRow[0]?.old ?? 0),
    },
    children: {
      total: childRows.length,
      families,
      avgPerFamily: families ? Math.round((childRows.length / families) * 10) / 10 : null,
      ageBuckets: bucketize(childAges, [
        { label: "0–2", min: 0, max: 2 },
        { label: "3–5", min: 3, max: 5 },
        { label: "6–9", min: 6, max: 9 },
        { label: "10–12", min: 10, max: 12 },
        { label: "13+", min: 13, max: 200 },
      ]),
      sex: countBy(
        childRows.map((r) => (r.sex === "Feminino" || r.sex === "Masculino" ? r.sex : null)),
        "Não informado"
      ),
    },
    groups: groupRows.map((r) => ({ label: String(r.name), value: Number(r.count) })),
    ministries: ministryRows.map((r) => ({ label: String(r.name), value: Number(r.count) })),
    ebdClasses: ebdRows.map((r) => ({ label: String(r.name), value: Number(r.count) })),
    deacons: {
      ativo: deaconByStatus.get("ativo") ?? 0,
      afastado: deaconByStatus.get("afastado") ?? 0,
      emerito: deaconByStatus.get("emerito") ?? 0,
      solicitado: deaconByStatus.get("solicitado") ?? 0,
      board: Number(boardRow[0]?.count ?? 0),
    },
    finance,
    pendingReceipts: Number(receiptsRow[0]?.count ?? 0),
    pendingGroupRequests: Number(groupReqRow[0]?.count ?? 0),
    visitors: {
      total: visitorRows.reduce((s, r) => s + Number(r.count), 0),
      firstVisit: visitorRows.reduce((s, r) => s + Number(r.first), 0),
      byMonth: fillSeries(keys, visitorMap),
    },
    events: eventRows.map((r) => ({
      title: String(r.title),
      registered: Number(r.registered),
      checkedIn: Number(r.checked_in),
    })),
    unavailable,
  };
}
