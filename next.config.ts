import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Redirects da reestruturação da árvore de navegação — mantém URLs antigas
   * funcionando (nada de link quebrado) enquanto o conteúdo passa a viver
   * nas novas rotas por categoria.
   */
  // O service worker nunca pode ficar em cache, senão o celular não recebe
  // versões novas dele.
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        ],
      },
    ];
  },

  async redirects() {
    return [
      {
        source: "/quem-somos",
        destination: "/a-igreja",
        permanent: true,
      },
      {
        source: "/contribuicoes",
        destination: "/para-voce/dizimos-e-ofertas",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
