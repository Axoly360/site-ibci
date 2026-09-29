import { z } from "zod";

export const FonteSchema = z.object({
  tipo: z.enum(["apostila", "banca-anterior", "video-concilio", "complemento"]),
  secao: z.string().optional(),
  pagina: z.number().optional(),
});
export type Fonte = z.infer<typeof FonteSchema>;

export const TemaSchema = z.object({
  id: z.string(),
  titulo: z.string(),
});
export type Tema = z.infer<typeof TemaSchema>;

export const PerguntaOralSchema = z.object({
  id: z.string(),
  temaId: z.string(),
  pergunta: z.string(),
  respostaModelo: z.string(),
  pontosChave: z.array(z.string()).min(2),
  versiculos: z.array(z.string()).default([]),
  fonte: FonteSchema,
  verificar: z.boolean().default(false),
  frequenciaBanca: z.enum(["alta", "media", "baixa"]).default("media"),
  essencial: z.boolean().default(false),
  grupoEssencial: z.string().optional(),
});
export type PerguntaOral = z.infer<typeof PerguntaOralSchema>;

export const ListaSchema = z.object({
  id: z.string(),
  titulo: z.string(),
  itens: z.array(z.string()).min(1),
  ordenada: z.boolean().default(false),
  essencial: z.boolean().default(false),
  grupoEssencial: z.string().optional(),
  fonte: FonteSchema,
  verificar: z.boolean().default(false),
});
export type Lista = z.infer<typeof ListaSchema>;

export const VersiculoSchema = z.object({
  id: z.string(),
  referencia: z.string(),
  tema: z.string(),
  textoCurto: z.string().optional(),
  fonte: FonteSchema,
  verificar: z.boolean().default(false),
});
export type Versiculo = z.infer<typeof VersiculoSchema>;

export const AlternativaSchema = z.object({
  id: z.string(),
  texto: z.string(),
});

export const QuizItemSchema = z.object({
  id: z.string(),
  temaId: z.string(),
  enunciado: z.string(),
  alternativas: z.array(AlternativaSchema).length(4),
  correta: z.string(),
  explicacao: z.string(),
  fonte: FonteSchema,
  origem: z.enum(["gerada"]).default("gerada"),
  essencial: z.boolean().default(false),
  grupoEssencial: z.string().optional(),
  verificar: z.boolean().default(false),
});
export type QuizItem = z.infer<typeof QuizItemSchema>;

export const ConteudoSchema = z.object({
  meta: z.object({
    curso: z.string(),
    versao: z.string(),
    atualizadoEm: z.string(),
  }),
  temas: z.array(TemaSchema),
  perguntasOrais: z.array(PerguntaOralSchema),
  listas: z.array(ListaSchema),
  versiculos: z.array(VersiculoSchema),
  quiz: z.array(QuizItemSchema),
});
export type Conteudo = z.infer<typeof ConteudoSchema>;

export interface ValidationIssue {
  nivel: "erro";
  mensagem: string;
}

export function validarRegrasDeNegocio(conteudo: Conteudo): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const temaIds = new Set(conteudo.temas.map((t) => t.id));

  const idsVistos = new Set<string>();
  const registrarId = (id: string, origem: string) => {
    if (idsVistos.has(id)) {
      issues.push({ nivel: "erro", mensagem: `ID duplicado: "${id}" (${origem})` });
    }
    idsVistos.add(id);
  };

  for (const t of conteudo.temas) registrarId(t.id, "tema");

  for (const p of conteudo.perguntasOrais) {
    registrarId(p.id, "perguntaOral");
    if (!temaIds.has(p.temaId)) {
      issues.push({ nivel: "erro", mensagem: `Pergunta oral "${p.id}" referencia tema inexistente "${p.temaId}"` });
    }
    if (p.fonte.tipo === "complemento" && !p.verificar) {
      issues.push({ nivel: "erro", mensagem: `Pergunta oral "${p.id}" tem fonte "complemento" sem verificar:true` });
    }
  }

  for (const l of conteudo.listas) {
    registrarId(l.id, "lista");
    if (l.fonte.tipo === "complemento" && !l.verificar) {
      issues.push({ nivel: "erro", mensagem: `Lista "${l.id}" tem fonte "complemento" sem verificar:true` });
    }
  }

  for (const v of conteudo.versiculos) {
    registrarId(v.id, "versiculo");
    if (v.fonte.tipo === "complemento" && !v.verificar) {
      issues.push({ nivel: "erro", mensagem: `Versículo "${v.id}" tem fonte "complemento" sem verificar:true` });
    }
  }

  const alternativaIds = new Set(["a", "b", "c", "d"]);
  for (const q of conteudo.quiz) {
    registrarId(q.id, "quiz");
    if (!temaIds.has(q.temaId)) {
      issues.push({ nivel: "erro", mensagem: `Quiz "${q.id}" referencia tema inexistente "${q.temaId}"` });
    }
    const idsAlt = new Set(q.alternativas.map((a) => a.id));
    if (idsAlt.size !== q.alternativas.length) {
      issues.push({ nivel: "erro", mensagem: `Quiz "${q.id}" tem IDs de alternativa repetidos` });
    }
    if (!idsAlt.has(q.correta)) {
      issues.push({ nivel: "erro", mensagem: `Quiz "${q.id}" tem "correta" = "${q.correta}" que não existe nas alternativas` });
    }
    for (const a of q.alternativas) {
      if (!alternativaIds.has(a.id)) {
        issues.push({ nivel: "erro", mensagem: `Quiz "${q.id}" tem alternativa com id inesperado "${a.id}" (use a,b,c,d)` });
      }
    }
    if (q.fonte.tipo === "complemento" && !q.verificar) {
      issues.push({ nivel: "erro", mensagem: `Quiz "${q.id}" tem fonte "complemento" sem verificar:true` });
    }
  }

  return issues;
}
