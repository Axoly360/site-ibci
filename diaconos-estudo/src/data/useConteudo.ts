import conteudoBruto from "./conteudo.json";
import { ConteudoSchema, type Conteudo } from "./schema";

let cache: Conteudo | null = null;

export function obterConteudo(): Conteudo {
  if (cache) return cache;
  cache = ConteudoSchema.parse(conteudoBruto);
  return cache;
}

export const GRUPOS_ESSENCIAIS: { id: string; titulo: string }[] = [
  { id: "e1", titulo: "As 3 características do diácono (At 6:3)" },
  { id: "e2", titulo: "As 3 mesas" },
  { id: "e3", titulo: "Os 6 princípios batistas" },
  { id: "e4", titulo: "As 19 doutrinas bíblicas" },
  { id: "e5", titulo: "As 2 ordenanças da igreja" },
  { id: "e6", titulo: "O Dia do Senhor" },
  { id: "e7", titulo: "Os 7 primeiros diáconos" },
];
