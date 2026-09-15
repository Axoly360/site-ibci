"use client";

import { useState } from "react";
import { CheckCircle2, Save } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface ConsentTermFormProps {
  titleKey: string;
  bodyKey: string;
  initialTitle: string;
  initialBody: string;
}

export default function ConsentTermForm({
  titleKey,
  bodyKey,
  initialTitle,
  initialBody,
}: ConsentTermFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const handleSave = async () => {
    setStatus("loading");
    const [res1, res2] = await Promise.all([
      fetch("/api/admin/conteudo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: titleKey, value: title, path: "/central-do-membro/consentimento" }),
      }),
      fetch("/api/admin/conteudo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: bodyKey, value: body, path: "/central-do-membro/consentimento" }),
      }),
    ]);
    setStatus(res1.ok && res2.ok ? "done" : "error");
    if (res1.ok && res2.ok) setTimeout(() => setStatus("idle"), 2500);
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-text-neutral">
            Título do termo
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-text-neutral">
            Texto completo do termo
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={8}
            placeholder="Cole aqui o texto oficial do termo, revisado pela diretoria/assessoria jurídica."
            className="w-full resize-y rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleSave} size="sm" disabled={status === "loading"}>
            <Save className="h-4 w-4" />
            {status === "loading" ? "Salvando..." : "Salvar"}
          </Button>
          {status === "done" && (
            <span className="flex items-center gap-1.5 text-sm font-semibold text-primary">
              <CheckCircle2 className="h-4 w-4" />
              Salvo — já está no ar
            </span>
          )}
          {status === "error" && (
            <span className="text-sm text-red-600">Não foi possível salvar.</span>
          )}
        </div>
      </div>
    </Card>
  );
}
