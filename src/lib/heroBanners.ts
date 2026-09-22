import { sql } from "@/lib/db";

export interface HeroBanner {
  id: string;
  srcDesktop: string;
  srcMobile: string;
  alt: string | null;
  href: string | null;
}

export interface HeroBannerRow extends HeroBanner {
  position: number;
}

/** Nunca inventa dados: se o banco falhar, devolve lista vazia (o Hero
 * simplesmente fica sem slides, em vez de mostrar algo inventado). */
export async function getHeroBanners(): Promise<HeroBannerRow[]> {
  try {
    const rows = await sql`
      select id, image_desktop_url, image_mobile_url, alt_text, href_url, position
      from hero_banners
      order by position asc, created_at asc
    `;
    return rows.map(
      (r: {
        id: string;
        image_desktop_url: string;
        image_mobile_url: string;
        alt_text: string | null;
        href_url: string | null;
        position: number;
      }) => ({
        id: r.id,
        srcDesktop: r.image_desktop_url,
        srcMobile: r.image_mobile_url,
        alt: r.alt_text,
        href: r.href_url,
        position: r.position,
      })
    );
  } catch {
    return [];
  }
}
