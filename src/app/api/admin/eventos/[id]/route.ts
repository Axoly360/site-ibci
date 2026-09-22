import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { getAdminSession, hasPermission } from "@/lib/admin-session";
import { isImageFile, sanitizeFileName } from "@/lib/fileValidation";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

  let imageUrl: string | undefined;
  if (file && typeof file !== "string") {
    if (!(await isImageFile(file))) {
      return NextResponse.json({ error: "Envie a imagem em PNG ou JPEG." }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Imagem maior que 10 MB não é permitida." },
        { status: 400 }
      );
    }
    try {
      const blob = await put(`eventos/${slug}/${Date.now()}-${sanitizeFileName(file.name)}`, file, {
        access: "public",
        addRandomSuffix: true,
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
    if (imageUrl) {
      await sql`
        update events
        set slug = ${slug}, title = ${title}, description = ${description},
            date_label = ${dateLabel}, location = ${location}, capacity = ${capacity},
            price = ${price || null}, image_url = ${imageUrl},
            external_contact_label = ${externalLabel || null},
            external_contact_whatsapp_message = ${externalLabel ? externalMessage || null : null},
            updated_at = now()
        where id = ${id}
      `;
    } else {
      await sql`
        update events
        set slug = ${slug}, title = ${title}, description = ${description},
            date_label = ${dateLabel}, location = ${location}, capacity = ${capacity},
            price = ${price || null},
            external_contact_label = ${externalLabel || null},
            external_contact_whatsapp_message = ${externalLabel ? externalMessage || null : null},
            updated_at = now()
        where id = ${id}
      `;
    }
  } catch {
    return NextResponse.json({ error: "Já existe um evento com esse slug." }, { status: 409 });
  }

  revalidatePath("/");
  revalidatePath("/para-voce/eventos");
  revalidatePath(`/para-voce/eventos/${slug}`);

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getAdminSession();
  if (!hasPermission(session, "eventos")) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const [deleted] = await sql`delete from events where id = ${id} returning slug`;

  revalidatePath("/");
  revalidatePath("/para-voce/eventos");
  if (deleted) revalidatePath(`/para-voce/eventos/${deleted.slug}`);

  return NextResponse.json({ ok: true });
}
