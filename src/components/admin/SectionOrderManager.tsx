"use client";

import { useRouter } from "next/navigation";
import { ArrowUp, ArrowDown } from "lucide-react";
import SectionTextForm from "@/components/admin/SectionTextForm";
import type { HomeSectionKey } from "@/lib/homeSections";

export interface OrderedSection {
  key: HomeSectionKey;
  label: string;
  titleKey: string;
  subtitleKey: string;
  initialTitle: string;
  initialSubtitle: string;
}

export default function SectionOrderManager({ sections }: { sections: OrderedSection[] }) {
  const router = useRouter();

  const move = async (key: HomeSectionKey, direction: "up" | "down") => {
    await fetch("/api/admin/textos/ordem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, direction }),
    });
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-6">
      {sections.map((section, index) => (
        <div key={section.key} className="relative">
          <div className="absolute right-6 top-6 flex gap-1">
            <button
              type="button"
              onClick={() => move(section.key, "up")}
              disabled={index === 0}
              aria-label="Mover seção para cima"
              className="rounded-lg p-2 text-text-neutral/50 hover:bg-black/5 hover:text-primary disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => move(section.key, "down")}
              disabled={index === sections.length - 1}
              aria-label="Mover seção para baixo"
              className="rounded-lg p-2 text-text-neutral/50 hover:bg-black/5 hover:text-primary disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ArrowDown className="h-4 w-4" />
            </button>
          </div>
          <SectionTextForm
            label={section.label}
            titleKey={section.titleKey}
            subtitleKey={section.subtitleKey}
            initialTitle={section.initialTitle}
            initialSubtitle={section.initialSubtitle}
          />
        </div>
      ))}
    </div>
  );
}
