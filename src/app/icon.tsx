import { ImageResponse } from "next/og";
import { BRAND_GREEN, MARK_ASPECT, markDataUri } from "@/lib/brandSvg";

// Favicon: a marca da IBCI (sol, família, cruz e Bíblia) sobre o verde-floresta.
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  const markHeight = 52;
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
          borderRadius: 14,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={markDataUri()} width={Math.round(markHeight * MARK_ASPECT)} height={markHeight} alt="" />
      </div>
    ),
    { ...size },
  );
}
