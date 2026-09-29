import { describe, expect, it } from "vitest";
import conteudoReal from "./conteudo.json";
import { ConteudoSchema, validarRegrasDeNegocio } from "./schema";

describe("schema do conteúdo real (conteudo.json)", () => {
  it("valida com sucesso pelo Zod", () => {
    const resultado = ConteudoSchema.safeParse(conteudoReal);
    expect(resultado.success).toBe(true);
  });

  it("não tem erros de regra de negócio", () => {
    const dados = ConteudoSchema.parse(conteudoReal);
    const issues = validarRegrasDeNegocio(dados);
    expect(issues).toEqual([]);
  });
});

describe("validarRegrasDeNegocio", () => {
  const base = ConteudoSchema.parse({
    meta: { curso: "x", versao: "1.0", atualizadoEm: "" },
    temas: [{ id: "t1", titulo: "Tema 1" }],
    perguntasOrais: [],
    listas: [],
    versiculos: [],
    quiz: [],
  });

  it("acusa ID duplicado entre perguntas orais", () => {
    const comDuplicata = ConteudoSchema.parse({
      ...base,
      perguntasOrais: [
        {
          id: "dup",
          temaId: "t1",
          pergunta: "p1",
          respostaModelo: "r1",
          pontosChave: ["a", "b"],
          fonte: { tipo: "apostila" },
        },
        {
          id: "dup",
          temaId: "t1",
          pergunta: "p2",
          respostaModelo: "r2",
          pontosChave: ["a", "b"],
          fonte: { tipo: "apostila" },
        },
      ],
    });
    const issues = validarRegrasDeNegocio(comDuplicata);
    expect(issues.some((i) => i.mensagem.includes("ID duplicado"))).toBe(true);
  });

  it("acusa quiz com 'correta' inexistente entre as alternativas", () => {
    const comErro = ConteudoSchema.parse({
      ...base,
      quiz: [
        {
          id: "q1",
          temaId: "t1",
          enunciado: "?",
          alternativas: [
            { id: "a", texto: "A" },
            { id: "b", texto: "B" },
            { id: "c", texto: "C" },
            { id: "d", texto: "D" },
          ],
          correta: "z",
          explicacao: "...",
          fonte: { tipo: "apostila" },
        },
      ],
    });
    const issues = validarRegrasDeNegocio(comErro);
    expect(issues.some((i) => i.mensagem.includes("não existe nas alternativas"))).toBe(true);
  });

  it("acusa pergunta referenciando tema inexistente", () => {
    const comErro = ConteudoSchema.parse({
      ...base,
      perguntasOrais: [
        {
          id: "p1",
          temaId: "tema-inexistente",
          pergunta: "p",
          respostaModelo: "r",
          pontosChave: ["a", "b"],
          fonte: { tipo: "apostila" },
        },
      ],
    });
    const issues = validarRegrasDeNegocio(comErro);
    expect(issues.some((i) => i.mensagem.includes("tema inexistente"))).toBe(true);
  });

  it("acusa item complemento sem verificar:true", () => {
    const comErro = ConteudoSchema.parse({
      ...base,
      perguntasOrais: [
        {
          id: "p1",
          temaId: "t1",
          pergunta: "p",
          respostaModelo: "r",
          pontosChave: ["a", "b"],
          fonte: { tipo: "complemento" },
          verificar: false,
        },
      ],
    });
    const issues = validarRegrasDeNegocio(comErro);
    expect(issues.some((i) => i.mensagem.includes("complemento"))).toBe(true);
  });
});
