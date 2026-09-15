import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { getAdminSession, hasPermission } from "@/lib/admin-session";
import { setContent } from "@/lib/content";

const DOC_TYPES = ["estatuto", "regimento"] as const;

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!hasPermission(session, "paginas")) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  const docType = formData?.get("docType");

  if (typeof docType !== "string" || !DOC_TYPES.includes(docType as never)) {
    return NextResponse.json({ error: "Documento inválido." }, { status: 400 });
  }
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
  }
  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "Envie o documento em PDF." }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Arquivo maior que 10 MB não é permitido." },
      { status: 400 }
    );
  }

  let blob;
  try {
    blob = await put(`documentos/${docType}-${Date.now()}.pdf`, file, { access: "public" });
  } catch {
    return NextResponse.json(
      { error: "Armazenamento de arquivos ainda não configurado." },
      { status: 500 }
    );
  }

  await setContent(`documentos.${docType}.url`, blob.url);
  revalidatePath("/a-igreja/estatuto-ibci");

  return NextResponse.json({ ok: true, url: blob.url });
}
