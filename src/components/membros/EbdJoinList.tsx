"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, CheckCircle2, Clock, MapPin, UserPlus, UserRound } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export interface EbdToJoin {
  id: string;
  name: string;
  teacher_name: string | null;
  audience: string | null;
  meeting_time: string | null;
  location: string | null;
  description: string | null;
  status: "membro" | "pendente" | "recusado" | null;
}

export default function EbdJoinList({ classes }: { classes: EbdToJoin[] }) {
  return (
    <div className="flex flex-col gap-4">
      {classes.length === 0 ? (
        <p className="text-sm text-text-neutral/60">
          Nenhuma sala da EBD cadastrada pela igreja ainda.
        </p>
      ) : (
        classes.map((c) => <EbdCard key={c.id} item={c} />)
      )}
    </div>
  );
}

function EbdCard({ item }: { item: EbdToJoin }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRequest = async () => {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/membros/ebd/${item.id}/solicitar`, { method: "POST" });
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
      <h2 className="font-heading text-lg font-semibold text-primary">
        {item.name}
        {item.audience && (
          <span className="ml-2 rounded-full bg-primary/10 px-2.5 py-0.5 align-middle text-xs font-semibold text-primary">
            {item.audience}
          </span>
        )}
      </h2>
      <div className="flex flex-col gap-1 text-sm text-text-neutral/70">
        {item.teacher_name && (
          <span className="flex items-center gap-1.5">
            <UserRound className="h-4 w-4 shrink-0" />
            Professor(a): {item.teacher_name}
          </span>
        )}
        {item.meeting_time && (
          <span className="flex items-center gap-1.5">
            <CalendarClock className="h-4 w-4 shrink-0" />
            {item.meeting_time}
          </span>
        )}
        {item.location && (
          <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 shrink-0" />
            {item.location}
          </span>
        )}
      </div>
      {item.description && <p className="text-sm text-text-neutral/80">{item.description}</p>}

      {item.status === "membro" ? (
        <span className="flex items-center gap-1.5 text-sm font-semibold text-primary">
          <CheckCircle2 className="h-4 w-4" />
          Você faz parte desta sala
        </span>
      ) : item.status === "pendente" ? (
        <span className="flex items-center gap-1.5 text-sm font-semibold text-secondary">
          <Clock className="h-4 w-4" />
          Solicitação enviada — aguardando aprovação
        </span>
      ) : (
        <div>
          <Button onClick={handleRequest} size="sm" disabled={loading}>
            <UserPlus className="h-4 w-4" />
            {loading ? "Enviando..." : "Esta é a minha sala"}
          </Button>
          {item.status === "recusado" && (
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
