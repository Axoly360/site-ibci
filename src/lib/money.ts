/** Teto de sanidade para um comprovante/lançamento (a coluna aceita bem mais, mas evita erro de digitação). */
export const MAX_AMOUNT = 10_000_000;

/**
 * Lê um valor digitado no formato brasileiro: "150", "150,5", "1.500,00",
 * "R$ 1.500", "1500.50". Retorna NaN se não for um número válido.
 */
export function parseBrAmount(input: string): number {
  const s = input.replace(/R\$|\s/g, "");
  if (!s) return NaN;

  let normalized = s;
  if (s.includes(",")) {
    normalized = s.replace(/\./g, "").replace(",", ".");
  } else if (/^\d{1,3}(\.\d{3})+$/.test(s)) {
    normalized = s.replace(/\./g, "");
  }

  return /^\d+(\.\d+)?$/.test(normalized) ? Number(normalized) : NaN;
}
