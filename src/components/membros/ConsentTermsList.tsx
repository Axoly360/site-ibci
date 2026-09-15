"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export interface ConsentTermView {
  key: string;
  title: string;
  body: string;
  acceptedAt: string | null;
}

export default function ConsentTermsList({ terms }: { terms: ConsentTermView[] }) {
  return (
    <div className="flex flex-col gap-6">
      {terms.map((term) => (
        <TermCard key={term.key} term={term} />
      ))}
    </div>
  );
}

function TermCard({ term }: { term: ConsentTermView }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    const res = await fetch("/api/membros/consentimento", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ termKey: term.key }),
    });
    setLoading(false);
    if (res.ok) router.refresh();
  };

  const handleRevoke = async () => {
    if (!confirm("Revogar seu aceite deste termo?")) return;
    setLoading(true);
    const res = await fetch("/api/membros/consentimento", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ termKey: term.key }),
    });
    setLoading(false);
    if (res.ok) router.refresh();
  };

  return (
    <Card className="flex flex-col gap-4 p-6">
      <h2 className="font-heading text-lg font-semibold text-primary">{term.title}</h2>
      {term.body ? (
        <div className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg bg-bg-light p-4 text-sm leading-relaxed text-text-neutral/80">
          {term.body}
        </div>
      ) : (
        <p className="text-sm text-text-neutral/50">
          O texto deste termo ainda não foi cadastrado pela secretaria.
        </p>
      )}

      {term.acceptedAt ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-primary">
            <CheckCircle2 className="h-4 w-4" />
            Aceito em {new Date(term.acceptedAt).toLocaleDateString("pt-BR")}
          </span>
          <button
            type="button"
            onClick={handleRevoke}
            disabled={loading}
            className="text-sm font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
          >
            Revogar aceite
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <label className="flex items-start gap-2 text-sm text-text-neutral/80">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="mt-1"
            />
            Li e concordo com este termo.
          </label>
          <Button
            onClick={handleAccept}
            size="sm"
            disabled={!checked || loading || !term.body}
          >
            <ShieldCheck className="h-4 w-4" />
            {loading ? "Salvando..." : "Confirmar aceite"}
          </Button>
        </div>
      )}
    </Card>
  );
}
