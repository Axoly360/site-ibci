"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import Button from "@/components/ui/Button";

export interface DocumentTab {
  key: string;
  label: string;
  url: string | null;
}

export default function DocumentViewer({ tabs }: { tabs: DocumentTab[] }) {
  const [activeKey, setActiveKey] = useState(tabs[0]?.key);
  const active = tabs.find((t) => t.key === activeKey);

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveKey(tab.key)}
            className={`rounded-full px-5 py-2 text-sm font-bold transition-colors ${
              activeKey === tab.key
                ? "bg-primary text-white"
                : "bg-white text-text-neutral/70 hover:bg-black/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {active?.url ? (
          <div className="flex flex-col items-center gap-4">
            <p className="text-center text-sm text-text-neutral/60">
              Se o documento não carregar, utilize o botão para baixar.
            </p>
            <iframe
              src={active.url}
              title={active.label}
              className="h-[75vh] w-full rounded-2xl border border-black/10 bg-white"
            />
            <Button href={active.url} external variant="primary" size="md">
              <FileText className="h-4 w-4" />
              Baixar {active.label}
            </Button>
          </div>
        ) : (
          <div className="mx-auto flex max-w-md flex-col items-center gap-2 rounded-2xl border border-dashed border-primary/20 bg-white p-10 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <FileText className="h-6 w-6" />
            </span>
            <p className="font-heading text-lg font-semibold text-primary">Em breve</p>
            <p className="text-sm text-text-neutral/60">
              O documento de {active?.label} ainda não foi publicado.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
