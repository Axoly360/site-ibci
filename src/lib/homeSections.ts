/**
 * Ordem das seções "de texto" da home (as que têm título/subtítulo editáveis
 * em /admin/textos). As seções só de imagem (Hero, Destaques, Banner
 * Principal — geridas em /admin/banners) ficam fixas nos mesmos intervalos
 * de sempre; só a ordem relativa destas 5 pode ser alterada.
 */
export const HOME_SECTION_KEYS = [
  "acessoRapido",
  "ultimasMensagens",
  "eventosDoMes",
  "programacaoSemana",
  "conhecaIbci",
] as const;

export type HomeSectionKey = (typeof HOME_SECTION_KEYS)[number];

const CONTENT_KEY = "home.sectionOrder";

function isHomeSectionKey(value: string): value is HomeSectionKey {
  return (HOME_SECTION_KEYS as readonly string[]).includes(value);
}

/** Lê a ordem salva (JSON) e garante que as 5 chaves sempre apareçam, mesmo
 * se o valor salvo estiver incompleto ou corrompido. */
export function parseHomeSectionOrder(raw: string | undefined): HomeSectionKey[] {
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const valid = parsed.filter(
          (k): k is HomeSectionKey => typeof k === "string" && isHomeSectionKey(k)
        );
        const missing = HOME_SECTION_KEYS.filter((k) => !valid.includes(k));
        return [...valid, ...missing];
      }
    } catch {
      // ignora JSON inválido e cai no padrão abaixo
    }
  }
  return [...HOME_SECTION_KEYS];
}

export { CONTENT_KEY as HOME_SECTION_ORDER_KEY };
