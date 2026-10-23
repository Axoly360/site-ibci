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
  marital_status: string | null;
  birthplace: string | null;
  profession: string | null;
  sex: string | null;
  deacon_kind: string | null;
  deacon_status: string | null;
  teacher_status: string | null;
}

const DEACON_STATUS_LABEL: Record<string, string> = {
  ativo: "ativo",
  afastado: "afastado",
  emerito: "emérito",
};

const MARITAL_STATUS_OPTIONS = ["Solteiro(a)", "Casado(a)", "Divorciado(a)", "Viúvo(a)"];

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
    maritalStatus: profile.marital_status ?? "",
    birthplace: profile.birthplace ?? "",
    profession: profile.profession ?? "",
    sex: profile.sex ?? "",
    deaconKind: profile.deacon_kind ?? "",
    isTeacher: Boolean(profile.teacher_status),
  });
  const teacherConfirmed = profile.teacher_status && profile.teacher_status !== "solicitado";
  const deaconConfirmed = profile.deacon_status && profile.deacon_status !== "solicitado";
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
              unoptimized
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
          className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline disabled:opacity-50"
        >
          <Camera className="h-4 w-4" />
          {photoUploading ? "Enviando..." : "Trocar foto"}
        </button>
      </div>

      <div>
        <label htmlFor="pf-name" className="mb-1.5 block text-sm font-semibold text-text-neutral">
          Nome completo
        </label>
        <input
          id="pf-name"
          required
          value={form.name}
          onChange={set("name")}
          className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div>
        <label htmlFor="pf-email" className="mb-1.5 block text-sm font-semibold text-text-neutral">
          E-mail
        </label>
        <input
          id="pf-email"
          disabled
          value={profile.email}
          className="w-full rounded-lg border border-black/10 bg-black/5 px-4 py-3 text-sm text-text-neutral/60"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="pf-phone" className="mb-1.5 block text-sm font-semibold text-text-neutral">
            Telefone / WhatsApp
          </label>
          <input
            id="pf-phone"
            value={form.phone}
            onChange={set("phone")}
            className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label htmlFor="pf-cpf" className="mb-1.5 block text-sm font-semibold text-text-neutral">CPF</label>
          <input
            id="pf-cpf"
            inputMode="numeric"
            maxLength={14}
            value={form.cpf}
            onChange={setMasked("cpf", formatCPF)}
            className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div>
        <label htmlFor="pf-address" className="mb-1.5 block text-sm font-semibold text-text-neutral">
          Endereço
        </label>
        <input
          id="pf-address"
          value={form.address}
          onChange={set("address")}
          className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="pf-birthdate" className="mb-1.5 block text-sm font-semibold text-text-neutral">
            Nascimento
          </label>
          <input
            id="pf-birthdate"
            placeholder="dd/mm/aaaa"
            inputMode="numeric"
            maxLength={10}
            value={form.birthdate}
            onChange={setMasked("birthdate", formatDateBR)}
            className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label htmlFor="pf-baptism" className="mb-1.5 block text-sm font-semibold text-text-neutral">
            Batismo
          </label>
          <input
            id="pf-baptism"
            placeholder="dd/mm/aaaa"
            inputMode="numeric"
            maxLength={10}
            value={form.baptismDate}
            onChange={setMasked("baptismDate", formatDateBR)}
            className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label htmlFor="pf-arrival" className="mb-1.5 block text-sm font-semibold text-text-neutral">
            Chegada na igreja
          </label>
          <input
            id="pf-arrival"
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
        <label htmlFor="pf-time-at-church" className="mb-1.5 block text-sm font-semibold text-text-neutral">
          Há quanto tempo frequenta a IBCI
        </label>
        <input
          id="pf-time-at-church"
          value={form.timeAtChurch}
          onChange={set("timeAtChurch")}
          className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div>
        <label htmlFor="pf-sex" className="mb-1.5 block text-sm font-semibold text-text-neutral">
          Sexo
        </label>
        <select
          id="pf-sex"
          value={form.sex}
          onChange={(e) => setForm((prev) => ({ ...prev, sex: e.target.value }))}
          className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Selecione</option>
          <option value="Feminino">Feminino</option>
          <option value="Masculino">Masculino</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="pf-marital-status" className="mb-1.5 block text-sm font-semibold text-text-neutral">
            Estado civil
          </label>
          <select
            id="pf-marital-status"
            value={form.maritalStatus}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, maritalStatus: e.target.value }))
            }
            className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Selecione</option>
            {MARITAL_STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="pf-birthplace" className="mb-1.5 block text-sm font-semibold text-text-neutral">
            Naturalidade
          </label>
          <input
            id="pf-birthplace"
            placeholder="Cidade / UF"
            value={form.birthplace}
            onChange={set("birthplace")}
            className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label htmlFor="pf-profession" className="mb-1.5 block text-sm font-semibold text-text-neutral">
            Profissão
          </label>
          <input
            id="pf-profession"
            value={form.profession}
            onChange={set("profession")}
            className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div>
        <label htmlFor="pf-deacon" className="mb-1.5 block text-sm font-semibold text-text-neutral">
          Ministério diaconal
        </label>
        {deaconConfirmed ? (
          <p className="rounded-lg border border-black/10 bg-black/5 px-4 py-3 text-sm text-text-neutral/80">
            {profile.deacon_kind} ({DEACON_STATUS_LABEL[profile.deacon_status ?? ""] ?? profile.deacon_status})
          </p>
        ) : (
          <>
            <select
              id="pf-deacon"
              value={form.deaconKind}
              onChange={(e) => setForm((prev) => ({ ...prev, deaconKind: e.target.value }))}
              className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Não sou diácono / diaconisa</option>
              <option value="Diácono">Sou diácono</option>
              <option value="Diaconisa">Sou diaconisa</option>
            </select>
            {form.deaconKind && (
              <p className="mt-1.5 text-xs text-text-neutral/60">
                Sua informação será conferida e confirmada pela Secretaria.
              </p>
            )}
          </>
        )}
      </div>

      <div>
        <label htmlFor="pf-teacher" className="mb-1.5 block text-sm font-semibold text-text-neutral">
          Ensino na EBD
        </label>
        {teacherConfirmed ? (
          <p className="rounded-lg border border-black/10 bg-black/5 px-4 py-3 text-sm text-text-neutral/80">
            Professor(a) da EBD ({profile.teacher_status === "afastado" ? "afastado" : "ativo"})
          </p>
        ) : (
          <>
            <select
              id="pf-teacher"
              value={form.isTeacher ? "sim" : ""}
              onChange={(e) => setForm((prev) => ({ ...prev, isTeacher: e.target.value === "sim" }))}
              className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Não sou professor(a) da EBD</option>
              <option value="sim">Sou professor(a) da EBD</option>
            </select>
            {form.isTeacher && (
              <p className="mt-1.5 text-xs text-text-neutral/60">
                Sua informação será conferida e confirmada pela Secretaria.
              </p>
            )}
          </>
        )}
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
