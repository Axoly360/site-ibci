"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyPixKeyProps {
  pixKey: string;
}

export default function CopyPixKey({ pixKey }: CopyPixKeyProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pixKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-secondary px-6 py-3 font-bold text-primary shadow-sm transition-all duration-200 hover:bg-secondary-light"
    >
      {copied ? (
        <>
          <Check className="h-5 w-5" />
          <span>Chave PIX Copiada!</span>
        </>
      ) : (
        <>
          <Copy className="h-5 w-5" />
          <span>Copiar Chave PIX</span>
        </>
      )}
    </button>
  );
}
