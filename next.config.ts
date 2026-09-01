import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Redirects da reestruturação da árvore de navegação — mantém URLs antigas
   * funcionando (nada de link quebrado) enquanto o conteúdo passa a viver
   * nas novas rotas por categoria.
   */
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
