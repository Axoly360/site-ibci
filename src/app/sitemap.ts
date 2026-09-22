import type { MetadataRoute } from "next";
import { getEvents } from "@/lib/events";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://site-ibci.vercel.app";

const STATIC_PATHS = [
  "/",
  "/a-igreja",
  "/a-igreja/nossa-historia",
  "/a-igreja/em-que-cremos",
  "/a-igreja/lideranca",
  "/a-igreja/missao-valores-e-visao",
  "/a-igreja/estatuto-ibci",
  "/a-igreja/nossa-congregacao",
  "/a-igreja/memorial-ibci",
  "/a-igreja/galeria-de-fotos",
  "/ministerios",
  "/ministerios/pastoral",
  "/ministerios/diaconal",
  "/ministerios/louvor",
  "/ministerios/infantil",
  "/ministerios/jovens",
  "/ministerios/mulheres",
  "/ministerios/homens",
  "/ministerios/educacao-crista",
  "/ministerios/acao-social",
  "/ministerios/familia",
  "/para-voce",
  "/para-voce/dizimos-e-ofertas",
  "/para-voce/servir",
  "/para-voce/eventos",
  "/para-voce/pedidos-de-oracao",
  "/para-voce/mensagens",
  "/para-voce/cursos",
  "/para-voce/ibci-news",
  "/para-voce/projeto-pepe",
  "/para-voce/programacoes",
  "/para-voce/privacidade",
  "/projetos",
  "/contato",
  "/visitantes/cadastro",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));

  const events = await getEvents();
  const eventEntries: MetadataRoute.Sitemap = events.map((event) => ({
    url: `${SITE_URL}/para-voce/eventos/${event.slug}`,
    lastModified: new Date(),
  }));

  return [...staticEntries, ...eventEntries];
}
