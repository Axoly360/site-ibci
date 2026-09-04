import { sql } from "@/lib/db";
import { navLinks } from "@/data/churchInfo";
import type { NavLink } from "@/types";

export interface NavItemRow {
  id: string;
  parent_id: string | null;
  label: string;
  href: string;
  value: string | null;
  position: number;
  visible: boolean;
}

/**
 * Monta a árvore de navegação a partir do banco (nav_items). Se o banco
 * falhar ou a tabela ainda não tiver sido semeada, cai para a árvore
 * estática de churchInfo.ts — o menu nunca fica vazio.
 */
export async function getNavTree(): Promise<NavLink[]> {
  try {
    const rows: NavItemRow[] = await sql`
      select id, parent_id, label, href, value, position, visible
      from nav_items
      where visible = true
      order by position asc
    `;
    if (rows.length === 0) return navLinks;

    const byParent = new Map<string | null, NavItemRow[]>();
    for (const row of rows) {
      const list = byParent.get(row.parent_id) ?? [];
      list.push(row);
      byParent.set(row.parent_id, list);
    }

    const build = (parentId: string | null): NavLink[] =>
      (byParent.get(parentId) ?? []).map((row) => {
        const children = build(row.id);
        return {
          label: row.label,
          href: row.href,
          value: row.value ?? undefined,
          children: children.length > 0 ? children : undefined,
        };
      });

    return build(null);
  } catch {
    return navLinks;
  }
}
