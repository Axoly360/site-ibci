"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

const inputClass =
  "w-full rounded-lg border border-black/10 bg-bg-light px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

export default function AddGuestStudentForm({ classId }: { classId: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/professor/alunos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId, name, phone }),
    });
    setLoading(false);
    if (res.ok) {
      setName("");
      setPhone("");
      router.refresh();
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível adicionar o aluno.");
    }
  };

  return (
    <Card className="mb-6 p-5">
      <h2 className="font-heading text-base font-semibold text-primary">
        Adicionar aluno sem cadastro
      </h2>
      <p className="mt-1 text-xs text-text-neutral/60">
        Para quem ainda não tem cadastro no site da IBCI. O aluno já entra na sua sala, sem precisar
        de aprovação.
      </p>
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          required
          minLength={2}
          maxLength={120}
          placeholder="Nome completo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
        <input
          placeholder="Telefone (opcional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={inputClass}
        />
        <Button type="submit" disabled={loading || name.trim().length < 2}>
          <UserPlus className="h-4 w-4" />
          {loading ? "Adicionando..." : "Adicionar"}
        </Button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </Card>
  );
}
