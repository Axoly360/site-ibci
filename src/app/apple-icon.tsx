import { ImageResponse } from "next/og";
import { BRAND_GREEN, MARK_ASPECT, markDataUri } from "@/lib/brandSvg";

// Ícone de tela de início do iPhone/iPad (o iOS arredonda os cantos sozinho).
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  const markHeight = 130;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: BRAND_GREEN,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={markDataUri()} width={Math.round(markHeight * MARK_ASPECT)} height={markHeight} alt="" />
      </div>
    ),
    { ...size },
  );
}
