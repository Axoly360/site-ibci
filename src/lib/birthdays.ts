/** Início da semana (domingo) da data informada, em UTC. */
export function startOfWeekSunday(date: Date): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  d.setUTCDate(d.getUTCDate() - d.getUTCDay());
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

/** Todas as datas entre start e end (inclusive), em ordem — usado para
 * varrer um período curto (semana, mês) dia a dia. */
export function datesInRange(start: Date, end: Date): Date[] {
  const dates: Date[] = [];
  let current = new Date(start);
  while (current.getTime() <= end.getTime()) {
    dates.push(new Date(current));
    current = addDays(current, 1);
  }
  return dates;
}

/**
 * Um aniversário se repete todo ano no mesmo mês/dia, independente do ano
 * de nascimento. Esta função compara só mês/dia contra cada data do
 * período (que já tem o ano certo) e devolve a ocorrência exata dentro do
 * período, ou null se o aniversário não cair nele.
 */
export function findBirthdayOccurrence(birthdate: Date, rangeDates: Date[]): Date | null {
  const month = birthdate.getUTCMonth();
  const day = birthdate.getUTCDate();
  return rangeDates.find((d) => d.getUTCMonth() === month && d.getUTCDate() === day) ?? null;
}
