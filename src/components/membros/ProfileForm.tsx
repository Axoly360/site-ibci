"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Camera, CheckCircle2, Save, UserRound } from "lucide-react";
import Button from "@/components/ui/Button";
import { formatCPF, formatDateBR } from "@/lib/masks";

export interface ProfileData {
  name: string;
  email: string;
  phone: string | null;
  cpf: string | null;
  birthdate: string | null;
  address: string | null;
  time_at_church: string | null;
  baptism_date: string | null;
  arrival_date: string | null;
  photo_url: string | null;
}

export default function ProfileForm({ profile }: { profile: ProfileData }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoUrl, setPhotoUrl] = useState(profile.photo_url);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [form, setForm] = useState({
    name: profile.name,
    phone: profile.phone ?? "",
    cpf: profile.cpf ?? "",
    birthdate: profile.birthdate ?? "",
    address: profile.address ?? "",
    timeAtChurch: profile.time_at_church ?? "",
    baptismDate: profile.baptism_date ?? "",
    arrivalDate: profile.arrival_date ?? "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const set = (field: keyof typeof form) => (
    e: ChangeEvent<HTMLInputElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const setMasked = (field: "cpf" | "birthdate" | "baptismDate" | "arrivalDate", mask: (v: string) => string) =>
    (e: ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: mask(e.target.value) }));

  const handlePhotoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/membros/perfil/foto", { method: "POST", body: formData });
    setPhotoUploading(false);
    if (res.ok) {
      const data = await res.json();
      setPhotoUrl(data.url);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    setError("");
    const res = await fetch("/api/membros/perfil", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
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
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-xl flex-col gap-4">
      <div className="flex flex-col items-center gap-3">
        <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-white bg-primary/10 shadow-sm">
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={profile.name}
              fill
              unoptimized={photoUrl.startsWith("http")}
              className="object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-primary/40">
              <UserRound className="h-12 w-12" />
            </span>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={photoUploading}
          className="flex items-center gap-1.5 text-sm font-semibold text-secondary hover:underline disabled:opacity-50"
        >
          <Camera className="h-4 w-4" />
          {photoUploading ? "Enviando..." : "Trocar foto"}
        </button>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-text-neutral">
          Nome completo
        </label>
        <input
          required
          value={form.name}
          onChange={set("name")}
          className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-text-neutral">
          E-mail
        </label>
        <input
          disabled
          value={profile.email}
          className="w-full rounded-lg border border-black/10 bg-black/5 px-4 py-3 text-sm text-text-neutral/60"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-text-neutral">
            Telefone / WhatsApp
          </label>
          <input
            value={form.phone}
            onChange={set("phone")}
            className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-text-neutral">CPF</label>
          <input
            inputMode="numeric"
            maxLength={14}
            value={form.cpf}
            onChange={setMasked("cpf", formatCPF)}
            className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-text-neutral">
          Endereço
        </label>
        <input
          value={form.address}
          onChange={set("address")}
          className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-text-neutral">
            Nascimento
          </label>
          <input
            placeholder="dd/mm/aaaa"
            inputMode="numeric"
            maxLength={10}
            value={form.birthdate}
            onChange={setMasked("birthdate", formatDateBR)}
            className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-text-neutral">
            Batismo
          </label>
          <input
            placeholder="dd/mm/aaaa"
            inputMode="numeric"
            maxLength={10}
            value={form.baptismDate}
            onChange={setMasked("baptismDate", formatDateBR)}
            className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-text-neutral">
            Chegada na igreja
          </label>
          <input
            placeholder="dd/mm/aaaa"
            inputMode="numeric"
            maxLength={10}
            value={form.arrivalDate}
            onChange={setMasked("arrivalDate", formatDateBR)}
            className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-text-neutral">
          Há quanto tempo frequenta a IBCI
        </label>
        <input
          value={form.timeAtChurch}
          onChange={set("timeAtChurch")}
          className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="mt-2 flex items-center gap-3">
        <Button type="submit" disabled={status === "loading"}>
          <Save className="h-5 w-5" />
          {status === "loading" ? "Salvando..." : "Salvar cadastro"}
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
