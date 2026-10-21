import Link from "next/link";
import { BookOpen } from "lucide-react";

export interface MemberEbdView {
  id: string;
  name: string;
  teacher_name: string | null;
  meeting_time: string | null;
}

export default function MemberEbdCard({
  classes,
  pendingCount,
}: {
  classes: MemberEbdView[];
  pendingCount: number;
}) {
  return (
    <Link
      href="/central-do-membro/ebd"
      className="mt-4 flex items-center gap-2 rounded-2xl border-l-4 border-secondary bg-white px-5 py-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <BookOpen className="h-5 w-5 shrink-0 text-secondary" />
      <p className="flex-1 text-sm text-text-neutral">
        <span className="font-bold text-primary">Minha EBD:</span>{" "}
        {classes.length > 0
          ? classes
              .map((c) => [c.name, c.teacher_name ? `Prof. ${c.teacher_name}` : null].filter(Boolean).join(" — "))
              .join(" · ")
          : pendingCount > 0
            ? "aguardando aprovação da secretaria"
            : "escolha a sua sala"}
      </p>
    </Link>
  );
}
