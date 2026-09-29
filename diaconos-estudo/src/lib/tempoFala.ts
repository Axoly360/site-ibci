const PALAVRAS_POR_MINUTO = 130;

export function contarPalavras(texto: string): number {
  const limpo = texto.trim();
  if (limpo.length === 0) return 0;
  return limpo.split(/\s+/).length;
}

/** Retorna a duração estimada de fala, em segundos, a ~130 palavras por minuto. */
export function estimarSegundosDeFala(texto: string): number {
  const palavras = contarPalavras(texto);
  return Math.round((palavras / PALAVRAS_POR_MINUTO) * 60);
}

export function formatarDuracao(segundos: number): string {
  const min = Math.floor(segundos / 60);
  const seg = segundos % 60;
  if (min === 0) return `${seg}s`;
  return `${min}min ${seg}s`;
}
