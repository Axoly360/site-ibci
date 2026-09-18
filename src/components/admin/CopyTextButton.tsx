"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function CopyTextButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Sem permissão de clipboard (ex.: contexto não seguro) — o texto já
      // fica visível na tela pra copiar manualmente.
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-xs font-semibold text-text-neutral hover:bg-black/5"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copiado!" : "Copiar texto"}
    </button>
  );
}
