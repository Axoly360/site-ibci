import { sql } from "@/lib/db";

export interface WeeklyScheduleItem {
  id: string;
  day: string;
  title: string;
  time: string;
  description: string;
  position: number;
}

/** Nunca inventa dados: se o banco falhar, devolve lista vazia. */
export async function getWeeklySchedule(): Promise<WeeklyScheduleItem[]> {
  try {
    return await sql`
      select id, day, title, time, description, position
      from weekly_schedule_items
      order by position asc, created_at asc
    `;
  } catch {
    return [];
  }
}
