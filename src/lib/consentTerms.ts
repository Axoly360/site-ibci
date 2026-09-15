/**
 * Termos de consentimento (LGPD) que o membro pode visualizar e aceitar.
 * O texto de cada termo é editável pelo painel (tabela site_content, chaves
 * abaixo) — aqui só ficam a identidade do termo e o título padrão, para não
 * inventar texto jurídico que a igreja ainda não escreveu.
 */
export interface ConsentTerm {
  key: string;
  defaultTitle: string;
  titleContentKey: string;
  bodyContentKey: string;
}

export const CONSENT_TERMS: ConsentTerm[] = [
  {
    key: "imagem",
    defaultTitle: "Autorização de Uso de Imagem",
    titleContentKey: "consentimento.imagem.titulo",
    bodyContentKey: "consentimento.imagem.corpo",
  },
  {
    key: "voluntariado",
    defaultTitle: "Termo de Trabalho Voluntário",
    titleContentKey: "consentimento.voluntariado.titulo",
    bodyContentKey: "consentimento.voluntariado.corpo",
  },
  {
    key: "protecao",
    defaultTitle: "Política de Proteção de Crianças, Adolescentes e Idosos",
    titleContentKey: "consentimento.protecao.titulo",
    bodyContentKey: "consentimento.protecao.corpo",
  },
];
