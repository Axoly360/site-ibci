export interface BlocoApresentacao {
  id: string;
  pergunta: string;
  dica: string;
  texto: string;
  precisaMelhorar: boolean;
}

export const BLOCOS_PADRAO: BlocoApresentacao[] = [
  {
    id: "b1",
    pergunta: "Qual é o seu nome? Fale um pouco sobre você.",
    dica: "Nome completo, profissão, o que você gosta de fazer.",
    texto: "",
    precisaMelhorar: false,
  },
  {
    id: "b2",
    pergunta: "Você é casado(a) ou solteiro(a)? Tem filhos?",
    dica: "Fale brevemente da sua família.",
    texto: "",
    precisaMelhorar: false,
  },
  {
    id: "b3",
    pergunta: "Há quantos anos você é convertido? Como conheceu Jesus?",
    dica: "Sua origem e caminhada, inclusive outras igrejas por onde passou.",
    texto: "",
    precisaMelhorar: false,
  },
  {
    id: "b4",
    pergunta: "Há quanto tempo você está nesta igreja?",
    dica: "Cite quando e onde você foi batizado.",
    texto: "",
    precisaMelhorar: false,
  },
  {
    id: "b5",
    pergunta: "Houve mudança de vida depois que você se encontrou com Jesus?",
    dica: "Comportamento, família, trabalho.",
    texto: "",
    precisaMelhorar: false,
  },
  {
    id: "b6",
    pergunta: "Quais funções e ministérios você já exerce ou exerceu na igreja?",
    dica: "Cargos, EBD, sociedades, etc.",
    texto: "",
    precisaMelhorar: false,
  },
  {
    id: "b7",
    pergunta: "Por que você aceitou o chamado para o diaconato?",
    dica: "Seja breve e sincero.",
    texto: "",
    precisaMelhorar: false,
  },
  {
    id: "b8",
    pergunta: "Como você entende o serviço às três mesas?",
    dica: "Mesa do Senhor, do Pastor e dos necessitados — veja também a Sabatina Oral.",
    texto: "",
    precisaMelhorar: false,
  },
];

export function novoBloco(pergunta: string): BlocoApresentacao {
  return {
    id: `custom-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    pergunta,
    dica: "",
    texto: "",
    precisaMelhorar: false,
  };
}

export function moverBloco<T>(itens: T[], indice: number, direcao: -1 | 1): T[] {
  const destino = indice + direcao;
  if (destino < 0 || destino >= itens.length) return itens;
  const copia = [...itens];
  [copia[indice], copia[destino]] = [copia[destino], copia[indice]];
  return copia;
}

export function montarRoteiroCompleto(blocos: BlocoApresentacao[]): string {
  return blocos
    .filter((b) => b.texto.trim().length > 0)
    .map((b) => `${b.pergunta}\n${b.texto.trim()}`)
    .join("\n\n");
}
