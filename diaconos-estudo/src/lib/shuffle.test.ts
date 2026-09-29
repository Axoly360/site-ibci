import { describe, expect, it } from "vitest";
import { embaralhar, amostrarSemReposicao } from "./shuffle";

describe("embaralhar", () => {
  it("mantém os mesmos elementos, só muda a ordem", () => {
    const original = [1, 2, 3, 4, 5];
    const resultado = embaralhar(original, () => 0.999);
    expect(resultado.slice().sort()).toEqual(original.slice().sort());
  });

  it("não muta o array original", () => {
    const original = [1, 2, 3];
    embaralhar(original, () => 0.5);
    expect(original).toEqual([1, 2, 3]);
  });

  it("com aleatorio determinístico, produz sempre o mesmo resultado", () => {
    const a = embaralhar([1, 2, 3, 4], () => 0.1);
    const b = embaralhar([1, 2, 3, 4], () => 0.1);
    expect(a).toEqual(b);
  });
});

describe("amostrarSemReposicao", () => {
  it("nunca repete itens na amostra", () => {
    const amostra = amostrarSemReposicao([1, 2, 3, 4, 5], 3, () => 0.42);
    expect(new Set(amostra).size).toBe(amostra.length);
    expect(amostra.length).toBe(3);
  });

  it("não retorna mais itens do que existem", () => {
    const amostra = amostrarSemReposicao([1, 2], 10, () => 0.1);
    expect(amostra.length).toBe(2);
  });
});
