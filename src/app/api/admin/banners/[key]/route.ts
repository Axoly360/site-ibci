import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { getAdminSession, hasPermission } from "@/lib/admin-session";
import { setContentBlock } from "@/lib/contentBlocks";

async function uploadIfPresent(
  formData: FormData,
  field: string,
  keyPrefix: string
): Promise<string | undefined> {
  const file = formData.get(field);
  if (!file || typeof file === "string") return undefined;
  if (file.size > 10 * 1024 * 1024) {
    throw new Error(`Arquivo de "${field}" maior que 10 MB não é permitido.`);
  }
  const blob = await put(`banners/${keyPrefix}/${Date.now()}-${file.name}`, file, {
    access: "public",
  });
  return blob.url;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  const session = await getAdminSession();
  if (!hasPermission(session, "banners")) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const title = formData.get("title");
  const subtitle = formData.get("subtitle");
  const linkUrl = formData.get("linkUrl");
  const videoUrl = formData.get("videoUrl");

  try {
    const imageUrl = await uploadIfPresent(formData, "image", key);
    const imageMobileUrl = await uploadIfPresent(formData, "imageMobile", `${key}-mobile`);

    await setContentBlock(key, {
      title: typeof title === "string" && title.trim() ? title.trim() : undefined,
      subtitle: typeof subtitle === "string" && subtitle.trim() ? subtitle.trim() : undefined,
      linkUrl: typeof linkUrl === "string" ? linkUrl.trim() : undefined,
      videoUrl: typeof videoUrl === "string" ? videoUrl.trim() : undefined,
      imageUrl,
      imageMobileUrl,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Não foi possível salvar.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
