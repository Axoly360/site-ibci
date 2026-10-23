"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, CheckCircle2, Clock, MapPin, UserPlus } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export interface OrgEvent {
  id: string;
  title: string;
  event_date: string;
  event_time: string | null;
  location: string | null;
  description: string | null;
}

export interface OrgView {
  id: string;
  name: string;
  short_name: string;
  status: "ativo" | "pendente" | null;
  events: OrgEvent[];
}

function br(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export default function OrganizationList({ orgs }: { orgs: OrgView[] }) {
  if (orgs.length === 0) {
    return <p className="text-sm text-text-neutral/60">Nenhuma organização cadastrada ainda.</p>;
  }
  return (
    <div className="flex flex-col gap-4">
      {orgs.map((org) => (
        <OrgCard key={org.id} org={org} />
      ))}
    </div>
  );
}

function OrgCard({ org }: { org: OrgView }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const call = async (method: "POST" | "DELETE") => {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/membros/organizacoes/${org.id}/participar`, { method });
    setLoading(false);
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível concluir.");
    }
  };

  return (
    <Card className="flex flex-col gap-3 p-6">
      <h2 className="font-heading text-lg font-semibold text-primary">
        {org.short_name} <span className="text-sm font-normal text-text-neutral/60">— {org.name}</span>
      </h2>

      {org.status === "ativo" ? (
        <>
          <span className="flex items-center gap-1.5 text-sm font-semibold text-primary">
            <CheckCircle2 className="h-4 w-4" />
            Você participa desta organização
          </span>

          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-text-neutral/50">
              Próximos compromissos
            </p>
            {org.events.length === 0 ? (
              <p className="text-sm text-text-neutral/60">Nenhum compromisso na agenda.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {org.events.map((e) => (
                  <li key={e.id} className="rounded-xl bg-bg-light p-3 text-sm">
                    <p className="font-semibold text-text-neutral">{e.title}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-text-neutral/70">
                      <span className="flex items-center gap-1">
                        <CalendarClock className="h-3.5 w-3.5" />
                        {br(e.event_date)}
                        {e.event_time ? ` · ${e.event_time}` : ""}
                      </span>
                      {e.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {e.location}
                        </span>
                      )}
                    </p>
                    {e.description && <p className="mt-1 text-text-neutral/80">{e.description}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={() => {
              if (confirm(`Sair de ${org.short_name}?`)) call("DELETE");
            }}
            className="w-fit text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
          >
            Sair da organização
          </button>
        </>
      ) : org.status === "pendente" ? (
        <span className="flex items-center gap-1.5 text-sm font-semibold text-secondary">
          <Clock className="h-4 w-4" />
          Pedido enviado — aguardando a diretoria
        </span>
      ) : (
        <div>
          <Button size="sm" onClick={() => call("POST")} disabled={loading}>
            <UserPlus className="h-4 w-4" />
            {loading ? "Enviando..." : "Quero participar"}
          </Button>
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </Card>
  );
}
