import { ImageResponse } from "next/og";
import { BRAND_GREEN, MARK_ASPECT, markDataUri } from "@/lib/brandSvg";

// Ícone do app instalável: a marca oficial da IBCI sobre o verde-floresta.
// "maskable" deixa uma margem maior, porque o Android recorta o ícone em
// círculo/gota e cortaria as bordas.
export async function GET(
  request: Request,
  ctx: { params: Promise<{ size: string }> },
) {
  const { size: raw } = await ctx.params;
  const size = raw === "192" ? 192 : 512;
  const maskable = new URL(request.url).searchParams.has("maskable");
  const markHeight = Math.round(size * (maskable ? 0.52 : 0.72));

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
    {
      width: size,
      height: size,
      headers: { "Cache-Control": "public, max-age=86400" },
    },
  );
}
