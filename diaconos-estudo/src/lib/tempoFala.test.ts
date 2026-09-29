import { describe, expect, it } from "vitest";
import { contarPalavras, estimarSegundosDeFala, formatarDuracao } from "./tempoFala";

describe("tempoFala", () => {
  it("conta palavras separadas por espaço", () => {
    expect(contarPalavras("boa reputação cheio de sabedoria")).toBe(5);
  });

  it("retorna zero palavras para texto vazio", () => {
    expect(contarPalavras("   ")).toBe(0);
  });

  it("estima segundos a partir de 130 palavras por minuto", () => {
    const texto = Array(130).fill("palavra").join(" ");
    expect(estimarSegundosDeFala(texto)).toBe(60);
  });

  it("estima zero segundos para texto vazio", () => {
    expect(estimarSegundosDeFala("")).toBe(0);
  });

  it("formata duração em minutos e segundos", () => {
    expect(formatarDuracao(65)).toBe("1min 5s");
    expect(formatarDuracao(45)).toBe("45s");
  });
});
