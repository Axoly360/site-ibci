/** Fisher-Yates. Não muta o array de entrada. */
export function embaralhar<T>(itens: T[], aleatorio: () => number = Math.random): T[] {
  const copia = [...itens];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

export function amostrarSemReposicao<T>(itens: T[], quantidade: number, aleatorio: () => number = Math.random): T[] {
  return embaralhar(itens, aleatorio).slice(0, Math.min(quantidade, itens.length));
}
