import { sql } from "@/lib/db";

export interface QuickAccessCard {
  id: string;
  icon: string;
  title: string;
  description: string;
  actionType: "link" | "pix" | "info";
  linkUrl: string | null;
  external: boolean;
  ctaLabel: string | null;
}

/** Nunca inventa dados: se o banco falhar, devolve lista vazia. */
export async function getQuickAccessCards(): Promise<QuickAccessCard[]> {
  try {
    const rows = await sql`
      select id, icon, title, description, action_type, link_url, external, cta_label
      from quick_access_cards
      order by position asc, created_at asc
    `;
    return rows.map(
      (r: {
        id: string;
        icon: string;
        title: string;
        description: string;
        action_type: "link" | "pix" | "info";
        link_url: string | null;
        external: boolean;
        cta_label: string | null;
      }) => ({
        id: r.id,
        icon: r.icon,
        title: r.title,
        description: r.description,
        actionType: r.action_type,
        linkUrl: r.link_url,
        external: r.external,
        ctaLabel: r.cta_label,
      })
    );
  } catch {
    return [];
  }
}
