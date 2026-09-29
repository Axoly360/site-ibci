import { describe, expect, it } from "vitest";
import { embaralhar } from "./shuffle";

interface Alternativa {
  id: string;
  texto: string;
}

describe("embaralhamento de alternativas mantém o gabarito", () => {
  it("o id correto continua apontando para o mesmo texto após embaralhar", () => {
    const alternativas: Alternativa[] = [
      { id: "a", texto: "Boa reputação, cheio do Espírito Santo, cheio de sabedoria" },
      { id: "b", texto: "Honesto, sóbrio, hospitaleiro" },
      { id: "c", texto: "Fiel, prudente, generoso" },
      { id: "d", texto: "Humilde, paciente, alegre" },
    ];
    const correta = "a";
    const textoCorretoOriginal = alternativas.find((a) => a.id === correta)!.texto;

    for (let tentativa = 0; tentativa < 20; tentativa++) {
      const embaralhadas = embaralhar(alternativas, () => Math.random());
      const encontrada = embaralhadas.find((a) => a.id === correta)!;
      expect(encontrada.texto).toBe(textoCorretoOriginal);
      expect(embaralhadas).toHaveLength(alternativas.length);
    }
  });
});
