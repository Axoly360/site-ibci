"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, HandHeart } from "lucide-react";
import Button from "@/components/ui/Button";
import { MINISTRIES, MINISTRY_LINKS } from "@/lib/ministries";

export interface CongregationOption {
  id: string;
  name: string;
}

export default function VolunteerForm({
  congregations,
  initialCongregationId,
  initialMinistries,
  initialNote,
}: {
  congregations: CongregationOption[];
  initialCongregationId: string;
  initialMinistries: string[];
  initialNote: string;
}) {
  const router = useRouter();
  const [congregationId, setCongregationId] = useState(initialCongregationId);
  const [ministries, setMinistries] = useState<string[]>(initialMinistries);
  const [note, setNote] = useState(initialNote);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const toggle = (ministry: string) => {
    setMinistries((prev) =>
      prev.includes(ministry) ? prev.filter((m) => m !== ministry) : [...prev, ministry]
    );
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    setError("");
    const res = await fetch("/api/membros/servir", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ congregationId, ministries, note }),
    });
    if (res.ok) {
      setStatus("done");
      router.refresh();
      setTimeout(() => setStatus("idle"), 2500);
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível salvar.");
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-sm font-semibold text-text-neutral">
          Onde você quer servir?
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label
            className={`flex flex-1 cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
              congregationId === ""
                ? "border-primary bg-primary/5 font-semibold text-primary"
                : "border-black/10 bg-white text-text-neutral"
            }`}
          >
            <input
              type="radio"
              name="congregation"
              checked={congregationId === ""}
              onChange={() => setCongregationId("")}
              className="shrink-0"
            />
            Igreja Batista Central do Ibura (Sede)
          </label>
          {congregations.map((c) => (
            <label
              key={c.id}
              className={`flex flex-1 cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                congregationId === c.id
                  ? "border-primary bg-primary/5 font-semibold text-primary"
                  : "border-black/10 bg-white text-text-neutral"
              }`}
            >
              <input
                type="radio"
                name="congregation"
                checked={congregationId === c.id}
                onChange={() => setCongregationId(c.id)}
                className="shrink-0"
              />
              Congregação {c.name}
            </label>
          ))}
        </div>
      </div>

      <p className="text-sm font-semibold text-text-neutral">
        Em quais ministérios você já serve ou gostaria de servir?
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {MINISTRIES.map((ministry) => {
          const link = MINISTRY_LINKS[ministry];
          return (
            <div
              key={ministry}
              className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                ministries.includes(ministry)
                  ? "border-primary bg-primary/5 font-semibold text-primary"
                  : "border-black/10 bg-white text-text-neutral"
              }`}
            >
              <label className="flex flex-1 cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={ministries.includes(ministry)}
                  onChange={() => toggle(ministry)}
                  className="shrink-0"
                />
                {ministry}
              </label>
              {link && (
                <Link
                  href={link}
                  target="_blank"
                  className="shrink-0 text-xs font-semibold text-secondary hover:underline"
                >
                  Conhecer
                </Link>
              )}
            </div>
          );
        })}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-text-neutral">
          Quer contar mais alguma coisa? (opcional)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className="w-full resize-none rounded-lg border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={status === "loading"}>
          <HandHeart className="h-4 w-4" />
          {status === "loading" ? "Salvando..." : "Salvar"}
        </Button>
        {status === "done" && (
          <span className="flex items-center gap-1.5 text-sm font-semibold text-primary">
            <CheckCircle2 className="h-4 w-4" />
            Salvo
          </span>
        )}
        {status === "error" && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </form>
  );
}
