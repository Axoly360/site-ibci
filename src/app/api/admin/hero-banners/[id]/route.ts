import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { getAdminSession, hasPermission } from "@/lib/admin-session";
import { isImageFile, sanitizeFileName } from "@/lib/fileValidation";

/** Edita um banner existente — as imagens são opcionais aqui (só troca se
 * um novo arquivo for enviado; senão mantém a atual). */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

  let desktopUrl: string | undefined;
  let mobileUrl: string | undefined;

  try {
    if (imageDesktop && typeof imageDesktop !== "string") {
      if (imageDesktop.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: "A imagem de desktop precisa ter no máximo 10 MB." },
          { status: 400 }
        );
      }
      if (!(await isImageFile(imageDesktop))) {
        return NextResponse.json(
          { error: "A imagem de desktop precisa ser PNG, JPEG, GIF ou WEBP." },
          { status: 400 }
        );
      }
      const blob = await put(
        `hero-banners/${Date.now()}-${sanitizeFileName(imageDesktop.name)}`,
        imageDesktop,
        { access: "public", addRandomSuffix: true }
      );
      desktopUrl = blob.url;
    }
    if (imageMobile && typeof imageMobile !== "string") {
      if (imageMobile.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: "A imagem de mobile precisa ter no máximo 10 MB." },
          { status: 400 }
        );
      }
      if (!(await isImageFile(imageMobile))) {
        return NextResponse.json(
          { error: "A imagem de mobile precisa ser PNG, JPEG, GIF ou WEBP." },
          { status: 400 }
        );
      }
      const blob = await put(
        `hero-banners/${Date.now()}-mobile-${sanitizeFileName(imageMobile.name)}`,
        imageMobile,
        { access: "public", addRandomSuffix: true }
      );
      mobileUrl = blob.url;
    }
  } catch {
    return NextResponse.json(
      { error: "Armazenamento de arquivos ainda não configurado." },
      { status: 500 }
    );
  }

  if (desktopUrl && mobileUrl) {
    await sql`
      update hero_banners
      set image_desktop_url = ${desktopUrl}, image_mobile_url = ${mobileUrl},
          alt_text = ${alt || null}, href_url = ${href || null}
      where id = ${id}
    `;
  } else if (desktopUrl) {
    await sql`
      update hero_banners
      set image_desktop_url = ${desktopUrl}, alt_text = ${alt || null}, href_url = ${href || null}
      where id = ${id}
    `;
  } else if (mobileUrl) {
    await sql`
      update hero_banners
      set image_mobile_url = ${mobileUrl}, alt_text = ${alt || null}, href_url = ${href || null}
      where id = ${id}
    `;
  } else {
    await sql`
      update hero_banners set alt_text = ${alt || null}, href_url = ${href || null} where id = ${id}
    `;
  }

  revalidatePath("/");

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getAdminSession();
  if (!hasPermission(session, "banners")) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  await sql`delete from hero_banners where id = ${id}`;

  revalidatePath("/");

  return NextResponse.json({ ok: true });
}
