/**
 * Ministérios e frentes de voluntariado da IBCI para o cadastro de
 * voluntariado. Combina os ministérios já publicados no menu do site
 * (nav_items, categoria "Ministérios") com projetos e equipes específicas
 * que também recebem voluntários.
 */
export const MINISTRIES = [
  "Pastoral",
  "Diaconal",
  "Louvor",
  "Ministério Infantil",
  "Jovens",
  "Mulheres",
  "Homens",
  "Educação Cristã",
  "Ação Social",
  "Família",
  "Recepção",
  "Projeto PEPE",
] as const;

/** Link para "saiba mais" de cada frente, quando existe uma página própria. */
export const MINISTRY_LINKS: Partial<Record<(typeof MINISTRIES)[number], string>> = {
  Pastoral: "/ministerios/pastoral",
  Diaconal: "/ministerios/diaconal",
  Louvor: "/ministerios/louvor",
  "Ministério Infantil": "/ministerios/infantil",
  Jovens: "/ministerios/jovens",
  Mulheres: "/ministerios/mulheres",
  Homens: "/ministerios/homens",
  "Educação Cristã": "/ministerios/educacao-crista",
  "Ação Social": "/ministerios/acao-social",
  Família: "/ministerios/familia",
  "Projeto PEPE": "/para-voce/projeto-pepe",
};
