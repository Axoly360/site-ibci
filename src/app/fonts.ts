import { Fraunces, Nunito_Sans } from "next/font/google";

// Tipografia do sistema de design da IBCI: Fraunces nos títulos (itálico nos
// versículos) e Nunito Sans no texto. O next/font baixa e hospeda as fontes
// junto do site no build, sem requisição externa em tempo de uso.
export const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  style: ["normal", "italic"],
});

export const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});
