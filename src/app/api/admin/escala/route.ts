import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { getAdminSession, hasPermission } from "@/lib/admin-session";
import { setContent } from "@/lib/content";
import { isImageOrPdfFile, sanitizeFileName } from "@/lib/fileValidation";

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!hasPermission(session, "membros")) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Arquivo maior que 10 MB não é permitido." },
      { status: 400 }
    );
  }
  if (!(await isImageOrPdfFile(file))) {
    return NextResponse.json(
      { error: "Envie uma imagem (PNG, JPEG, GIF, WEBP) ou um PDF." },
      { status: 400 }
    );
  }

  let blob;
  try {
    blob = await put(`escala/${Date.now()}-${sanitizeFileName(file.name)}`, file, {
      access: "public",
    });
  } catch {
    return NextResponse.json(
      { error: "Armazenamento de arquivos ainda não configurado." },
      { status: 500 }
    );
  }

  await setContent("escala.image_url", blob.url);
  revalidatePath("/central-do-membro/escala");

  return NextResponse.json({ ok: true, url: blob.url });
}
