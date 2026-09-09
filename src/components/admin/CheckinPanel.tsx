"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Send, XCircle } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

type Feedback =
  | { kind: "ok"; name: string }
  | { kind: "already"; name: string; checkedInAt: string }
  | { kind: "error"; message: string }
  | null;

export default function CheckinPanel({ eventSlug }: { eventSlug: string }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [counts, setCounts] = useState<{ total: number; checkins: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadCounts = async () => {
    const res = await fetch(`/api/admin/eventos/${eventSlug}/contagem`);
    if (res.ok) setCounts(await res.json());
  };

  useEffect(() => {
    loadCounts();
    const interval = setInterval(loadCounts, 8000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleValidate = async (rawCode: string) => {
    const value = rawCode.trim();
    if (!value) return;

    setLoading(true);
    setFeedback(null);
    const res = await fetch(`/api/admin/eventos/${eventSlug}/checkin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: value }),
    });
    const data = await res.json().catch(() => null);
    setLoading(false);
    setCode("");
    inputRef.current?.focus();

    if (!res.ok) {
      setFeedback({ kind: "error", message: data?.error ?? "Código não encontrado." });
      return;
    }
    if (data.status === "already") {
      const time = new Date(data.checkedInAt).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      setFeedback({ kind: "already", name: data.name, checkedInAt: time });
    } else {
      setFeedback({ kind: "ok", name: data.name });
    }
    loadCounts();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-6 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-neutral/50">
            Inscritos
          </span>
          <p className="mt-2 font-heading text-4xl font-bold text-primary">
            {counts?.total ?? "—"}
          </p>
        </Card>
        <Card className="p-6 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-neutral/50">
            Check-ins
          </span>
          <p className="mt-2 font-heading text-4xl font-bold text-secondary">
            {counts?.checkins ?? "—"}
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="mb-1 font-heading text-lg font-semibold text-primary">
          Validar código
        </h2>
        <p className="mb-4 text-sm text-text-neutral/60">
          Digite o código do participante (fallback manual) e confirme.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleValidate(code);
          }}
          className="flex flex-wrap gap-3"
        >
          <input
            ref={inputRef}
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Ex.: 7K2QMX"
            autoFocus
            className="flex-1 rounded-lg border border-black/10 px-4 py-3 text-center font-mono text-xl font-bold tracking-widest uppercase"
          />
          <Button type="submit" disabled={loading}>
            <Send className="h-5 w-5" />
            {loading ? "Validando..." : "Confirmar"}
          </Button>
        </form>

        {feedback?.kind === "ok" && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-3 font-semibold text-primary">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            Check-in confirmado: {feedback.name}
          </div>
        )}
        {feedback?.kind === "already" && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-secondary/10 px-4 py-3 font-semibold text-secondary">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            {feedback.name} já fez check-in às {feedback.checkedInAt}
          </div>
        )}
        {feedback?.kind === "error" && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 font-semibold text-red-700">
            <XCircle className="h-5 w-5 shrink-0" />
            {feedback.message}
          </div>
        )}
      </Card>
    </div>
  );
}
