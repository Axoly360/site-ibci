import { describe, expect, it, beforeEach } from "vitest";
import { moverBloco, montarRoteiroCompleto, novoBloco, type BlocoApresentacao } from "./apresentacao";
import { lerStorage, salvarStorage, removerStorage } from "./storage";

describe("moverBloco", () => {
  it("move um item para cima", () => {
    const itens = ["a", "b", "c"];
    expect(moverBloco(itens, 1, -1)).toEqual(["b", "a", "c"]);
  });

  it("move um item para baixo", () => {
    const itens = ["a", "b", "c"];
    expect(moverBloco(itens, 1, 1)).toEqual(["a", "c", "b"]);
  });

  it("não faz nada ao tentar mover além dos limites", () => {
    const itens = ["a", "b"];
    expect(moverBloco(itens, 0, -1)).toEqual(["a", "b"]);
    expect(moverBloco(itens, 1, 1)).toEqual(["a", "b"]);
  });
});

describe("montarRoteiroCompleto", () => {
  it("junta apenas blocos com texto preenchido", () => {
    const blocos: BlocoApresentacao[] = [
      { id: "1", pergunta: "P1", dica: "", texto: "Resposta 1", precisaMelhorar: false },
      { id: "2", pergunta: "P2", dica: "", texto: "", precisaMelhorar: false },
      { id: "3", pergunta: "P3", dica: "", texto: "Resposta 3", precisaMelhorar: false },
    ];
    const roteiro = montarRoteiroCompleto(blocos);
    expect(roteiro).toContain("P1");
    expect(roteiro).toContain("Resposta 1");
    expect(roteiro).not.toContain("P2");
    expect(roteiro).toContain("P3");
  });
});

describe("novoBloco", () => {
  it("cria um bloco com id único e texto vazio", () => {
    const b1 = novoBloco("Pergunta A");
    const b2 = novoBloco("Pergunta B");
    expect(b1.id).not.toBe(b2.id);
    expect(b1.texto).toBe("");
    expect(b1.pergunta).toBe("Pergunta A");
  });
});

describe("persistência dos blocos via storage (com try/catch)", () => {
  beforeEach(() => {
    removerStorage("teste-blocos");
  });

  it("salva e lê de volta os blocos, preservando a ordem", () => {
    const blocos: BlocoApresentacao[] = [
      { id: "1", pergunta: "P1", dica: "", texto: "x", precisaMelhorar: false },
      { id: "2", pergunta: "P2", dica: "", texto: "y", precisaMelhorar: true },
    ];
    salvarStorage("teste-blocos", blocos);
    const lidos = lerStorage<BlocoApresentacao[]>("teste-blocos", []);
    expect(lidos).toEqual(blocos);
  });

  it("retorna o valor padrão quando a chave não existe", () => {
    const lidos = lerStorage<BlocoApresentacao[]>("chave-inexistente", []);
    expect(lidos).toEqual([]);
  });
});
