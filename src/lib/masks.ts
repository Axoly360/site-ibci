/** Formata progressivamente como CPF: 000.000.000-00 */
export function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

/** Formata progressivamente como data: dd/mm/aaaa */
export function formatDateBR(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits
    .replace(/(\d{2})(\d)/, "$1/$2")
    .replace(/(\d{2})(\d)/, "$1/$2");
}

/**
 * Converte "dd/mm/aaaa" em Date. Todo o projeto guarda birthdate,
 * baptism_date, arrival_date (de members e member_children) nesse formato
 * — não ISO, apesar do que outros comentários no schema possam sugerir —
 * então `new Date(valor)` sempre falha ("Invalid Date") nesses campos.
 * Use isto quando precisar de um Date de verdade (ex.: calcular idade);
 * para exibir, o valor já vem pronto no formato BR, então normalmente basta
 * mostrá-lo direto, sem reformatar.
 */
export function parseBRDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, day, month, year] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  return Number.isNaN(date.getTime()) ? null : date;
}
