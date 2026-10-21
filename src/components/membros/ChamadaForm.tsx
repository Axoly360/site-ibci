"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Save } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export interface ChamadaStudent {
  enrollmentId: string;
  name: string;
  kind: string;
  parentName: string | null;
  isGuest: boolean;
}

export default function ChamadaForm({
  classId,
  date,
  students,
  initialPresent,
}: {
  classId: string;
  date: string;
  students: ChamadaStudent[];
  initialPresent: string[];
}) {
  const router = useRouter();
  const [present, setPresent] = useState<Set<string>>(new Set(initialPresent));
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const toggle = (id: string) =>
    setPresent((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const handleRemoveGuest = async (student: ChamadaStudent) => {
    if (!confirm(`Remover ${student.name} desta sala?`)) return;
    const res = await fetch(`/api/professor/alunos/${student.enrollmentId}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  };

  const handleSave = async () => {
    setStatus("loading");
    setError("");
    const res = await fetch("/api/professor/chamada", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId, date, presentIds: Array.from(present) }),
    });
    if (res.ok) {
      setStatus("done");
      router.refresh();
      setTimeout(() => setStatus("idle"), 2500);
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível salvar a chamada.");
      setStatus("error");
    }
  };

  if (students.length === 0) {
    return (
      <p className="text-sm text-text-neutral/60">
        Esta sala ainda não tem alunos. Adicione acima quem não tem cadastro; quem tem cadastro
        pede a sala em Ensino, e a Secretaria aprova.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <p className="font-semibold text-primary">
          {present.size} de {students.length} presentes
        </p>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setPresent(new Set(students.map((s) => s.enrollmentId)))}
            className="font-semibold text-secondary hover:underline"
          >
            Marcar todos
          </button>
          <button
            type="button"
            onClick={() => setPresent(new Set())}
            className="font-semibold text-text-neutral/60 hover:underline"
          >
            Limpar
          </button>
        </div>
      </div>

      <Card className="divide-y divide-black/5 p-0">
        {students.map((s) => (
          <label
            key={s.enrollmentId}
            className="flex cursor-pointer items-center gap-3 px-5 py-3.5 hover:bg-bg-light"
          >
            <input
              type="checkbox"
              checked={present.has(s.enrollmentId)}
              onChange={() => toggle(s.enrollmentId)}
              className="h-5 w-5 shrink-0"
            />
            <span className="flex-1">
              <span className="block font-semibold text-text-neutral">{s.name}</span>
              <span className="block text-xs text-text-neutral/60">
                {s.kind}
                {s.parentName ? ` · filho(a) de ${s.parentName}` : ""}
              </span>
            </span>
            {s.isGuest && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleRemoveGuest(s);
                }}
                className="shrink-0 text-xs font-semibold text-red-600 hover:underline"
              >
                Remover
              </button>
            )}
          </label>
        ))}
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={status === "loading"}>
          <Save className="h-5 w-5" />
          {status === "loading" ? "Salvando..." : "Salvar chamada"}
        </Button>
        {status === "done" && (
          <span className="flex items-center gap-1.5 text-sm font-semibold text-primary">
            <CheckCircle2 className="h-4 w-4" />
            Chamada salva
          </span>
        )}
        {status === "error" && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </div>
  );
}
