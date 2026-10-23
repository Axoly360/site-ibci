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
        // Proteções básicas em todas as páginas: impede embutir o site/painel em
        // outro domínio (clickjacking), adivinhação de tipo de arquivo e vazamento
        // do endereço completo de origem. Sem CSP de propósito: o site usa
        // iframes (YouTube, mapas) e imagens de vários domínios, e uma CSP
        // incompleta quebraria páginas.
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
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
