"use client";

import { useState } from "react";
import { CheckCircle2, Save } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface SectionTextFormProps {
  label: string;
  titleKey: string;
  subtitleKey: string;
  initialTitle: string;
  initialSubtitle: string;
}

export default function SectionTextForm({
  label,
  titleKey,
  subtitleKey,
  initialTitle,
  initialSubtitle,
}: SectionTextFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [subtitle, setSubtitle] = useState(initialSubtitle);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const handleSave = async () => {
    setStatus("loading");
    const [res1, res2] = await Promise.all([
      fetch("/api/admin/conteudo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: titleKey, value: title, path: "/" }),
      }),
      fetch("/api/admin/conteudo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: subtitleKey, value: subtitle, path: "/" }),
      }),
    ]);
    setStatus(res1.ok && res2.ok ? "done" : "error");
    if (res1.ok && res2.ok) setTimeout(() => setStatus("idle"), 2500);
  };

  return (
    <Card className="p-6">
      <h3 className="font-heading text-lg font-semibold text-primary">{label}</h3>
      <div className="mt-4 flex flex-col gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-text-neutral">
            Título
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-text-neutral">
            Subtítulo
          </label>
          <textarea
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            rows={2}
            className="w-full resize-none rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
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
