import type { Metadata, Viewport } from "next";
import "./globals.css";
import { fraunces, nunitoSans } from "./fonts";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import InstalarApp from "@/components/layout/InstalarApp";

// Domínio de produção — troque para o domínio próprio (ex.: ibciibura.com.br)
// assim que ele existir. Enquanto isso, usa a URL padrão da Vercel. Sem
// isso, o compartilhamento de links no WhatsApp/redes sociais não mostra
// nenhuma prévia (sem imagem, sem título formatado).
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://site-ibci.vercel.app";
const SITE_TITLE = "IBCI - Igreja Batista Central do Ibura";
const SITE_DESCRIPTION =
  "Igreja Batista Central do Ibura (IBCI) - Uma família para pertencer, um lugar para servir. Cultos, mensagens e informações da nossa comunidade em Recife-PE.";

export const viewport: Viewport = {
  themeColor: "#f5efe1",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Sem template: cada página do site já define seu próprio título completo
  // (ex.: "Membros | Painel IBCI") — um template aqui duplicaria o sufixo.
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: "IBCI - Igreja Batista Central do Ibura",
    // A imagem vem de src/app/opengraph-image.tsx (marca sobre verde).
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    // A imagem vem de src/app/twitter-image.tsx.
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${fraunces.variable} ${nunitoSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg-light text-text-neutral">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <InstalarApp />
      </body>
    </html>
  );
}
