"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, CheckCircle2, Clock, MapPin, UserPlus, UserRound } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export interface GroupToJoin {
  id: string;
  name: string;
  leader_name: string | null;
  meeting_day: string | null;
  location: string | null;
  description: string | null;
  status: "membro" | "pendente" | "recusado" | null;
}

export default function GroupJoinList({ groups }: { groups: GroupToJoin[] }) {
  return (
    <div className="flex flex-col gap-4">
      {groups.length === 0 ? (
        <p className="text-sm text-text-neutral/60">
          Nenhum grupo cadastrado pela igreja ainda.
        </p>
      ) : (
        groups.map((group) => <GroupCard key={group.id} group={group} />)
      )}
    </div>
  );
}

function GroupCard({ group }: { group: GroupToJoin }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRequest = async () => {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/membros/grupos/${group.id}/solicitar`, { method: "POST" });
    setLoading(false);
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível enviar a solicitação.");
    }
  };

  return (
    <Card className="flex flex-col gap-3 p-6">
      <h2 className="font-heading text-lg font-semibold text-primary">{group.name}</h2>
      <div className="flex flex-col gap-1 text-sm text-text-neutral/70">
        {group.leader_name && (
          <span className="flex items-center gap-1.5">
            <UserRound className="h-4 w-4 shrink-0" />
            Líder: {group.leader_name}
          </span>
        )}
        {group.meeting_day && (
          <span className="flex items-center gap-1.5">
            <CalendarClock className="h-4 w-4 shrink-0" />
            {group.meeting_day}
          </span>
        )}
        {group.location && (
          <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 shrink-0" />
            {group.location}
          </span>
        )}
      </div>
      {group.description && (
        <p className="text-sm text-text-neutral/80">{group.description}</p>
      )}

      {group.status === "membro" ? (
        <span className="flex items-center gap-1.5 text-sm font-semibold text-primary">
          <CheckCircle2 className="h-4 w-4" />
          Você já faz parte deste grupo
        </span>
      ) : group.status === "pendente" ? (
        <span className="flex items-center gap-1.5 text-sm font-semibold text-secondary">
          <Clock className="h-4 w-4" />
          Solicitação enviada — aguardando aprovação
        </span>
      ) : (
        <div>
          <Button onClick={handleRequest} size="sm" disabled={loading}>
            <UserPlus className="h-4 w-4" />
            {loading ? "Enviando..." : "Solicitar entrada"}
          </Button>
          {group.status === "recusado" && (
            <p className="mt-1.5 text-xs text-text-neutral/50">
              Sua solicitação anterior não foi aprovada. Você pode tentar novamente.
            </p>
          )}
          {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
        </div>
      )}
    </Card>
  );
}
