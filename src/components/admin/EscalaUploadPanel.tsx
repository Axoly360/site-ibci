"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function EscalaUploadPanel({ currentUrl }: { currentUrl: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async () => {
    const file = inputRef.current?.files?.[0];
    if (!file) return;

    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/admin/escala", { method: "POST", body: formData });
    setLoading(false);
    if (res.ok) {
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível enviar o arquivo.");
    }
  };

  return (
    <Card className="p-6">
      <h2 className="font-heading text-lg font-semibold text-primary">
        Escala de Serviços
      </h2>
      <p className="mt-1 text-sm text-text-neutral/60">
        Visível só para membros marcados como liderança. Envie uma nova imagem
        para substituir a escala atual.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <a
          href={currentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-secondary hover:underline"
        >
          Ver escala atual
        </a>
        <input ref={inputRef} type="file" accept="image/*,application/pdf" className="text-sm" />
        <Button onClick={handleUpload} size="sm" disabled={loading}>
          <Send className="h-4 w-4" />
          {loading ? "Enviando..." : "Substituir escala"}
        </Button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </Card>
  );
}
