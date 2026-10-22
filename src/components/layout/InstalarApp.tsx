"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

// O Chrome do Android dispara este evento quando o site pode ser instalado.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const CHAVE_DISPENSADO = "ibci-instalar-dispensado";

export default function InstalarApp() {
  const [evento, setEvento] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/", updateViaCache: "none" })
        .catch(() => {});
    }

    function aoPoderInstalar(e: Event) {
      e.preventDefault();
      try {
        if (localStorage.getItem(CHAVE_DISPENSADO)) return;
      } catch {}
      setEvento(e as BeforeInstallPromptEvent);
    }
    function aoInstalar() {
      setEvento(null);
    }

    window.addEventListener("beforeinstallprompt", aoPoderInstalar);
    window.addEventListener("appinstalled", aoInstalar);
    return () => {
      window.removeEventListener("beforeinstallprompt", aoPoderInstalar);
      window.removeEventListener("appinstalled", aoInstalar);
    };
  }, []);

  if (!evento) return null;

  async function instalar() {
    if (!evento) return;
    await evento.prompt();
    await evento.userChoice;
    setEvento(null);
  }

  function dispensar() {
    try {
      localStorage.setItem(CHAVE_DISPENSADO, "1");
    } catch {}
    setEvento(null);
  }

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-md items-center gap-3 rounded-xl bg-primary px-4 py-3 text-white shadow-lg">
      <Download className="h-5 w-5 shrink-0 text-secondary" aria-hidden />
      <p className="flex-1 text-sm">Instale o app da IBCI no seu celular.</p>
      <button
        type="button"
        onClick={instalar}
        className="rounded-lg bg-secondary px-3 py-1.5 text-sm font-semibold text-primary-dark"
      >
        Instalar
      </button>
      <button
        type="button"
        onClick={dispensar}
        aria-label="Agora não"
        className="shrink-0 text-white/70 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
