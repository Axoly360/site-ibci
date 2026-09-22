import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { getAdminSession, hasPermission } from "@/lib/admin-session";
import { isImageFile, sanitizeFileName } from "@/lib/fileValidation";

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!hasPermission(session, "banners")) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const alt = String(formData.get("alt") ?? "").trim();
  const href = String(formData.get("href") ?? "").trim();
  const imageDesktop = formData.get("imageDesktop");
  const imageMobile = formData.get("imageMobile");

  if (!imageDesktop || typeof imageDesktop === "string") {
    return NextResponse.json(
      { error: "Envie a imagem de desktop (1360x460)." },
      { status: 400 }
    );
  }
  if (!imageMobile || typeof imageMobile === "string") {
    return NextResponse.json(
      { error: "Envie a imagem de mobile (390x546)." },
      { status: 400 }
    );
  }
  for (const file of [imageDesktop, imageMobile]) {
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Cada imagem precisa ter no máximo 10 MB." },
        { status: 400 }
      );
    }
    if (!(await isImageFile(file))) {
      return NextResponse.json(
        { error: "As imagens precisam ser PNG, JPEG, GIF ou WEBP." },
        { status: 400 }
      );
    }
  }

  let desktopUrl: string;
  let mobileUrl: string;
  try {
    const [desktopBlob, mobileBlob] = await Promise.all([
      put(`hero-banners/${Date.now()}-${sanitizeFileName(imageDesktop.name)}`, imageDesktop, {
        access: "public",
      }),
      put(`hero-banners/${Date.now()}-mobile-${sanitizeFileName(imageMobile.name)}`, imageMobile, {
        access: "public",
      }),
    ]);
    desktopUrl = desktopBlob.url;
    mobileUrl = mobileBlob.url;
  } catch {
    return NextResponse.json(
      { error: "Armazenamento de arquivos ainda não configurado." },
      { status: 500 }
    );
  }

  const [{ max_position }] = await sql`
    select coalesce(max(position), -1) as max_position from hero_banners
  `;

  await sql`
    insert into hero_banners (image_desktop_url, image_mobile_url, alt_text, href_url, position)
    values (${desktopUrl}, ${mobileUrl}, ${alt || null}, ${href || null}, ${max_position + 1})
  `;

  revalidatePath("/");

  return NextResponse.json({ ok: true });
}
