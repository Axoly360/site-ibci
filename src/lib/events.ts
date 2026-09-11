import { sql } from "@/lib/db";

export interface ChurchEvent {
  id: string;
  slug: string;
  title: string;
  description: string;
  dateLabel: string;
  location: string;
  capacity: number | null;
  price: string | null;
  imageUrl: string | null;
  /**
   * Quando definido, a inscrição de verdade acontece por fora do site (ex.:
   * evento pago, combinado com um responsável) — a página mostra um contato
   * em vez do fluxo de conta/e-mail.
   */
  externalContact: { label: string; whatsappMessage: string } | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any): ChurchEvent {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    dateLabel: row.date_label,
    location: row.location,
    capacity: row.capacity,
    price: row.price,
    imageUrl: row.image_url,
    externalContact: row.external_contact_label
      ? {
          label: row.external_contact_label,
          whatsappMessage: row.external_contact_whatsapp_message ?? "",
        }
      : null,
  };
}

/** Nunca inventa eventos: se o banco falhar, devolve lista vazia. */
export async function getEvents(): Promise<ChurchEvent[]> {
  try {
    const rows = await sql`select * from events order by created_at desc`;
    return rows.map(mapRow);
  } catch {
    return [];
  }
}

export async function getEventBySlug(slug: string): Promise<ChurchEvent | null> {
  try {
    const [row] = await sql`select * from events where slug = ${slug}`;
    return row ? mapRow(row) : null;
  } catch {
    return null;
  }
}
