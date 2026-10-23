"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Trash2, X } from "lucide-react";
import Card from "@/components/ui/Card";

export interface TeacherRow {
  memberId: string;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  classes: string[];
}

export default function TeacherManager({
  requests,
  teachers,
}: {
  requests: TeacherRow[];
  teachers: TeacherRow[];
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  const setStatus = async (row: TeacherRow, status: "ativo" | "afastado") => {
    setBusyId(row.memberId);
    const res = await fetch(`/api/admin/professores/${row.memberId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusyId(null);
    if (res.ok) router.refresh();
  };

  const remove = async (row: TeacherRow, label: string) => {
    if (!confirm(`${label} ${row.name}?`)) return;
    setBusyId(row.memberId);
    const res = await fetch(`/api/admin/professores/${row.memberId}`, { method: "DELETE" });
    setBusyId(null);
    if (res.ok) router.refresh();
  };

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="mb-3 font-heading text-lg font-semibold text-primary">
          Solicitações ({requests.length})
        </h2>
        {requests.length === 0 ? (
          <p className="text-sm text-text-neutral/60">Nenhuma solicitação pendente.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {requests.map((r) => (
              <Card key={r.memberId} className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div>
                  <p className="font-semibold text-text-neutral">{r.name}</p>
                  <p className="text-sm text-text-neutral/60">
                    {[r.email, r.phone].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <button
                    type="button"
                    disabled={busyId === r.memberId}
                    onClick={() => setStatus(r, "ativo")}
                    className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Aprovar
                  </button>
                  <button
                    type="button"
                    disabled={busyId === r.memberId}
                    onClick={() => remove(r, "Recusar a solicitação de")}
                    className="flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                    Recusar
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-heading text-lg font-semibold text-primary">
          Professores ({teachers.length})
        </h2>
        {teachers.length === 0 ? (
          <p className="text-sm text-text-neutral/60">Nenhum professor aprovado ainda.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {teachers.map((t) => (
              <Card key={t.memberId} className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div>
                  <p className="font-semibold text-text-neutral">
                    {t.name}{" "}
                    <span className="text-xs font-semibold text-primary">
                      {t.status === "ativo" ? "Ativo" : "Afastado"}
                    </span>
                  </p>
                  <p className="text-sm text-text-neutral/60">
                    {[t.email, t.phone].filter(Boolean).join(" · ")}
                  </p>
                  <p className="mt-1 text-xs text-text-neutral/70">
                    {t.classes.length > 0
                      ? `Salas: ${t.classes.join(", ")}`
                      : "Sem sala atribuída (atribua em Admin → EBD)"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <button
                    type="button"
                    disabled={busyId === t.memberId}
                    onClick={() => setStatus(t, t.status === "ativo" ? "afastado" : "ativo")}
                    className="text-sm font-semibold text-primary hover:text-primary-dark disabled:opacity-50"
                  >
                    {t.status === "ativo" ? "Afastar" : "Reativar"}
                  </button>
                  <button
                    type="button"
                    disabled={busyId === t.memberId}
                    onClick={() => remove(t, "Remover o professor")}
                    className="flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remover
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
