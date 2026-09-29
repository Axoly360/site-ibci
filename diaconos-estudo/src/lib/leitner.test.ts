import { describe, expect, it } from "vitest";
import { aplicarResultado, estadoInicial, pesoRevisao, CAIXA_MAXIMA, CAIXA_MINIMA } from "./leitner";

describe("leitner", () => {
  it("começa na caixa mínima", () => {
    expect(estadoInicial().caixa).toBe(CAIXA_MINIMA);
  });

  it("avança de caixa quando o score é bom (>=70)", () => {
    const estado = estadoInicial();
    const novo = aplicarResultado(estado, 80);
    expect(novo.caixa).toBe(CAIXA_MINIMA + 1);
    expect(novo.acertosSeguidos).toBe(1);
  });

  it("volta para a caixa mínima quando o score é ruim (<70)", () => {
    const estado = { caixa: 4, ultimaRevisao: null, acertosSeguidos: 3 };
    const novo = aplicarResultado(estado, 30);
    expect(novo.caixa).toBe(CAIXA_MINIMA);
    expect(novo.acertosSeguidos).toBe(0);
  });

  it("não ultrapassa a caixa máxima", () => {
    const estado = { caixa: CAIXA_MAXIMA, ultimaRevisao: null, acertosSeguidos: 10 };
    const novo = aplicarResultado(estado, 100);
    expect(novo.caixa).toBe(CAIXA_MAXIMA);
  });

  it("dá mais peso de revisão para caixas menores", () => {
    const caixaBaixa = { caixa: 1, ultimaRevisao: null, acertosSeguidos: 0 };
    const caixaAlta = { caixa: 5, ultimaRevisao: null, acertosSeguidos: 0 };
    expect(pesoRevisao(caixaBaixa)).toBeGreaterThan(pesoRevisao(caixaAlta));
  });
});
