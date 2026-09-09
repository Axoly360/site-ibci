import { sql } from "@/lib/db";

export type CheckinResult =
  | { status: "not_found" }
  | { status: "already"; name: string; checkedInAt: string }
  | { status: "ok"; name: string };

/**
 * Marca o check-in de um participante pelo código curto (único em toda a
 * tabela). Usada tanto pela entrada manual no painel (com eventSlug pra
 * garantir que o código pertence ao evento certo) quanto pela URL do QR Code
 * (/checkin/validar/[code], sem eventSlug — o código já identifica o evento).
 */
export async function performCheckin(
  code: string,
  adminId: string,
  eventSlug?: string
): Promise<CheckinResult> {
  const normalizedCode = code.trim().toUpperCase();

  const [attendee] = eventSlug
    ? await sql`
        select id, name, checked_in_at from event_attendees
        where event_slug = ${eventSlug} and code = ${normalizedCode}
      `
    : await sql`
        select id, name, checked_in_at from event_attendees
        where code = ${normalizedCode}
      `;

  if (!attendee) {
    return { status: "not_found" };
  }

  if (attendee.checked_in_at) {
    return { status: "already", name: attendee.name, checkedInAt: attendee.checked_in_at };
  }

  await sql`
    update event_attendees
    set checked_in_at = now(), checked_in_by = ${adminId}
    where id = ${attendee.id}
  `;

  return { status: "ok", name: attendee.name };
}
