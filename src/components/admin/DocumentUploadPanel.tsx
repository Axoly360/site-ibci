"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Send } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function DocumentUploadPanel({
  docType,
  label,
  currentUrl,
}: {
  docType: "estatuto" | "regimento";
  label: string;
  currentUrl: string | null;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleUpload = async () => {
    const file = inputRef.current?.files?.[0];
    setError("");
    setDone(false);
    if (!file) {
      setError("Escolha um arquivo PDF antes de enviar.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("docType", docType);

    const res = await fetch("/api/admin/documentos", { method: "POST", body: formData });
    setLoading(false);
    if (res.ok) {
      if (inputRef.current) inputRef.current.value = "";
      setDone(true);
      router.refresh();
      setTimeout(() => setDone(false), 3000);
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? `Não foi possível enviar o arquivo (${res.status}).`);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="font-heading text-lg font-semibold text-primary">{label}</h2>
      <p className="mt-1 text-sm text-text-neutral/60">
        Envie o PDF oficial — substitui o documento atual quando houver.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {currentUrl && (
          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-secondary hover:underline"
          >
            Ver documento atual
          </a>
        )}
        <input ref={inputRef} type="file" accept="application/pdf" className="text-sm" />
        <Button onClick={handleUpload} size="sm" disabled={loading}>
          <Send className="h-4 w-4" />
          {loading ? "Enviando..." : "Enviar PDF"}
        </Button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {done && (
        <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-primary">
          <CheckCircle2 className="h-4 w-4" />
          Documento atualizado
        </p>
      )}
    </Card>
  );
}
