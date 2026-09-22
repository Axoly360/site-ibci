import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://site-ibci.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Áreas logadas/privadas — sem valor pra busca, e não devem aparecer
      // pra quem pesquisa no Google.
      disallow: ["/admin", "/central-do-membro", "/congregacoes", "/api"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
