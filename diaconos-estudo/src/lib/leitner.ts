/** Sistema de caixas de Leitner simplificado: 1 (mais frequente) a 5 (menos frequente). */
export const CAIXA_MINIMA = 1;
export const CAIXA_MAXIMA = 5;

export interface EstadoLeitner {
  caixa: number;
  ultimaRevisao: string | null;
  acertosSeguidos: number;
}

export function estadoInicial(): EstadoLeitner {
  return { caixa: CAIXA_MINIMA, ultimaRevisao: null, acertosSeguidos: 0 };
}

/** score de 0 a 100: >=70 é considerado acerto, avança de caixa; abaixo disso, volta para a caixa 1. */
export function aplicarResultado(estado: EstadoLeitner, scorePercentual: number, agora = new Date()): EstadoLeitner {
  const acertou = scorePercentual >= 70;
  if (acertou) {
    return {
      caixa: Math.min(CAIXA_MAXIMA, estado.caixa + 1),
      ultimaRevisao: agora.toISOString(),
      acertosSeguidos: estado.acertosSeguidos + 1,
    };
  }
  return {
    caixa: CAIXA_MINIMA,
    ultimaRevisao: agora.toISOString(),
    acertosSeguidos: 0,
  };
}

/** Quanto menor a caixa, maior o peso (deve ser revisado com mais frequência). */
export function pesoRevisao(estado: EstadoLeitner): number {
  return CAIXA_MAXIMA - estado.caixa + 1;
}
