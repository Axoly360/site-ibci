import { ImageResponse } from "next/og";

// Ícone do app instalável: o logo da IBCI (creme) sobre o verde da marca.
// "maskable" deixa uma margem maior, porque o Android recorta o ícone em
// círculo/gota e cortaria as bordas.
export async function GET(
  request: Request,
  ctx: { params: Promise<{ size: string }> },
) {
  const { size: raw } = await ctx.params;
  const size = raw === "192" ? 192 : 512;
  const maskable = new URL(request.url).searchParams.has("maskable");
  const logo = Math.round(size * (maskable ? 0.6 : 0.82));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#123b2c",
        }}
      >
        <svg width={logo} height={logo} viewBox="0 0 300 300">
          <g fill="#F5F2E9">
            <path d="M 50,150 A 100,100 0 0,1 250,150" fill="none" stroke="#F5F2E9" strokeWidth="10" strokeLinecap="round" />
            <rect x="142" y="70" width="16" height="80" rx="2" />
            <rect x="120" y="90" width="60" height="16" rx="2" />
            <circle cx="125" cy="118" r="9" />
            <circle cx="150" cy="110" r="11" />
            <circle cx="175" cy="118" r="9" />
            <path d="M 105,145 C 110,128 120,128 130,138 C 140,125 160,125 170,138 C 180,128 190,128 195,145 Z" />
            <path d="M 60,165 C 105,160 145,170 150,178 C 155,170 195,160 240,165 L 235,182 C 195,177 155,185 150,192 C 145,185 105,177 65,182 Z" />
            <rect x="60" y="185" width="180" height="8" rx="2" />
            <rect x="105" y="215" width="12" height="30" />
            <rect x="130" y="215" width="12" height="30" />
            <rect x="158" y="215" width="12" height="30" />
            <rect x="183" y="215" width="12" height="30" />
          </g>
        </svg>
      </div>
    ),
    {
      width: size,
      height: size,
      headers: { "Cache-Control": "public, max-age=86400" },
    },
  );
}
