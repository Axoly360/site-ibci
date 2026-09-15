"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, HandHeart } from "lucide-react";
import Button from "@/components/ui/Button";
import { MINISTRIES } from "@/lib/ministries";

export default function VolunteerForm({
  initialMinistries,
  initialNote,
}: {
  initialMinistries: string[];
  initialNote: string;
}) {
  const router = useRouter();
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
      body: JSON.stringify({ ministries, note }),
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
      <p className="text-sm font-semibold text-text-neutral">
        Em quais ministérios você já serve ou gostaria de servir?
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {MINISTRIES.map((ministry) => (
          <label
            key={ministry}
            className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
              ministries.includes(ministry)
                ? "border-primary bg-primary/5 font-semibold text-primary"
                : "border-black/10 bg-white text-text-neutral"
            }`}
          >
            <input
              type="checkbox"
              checked={ministries.includes(ministry)}
              onChange={() => toggle(ministry)}
              className="shrink-0"
            />
            {ministry}
          </label>
        ))}
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
