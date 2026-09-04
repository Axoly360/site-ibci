"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { CheckCircle2, Send } from "lucide-react";
import Button from "@/components/ui/Button";

const initial = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone: "",
  cpf: "",
  birthdate: "",
  address: "",
  timeAtChurch: "",
  note: "",
};

export default function MembershipRequestForm() {
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const set = (field: keyof typeof initial) => (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("As senhas não são iguais.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setError("");
    const res = await fetch("/api/membros/solicitar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setStatus("done");
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível enviar o cadastro.");
      setStatus("error");
    }
  };

  if (status === "done") {
    return (
      <p className="flex items-center justify-center gap-2 rounded-2xl bg-primary/10 p-6 text-center font-semibold text-primary">
        <CheckCircle2 className="h-5 w-5 shrink-0" />
        Cadastro enviado! A diretoria vai analisar e você será avisado(a) quando for
        validado(a).
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-xl flex-col gap-3">
      <input
        required
        placeholder="Nome completo"
        value={form.name}
        onChange={set("name")}
        className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      <input
        required
        type="email"
        placeholder="E-mail"
        value={form.email}
        onChange={set("email")}
        className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          required
          type="password"
          minLength={6}
          placeholder="Crie uma senha"
          value={form.password}
          onChange={set("password")}
          className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <input
          required
          type="password"
          minLength={6}
          placeholder="Confirme a senha"
          value={form.confirmPassword}
          onChange={set("confirmPassword")}
          className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          placeholder="Telefone / WhatsApp"
          value={form.phone}
          onChange={set("phone")}
          className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <input
          placeholder="CPF"
          value={form.cpf}
          onChange={set("cpf")}
          className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          placeholder="Data de nascimento"
          value={form.birthdate}
          onChange={set("birthdate")}
          className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <input
          placeholder="Há quanto tempo frequenta a IBCI"
          value={form.timeAtChurch}
          onChange={set("timeAtChurch")}
          className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <input
        placeholder="Endereço"
        value={form.address}
        onChange={set("address")}
        className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      <textarea
        placeholder="Quer contar mais alguma coisa? (opcional)"
        value={form.note}
        onChange={set("note")}
        rows={3}
        className="w-full resize-none rounded-lg border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      <Button type="submit" disabled={status === "loading"}>
        <Send className="h-5 w-5" />
        {status === "loading" ? "Enviando..." : "Enviar cadastro"}
      </Button>
      {status === "error" && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-xs text-text-neutral/60">
        Seu cadastro passa pela validação da diretoria antes de virar membro.
      </p>
    </form>
  );
}
