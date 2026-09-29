import type { PerguntaOral } from "../data/schema";
import { embaralhar } from "./shuffle";

const PESO_POR_FREQUENCIA: Record<PerguntaOral["frequenciaBanca"], number> = {
  alta: 5,
  media: 2,
  baixa: 1,
};

function sortearPonderado<T>(itens: T[], peso: (item: T) => number, aleatorio: () => number): T {
  const pesos = itens.map(peso);
  const total = pesos.reduce((soma, p) => soma + p, 0);
  let alvo = aleatorio() * total;
  for (let i = 0; i < itens.length; i++) {
    alvo -= pesos[i];
    if (alvo <= 0) return itens[i];
  }
  return itens[itens.length - 1];
}

/**
 * Sorteia `quantidade` perguntas orais, com peso maior para frequenciaBanca "alta",
 * garantindo pelo menos 1 pergunta de cada grupo essencial presente no banco.
 */
export function sortearSimulado(
  banco: PerguntaOral[],
  quantidade: number,
  aleatorio: () => number = Math.random,
): PerguntaOral[] {
  if (banco.length === 0) return [];

  const selecionadas: PerguntaOral[] = [];
  const idsSelecionados = new Set<string>();

  const gruposEssenciais = Array.from(
    new Set(banco.filter((p) => p.essencial && p.grupoEssencial).map((p) => p.grupoEssencial as string)),
  );

  for (const grupo of gruposEssenciais) {
    if (selecionadas.length >= quantidade) break;
    const candidatas = banco.filter((p) => p.grupoEssencial === grupo && !idsSelecionados.has(p.id));
    if (candidatas.length === 0) continue;
    const escolhida = sortearPonderado(candidatas, (p) => PESO_POR_FREQUENCIA[p.frequenciaBanca], aleatorio);
    selecionadas.push(escolhida);
    idsSelecionados.add(escolhida.id);
  }

  const restantes = banco.filter((p) => !idsSelecionados.has(p.id));
  const restantesEmbaralhadas = embaralhar(restantes, aleatorio);

  while (selecionadas.length < quantidade && restantesEmbaralhadas.length > 0) {
    const candidatas = restantesEmbaralhadas.filter((p) => !idsSelecionados.has(p.id));
    if (candidatas.length === 0) break;
    const escolhida = sortearPonderado(candidatas, (p) => PESO_POR_FREQUENCIA[p.frequenciaBanca], aleatorio);
    selecionadas.push(escolhida);
    idsSelecionados.add(escolhida.id);
  }

  return embaralhar(selecionadas, aleatorio).slice(0, quantidade);
}
