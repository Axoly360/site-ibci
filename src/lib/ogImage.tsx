import { ImageResponse } from "next/og";
import { BRAND_GREEN, BRAND_LINHO, BRAND_SOL, MARK_ASPECT, markDataUri } from "@/lib/brandSvg";

export const OG_SIZE = { width: 1200, height: 630 };

/**
 * Imagem de compartilhamento (WhatsApp, redes sociais): fundo verde-floresta,
 * marca com o sol à esquerda, nome e lema em linho. Segue a regra do sistema:
 * um único destaque em sol (o halo da marca e o filete do lema).
 */
export function renderOgImage() {
  const markHeight = 380;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 56,
          padding: "0 80px",
          background: BRAND_GREEN,
          color: BRAND_LINHO,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={markDataUri()} width={Math.round(markHeight * MARK_ASPECT)} height={markHeight} alt="" />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 150, fontWeight: 800, letterSpacing: 6, lineHeight: 1 }}>IBCI</div>
          <div style={{ fontSize: 34, letterSpacing: 5, marginTop: 14, opacity: 0.9 }}>
            IGREJA BATISTA CENTRAL DO IBURA
          </div>
          <div style={{ width: 120, height: 5, background: BRAND_SOL, marginTop: 34, borderRadius: 3 }} />
          <div style={{ fontSize: 38, marginTop: 28, maxWidth: 560, lineHeight: 1.3 }}>
            Uma família para pertencer, um lugar para servir.
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}
