import { describe, expect, it } from "vitest";
import { sortearSimulado } from "./simulado";
import type { PerguntaOral } from "../data/schema";

function criarPergunta(overrides: Partial<PerguntaOral> & Pick<PerguntaOral, "id">): PerguntaOral {
  return {
    temaId: "t01",
    pergunta: "pergunta",
    respostaModelo: "resposta",
    pontosChave: ["a", "b"],
    versiculos: [],
    fonte: { tipo: "apostila" },
    verificar: false,
    frequenciaBanca: "media",
    essencial: false,
    ...overrides,
  };
}

describe("sortearSimulado", () => {
  it("nunca sorteia mais perguntas do que o banco tem", () => {
    const banco = [criarPergunta({ id: "1" }), criarPergunta({ id: "2" })];
    const resultado = sortearSimulado(banco, 12);
    expect(resultado.length).toBe(2);
  });

  it("garante pelo menos uma pergunta de cada grupo essencial presente", () => {
    const banco = [
      criarPergunta({ id: "e1a", essencial: true, grupoEssencial: "e1" }),
      criarPergunta({ id: "e1b", essencial: true, grupoEssencial: "e1" }),
      criarPergunta({ id: "e2a", essencial: true, grupoEssencial: "e2" }),
      ...Array.from({ length: 10 }, (_, i) => criarPergunta({ id: `n${i}` })),
    ];
    const resultado = sortearSimulado(banco, 4, () => 0.99);
    const grupos = new Set(resultado.filter((p) => p.grupoEssencial).map((p) => p.grupoEssencial));
    expect(grupos.has("e1")).toBe(true);
    expect(grupos.has("e2")).toBe(true);
  });

  it("não repete perguntas na mesma tentativa", () => {
    const banco = Array.from({ length: 20 }, (_, i) => criarPergunta({ id: `p${i}` }));
    const resultado = sortearSimulado(banco, 12);
    const ids = resultado.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("dá preferência a perguntas de frequência alta (estatisticamente)", () => {
    const banco = [
      ...Array.from({ length: 5 }, (_, i) => criarPergunta({ id: `alta${i}`, frequenciaBanca: "alta" })),
      ...Array.from({ length: 20 }, (_, i) => criarPergunta({ id: `baixa${i}`, frequenciaBanca: "baixa" })),
    ];
    let contagemAlta = 0;
    const repeticoes = 50;
    for (let i = 0; i < repeticoes; i++) {
      const resultado = sortearSimulado(banco, 5);
      contagemAlta += resultado.filter((p) => p.frequenciaBanca === "alta").length;
    }
    const mediaAltaPorTentativa = contagemAlta / repeticoes;
    // proporção de itens "alta" no banco é 5/25 = 20%; com peso maior, a média deve superar isso.
    expect(mediaAltaPorTentativa).toBeGreaterThan(1);
  });
});
