import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { getAdminSession, hasPermission } from "@/lib/admin-session";

const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg"];

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!hasPermission(session, "eventos")) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const slug = String(formData.get("slug") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const dateLabel = String(formData.get("dateLabel") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const capacityRaw = String(formData.get("capacity") ?? "").trim();
  const capacity = capacityRaw ? Number(capacityRaw) : null;
  const price = String(formData.get("price") ?? "").trim();
  const externalLabel = String(formData.get("externalContactLabel") ?? "").trim();
  const externalMessage = String(formData.get("externalContactWhatsappMessage") ?? "").trim();
  const file = formData.get("image");

  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json(
      { error: "Slug inválido — use só letras minúsculas, números e hífen." },
      { status: 400 }
    );
  }
  if (!title || !description || !dateLabel || !location) {
    return NextResponse.json(
      { error: "Título, descrição, data e local são obrigatórios." },
      { status: 400 }
    );
  }
  if (capacityRaw && (!Number.isFinite(capacity) || (capacity as number) <= 0)) {
    return NextResponse.json({ error: "Capacidade inválida." }, { status: 400 });
  }

  let imageUrl: string | null = null;
  if (file && typeof file !== "string") {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Envie a imagem em PNG ou JPEG." }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Imagem maior que 10 MB não é permitida." },
        { status: 400 }
      );
    }
    try {
      const blob = await put(`eventos/${slug}/${Date.now()}-${file.name}`, file, {
        access: "public",
      });
      imageUrl = blob.url;
    } catch {
      return NextResponse.json(
        { error: "Armazenamento de arquivos ainda não configurado." },
        { status: 500 }
      );
    }
  }

  try {
    await sql`
      insert into events
        (slug, title, description, date_label, location, capacity, price, image_url,
         external_contact_label, external_contact_whatsapp_message)
      values (
        ${slug}, ${title}, ${description}, ${dateLabel}, ${location}, ${capacity}, ${price || null},
        ${imageUrl}, ${externalLabel || null}, ${externalLabel ? externalMessage || null : null}
      )
    `;
  } catch {
    return NextResponse.json({ error: "Já existe um evento com esse slug." }, { status: 409 });
  }

  revalidatePath("/");
  revalidatePath("/para-voce/eventos");
  revalidatePath(`/para-voce/eventos/${slug}`);

  return NextResponse.json({ ok: true });
}
