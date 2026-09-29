/** Calcula o percentual de acerto a partir dos pontos-chave marcados pelo aluno. */
export function calcularAutoavaliacao(pontosChaveTotal: number, pontosMarcados: number): number {
  if (pontosChaveTotal <= 0) return 0;
  const percentual = (pontosMarcados / pontosChaveTotal) * 100;
  return Math.round(Math.min(100, Math.max(0, percentual)));
}
