"use client";

import { useState } from "react";
import { CheckCircle2, Save } from "lucide-react";
import Button from "@/components/ui/Button";

interface ContentEditFormProps {
  contentKey: string;
  label: string;
  initialValue: string;
  path: string;
}

export default function ContentEditForm({
  contentKey,
  label,
  initialValue,
  path,
}: ContentEditFormProps) {
  const [value, setValue] = useState(initialValue);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const handleSave = async () => {
    setStatus("loading");
    const res = await fetch("/api/admin/conteudo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: contentKey, value, path }),
    });
    setStatus(res.ok ? "done" : "error");
    if (res.ok) setTimeout(() => setStatus("idle"), 2500);
  };

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-6">
      <label className="mb-1.5 block text-sm font-semibold text-text-neutral">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={3}
        className="w-full resize-none rounded-lg border border-black/10 bg-bg-light px-4 py-3 text-sm text-text-neutral outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      <div className="mt-4 flex items-center gap-3">
        <Button onClick={handleSave} disabled={status === "loading"} size="sm">
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
  );
}
