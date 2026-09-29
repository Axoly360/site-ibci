export interface ProgressoEssencial {
  sessoesCorretas: number;
}

export type MapaProgressoEssenciais = Record<string, ProgressoEssencial>;

export const SESSOES_PARA_DOMINAR = 2;

export function estaDominado(progresso: ProgressoEssencial | undefined): boolean {
  return (progresso?.sessoesCorretas ?? 0) >= SESSOES_PARA_DOMINAR;
}

export function registrarSessao(
  mapa: MapaProgressoEssenciais,
  grupoId: string,
  todasCorretas: boolean,
): MapaProgressoEssenciais {
  const atual = mapa[grupoId] ?? { sessoesCorretas: 0 };
  if (!todasCorretas) {
    return mapa;
  }
  return {
    ...mapa,
    [grupoId]: { sessoesCorretas: Math.min(SESSOES_PARA_DOMINAR, atual.sessoesCorretas + 1) },
  };
}

export function contarDominados(mapa: MapaProgressoEssenciais, grupos: string[]): number {
  return grupos.filter((g) => estaDominado(mapa[g])).length;
}
