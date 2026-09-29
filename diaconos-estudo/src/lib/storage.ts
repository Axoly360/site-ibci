const PREFIXO = "diaconos-estudo:";

export function lerStorage<T>(chave: string, valorPadrao: T): T {
  try {
    const bruto = window.localStorage.getItem(PREFIXO + chave);
    if (bruto === null) return valorPadrao;
    return JSON.parse(bruto) as T;
  } catch {
    return valorPadrao;
  }
}

export function salvarStorage<T>(chave: string, valor: T): boolean {
  try {
    window.localStorage.setItem(PREFIXO + chave, JSON.stringify(valor));
    return true;
  } catch {
    return false;
  }
}

export function removerStorage(chave: string): void {
  try {
    window.localStorage.removeItem(PREFIXO + chave);
  } catch {
    // ambiente sem storage: seguir em frente sem persistir
  }
}

export function listarChavesStorage(): string[] {
  try {
    const chaves: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const chave = window.localStorage.key(i);
      if (chave?.startsWith(PREFIXO)) chaves.push(chave.slice(PREFIXO.length));
    }
    return chaves;
  } catch {
    return [];
  }
}

export function limparTudoStorage(): void {
  for (const chave of listarChavesStorage()) removerStorage(chave);
}
