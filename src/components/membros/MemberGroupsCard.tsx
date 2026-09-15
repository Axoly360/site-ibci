"use client";

import { useState } from "react";
import { CalendarClock, ChevronDown, MapPin, UserRound, Users } from "lucide-react";

export interface MemberGroupView {
  id: string;
  name: string;
  leader_name: string | null;
  meeting_day: string | null;
  location: string | null;
}

export default function MemberGroupsCard({ groups }: { groups: MemberGroupView[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border-l-4 border-secondary bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={groups.length === 0}
        className="flex w-full items-center gap-2 px-5 py-4 text-left disabled:cursor-default"
      >
        <Users className="h-5 w-5 shrink-0 text-secondary" />
        <p className="flex-1 text-sm text-text-neutral">
          <span className="font-bold text-primary">Meus Grupos:</span>{" "}
          {groups.length === 0 ? "Nenhum" : `${groups.length} grupo${groups.length > 1 ? "s" : ""}`}
        </p>
        {groups.length > 0 && (
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-text-neutral/50 transition-transform ${open ? "rotate-180" : ""}`}
          />
        )}
      </button>

      {open && groups.length > 0 && (
        <div className="flex flex-col gap-3 border-t border-black/5 px-5 py-4">
          {groups.map((group) => (
            <div key={group.id} className="rounded-xl bg-bg-light p-4">
              <p className="font-heading font-semibold text-primary">{group.name}</p>
              <div className="mt-1.5 flex flex-col gap-1 text-sm text-text-neutral/70">
                {group.leader_name && (
                  <span className="flex items-center gap-1.5">
                    <UserRound className="h-3.5 w-3.5 shrink-0" />
                    Líder: {group.leader_name}
                  </span>
                )}
                {group.meeting_day && (
                  <span className="flex items-center gap-1.5">
                    <CalendarClock className="h-3.5 w-3.5 shrink-0" />
                    {group.meeting_day}
                  </span>
                )}
                {group.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {group.location}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
