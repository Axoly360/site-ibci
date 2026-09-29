import { describe, expect, it } from "vitest";
import { calcularAutoavaliacao } from "./autoavaliacao";

describe("calcularAutoavaliacao", () => {
  it("retorna 100 quando todos os pontos são marcados", () => {
    expect(calcularAutoavaliacao(4, 4)).toBe(100);
  });

  it("retorna 0 quando nenhum ponto é marcado", () => {
    expect(calcularAutoavaliacao(4, 0)).toBe(0);
  });

  it("arredonda o percentual", () => {
    expect(calcularAutoavaliacao(3, 1)).toBe(33);
  });

  it("nunca ultrapassa 100 mesmo com entrada inconsistente", () => {
    expect(calcularAutoavaliacao(2, 5)).toBe(100);
  });

  it("retorna 0 quando não há pontos-chave", () => {
    expect(calcularAutoavaliacao(0, 0)).toBe(0);
  });
});
