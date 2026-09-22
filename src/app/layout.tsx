import type { Metadata } from "next";
import "./globals.css";
import { inter, montserrat } from "./fonts";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

// Domínio de produção — troque para o domínio próprio (ex.: ibciibura.com.br)
// assim que ele existir. Enquanto isso, usa a URL padrão da Vercel. Sem
// isso, o compartilhamento de links no WhatsApp/redes sociais não mostra
// nenhuma prévia (sem imagem, sem título formatado).
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://site-ibci.vercel.app";
const SITE_TITLE = "IBCI - Igreja Batista Central do Ibura";
const SITE_DESCRIPTION =
  "Igreja Batista Central do Ibura (IBCI) - Uma família para pertencer, um lugar para servir. Cultos, mensagens e informações da nossa comunidade em Recife-PE.";

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
    images: [{ url: "/hero-1-desktop.png", width: 1350, height: 460 }],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/hero-1-desktop.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg-light text-text-neutral">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
