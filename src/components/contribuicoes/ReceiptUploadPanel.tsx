"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, FileText, Send } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface Receipt {
  id: string;
  file_name: string;
  file_url: string;
  created_at: string;
}

export default function ReceiptUploadPanel() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [receipts, setReceipts] = useState<Receipt[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const loadReceipts = () => {
    fetch("/api/membros/comprovantes")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setReceipts(data?.receipts ?? []))
      .catch(() => setReceipts([]));
  };

  useEffect(() => {
    loadReceipts();
  }, []);

  const handleUpload = async () => {
    const file = inputRef.current?.files?.[0];
    setError("");
    setDone(false);
    if (!file) {
      setError("Escolha um arquivo antes de enviar.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/membros/comprovantes", { method: "POST", body: formData });
    setLoading(false);
    if (res.ok) {
      if (inputRef.current) inputRef.current.value = "";
      setDone(true);
      loadReceipts();
      setTimeout(() => setDone(false), 3000);
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? `Não foi possível enviar o arquivo (${res.status}).`);
    }
  };

  return (
    <Card className="space-y-4 p-6">
      <div>
        <h3 className="font-heading text-lg font-bold text-primary">
          Enviar Comprovante
        </h3>
        <p className="mt-1 text-sm text-text-neutral/70">
          Já é membro validado? Envie o comprovante da sua contribuição em
          PDF, PNG ou JPEG.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,image/png,image/jpeg"
          className="text-sm text-white"
        />
        <Button onClick={handleUpload} size="sm" disabled={loading}>
          <Send className="h-4 w-4" />
          {loading ? "Enviando..." : "Enviar comprovante"}
        </Button>
      </div>
      {error && <p className="text-sm text-red-200">{error}</p>}
      {done && (
        <p className="flex items-center gap-1.5 text-sm font-semibold text-secondary">
          <CheckCircle2 className="h-4 w-4" />
          Comprovante enviado com sucesso
        </p>
      )}

      {receipts && receipts.length > 0 && (
        <div className="space-y-2 border-t border-white/20 pt-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-white/70">
            Seus comprovantes enviados
          </span>
          <ul className="space-y-1.5">
            {receipts.map((receipt) => (
              <li key={receipt.id}>
                <a
                  href={receipt.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-secondary hover:underline"
                >
                  <FileText className="h-4 w-4 shrink-0" />
                  {receipt.file_name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
