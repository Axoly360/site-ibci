"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, FileText, Lock, Send, Trash2, X } from "lucide-react";
import Card from "@/components/ui/Card";

export interface MembershipRequestRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  cpf: string | null;
  birthdate: string | null;
  address: string | null;
  time_at_church: string | null;
  note: string | null;
  requested_at: string;
  status: string;
}

export interface MemberFileRow {
  id: string;
  file_name: string;
  file_url: string;
  uploaded_at: string;
}

export interface ValidatedMemberRow {
  id: string;
  name: string;
  email: string;
  is_leadership: boolean;
  church_role: string | null;
  files: MemberFileRow[];
}

const CHURCH_ROLES = ["Pastor", "Diácono", "Professor", "Líder"];

export default function MembershipQueueManager({
  pendentes,
  recentes,
  validados,
}: {
  pendentes: MembershipRequestRow[];
  recentes: MembershipRequestRow[];
  validados: ValidatedMemberRow[];
}) {
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const revoke = async (memberId: string) => {
    if (!confirm("Revogar a validação deste membro? Ele perde o acesso à área do membro.")) {
      return;
    }
    setLoadingId(memberId);
    await fetch(`/api/admin/membros/revogar/${memberId}`, { method: "POST" });
    setLoadingId(null);
    router.refresh();
  };

  const decide = async (id: string, decision: "aprovado" | "recusado") => {
    setLoadingId(id);
    await fetch(`/api/admin/membros/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision }),
    });
    setLoadingId(null);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h2 className="font-heading text-lg font-semibold text-primary">
          Aguardando validação ({pendentes.length})
        </h2>
        <div className="mt-4 flex flex-col gap-3">
          {pendentes.length === 0 && (
            <p className="text-sm text-text-neutral/60">Nenhum cadastro pendente.</p>
          )}
          {pendentes.map((r) => {
            const open = openId === r.id;
            return (
              <Card key={r.id} className="p-4">
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : r.id)}
                  className="flex w-full items-center justify-between gap-4 text-left"
                >
                  <div>
                    <p className="font-semibold text-text-neutral">{r.name}</p>
                    <p className="text-sm text-text-neutral/60">
                      {r.email} · solicitado em{" "}
                      {new Date(r.requested_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-text-neutral/50 transition-transform ${open ? "rotate-180" : ""}`}
                  />
                </button>

                {open && (
                  <div className="mt-4 grid grid-cols-1 gap-3 border-t border-black/5 pt-4 text-sm sm:grid-cols-2">
                    <Field label="Telefone / WhatsApp" value={r.phone} />
                    <Field label="CPF" value={r.cpf} />
                    <Field label="Data de nascimento" value={r.birthdate} />
                    <Field label="Há quanto tempo frequenta a IBCI" value={r.time_at_church} />
                    <div className="sm:col-span-2">
                      <Field label="Endereço" value={r.address} />
                    </div>
                    <div className="sm:col-span-2">
                      <Field label="Observação enviada no cadastro" value={r.note} />
                    </div>
                  </div>
                )}

                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    disabled={loadingId === r.id}
                    onClick={() => decide(r.id, "aprovado")}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" />
                    Aprovar
                  </button>
                  <button
                    type="button"
                    disabled={loadingId === r.id}
                    onClick={() => decide(r.id, "recusado")}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                    Recusar
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="font-heading text-lg font-semibold text-primary">
          Decididos recentemente
        </h2>
        <div className="mt-4 flex flex-col gap-2">
          {recentes.length === 0 && (
            <p className="text-sm text-text-neutral/60">Nenhuma decisão ainda.</p>
          )}
          {recentes.map((r) => (
            <Card key={r.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-semibold text-text-neutral">{r.name}</p>
                <p className="text-sm text-text-neutral/60">{r.email}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  r.status === "aprovado"
                    ? "bg-primary/10 text-primary"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {r.status === "aprovado" ? "Aprovado" : "Recusado"}
              </span>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-heading text-lg font-semibold text-primary">
          Membros validados ({validados.length})
        </h2>
        <div className="mt-4 flex flex-col gap-2">
          {validados.length === 0 && (
            <p className="text-sm text-text-neutral/60">Nenhum membro validado ainda.</p>
          )}
          {validados.map((m) => (
            <ValidatedMemberCard
              key={m.id}
              member={m}
              loading={loadingId === m.id}
              onRevoke={() => revoke(m.id)}
              onSaveLeadership={async (isLeadership, churchRole) => {
                setLoadingId(m.id);
                await fetch(`/api/admin/membros/lideranca/${m.id}`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ isLeadership, churchRole }),
                });
                setLoadingId(null);
                router.refresh();
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ValidatedMemberCard({
  member,
  loading,
  onRevoke,
  onSaveLeadership,
}: {
  member: ValidatedMemberRow;
  loading: boolean;
  onRevoke: () => void;
  onSaveLeadership: (isLeadership: boolean, churchRole: string) => void;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isLeadership, setIsLeadership] = useState(member.is_leadership);
  const [churchRole, setChurchRole] = useState(member.church_role ?? "");
  const dirty = isLeadership !== member.is_leadership || churchRole !== (member.church_role ?? "");

  const uploadFile = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`/api/admin/membros/${member.id}/arquivos`, {
      method: "POST",
      body: formData,
    });
    setUploading(false);
    if (res.ok) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      router.refresh();
    } else {
      const data = await res.json().catch(() => null);
      setUploadError(data?.error ?? "Não foi possível enviar o arquivo.");
    }
  };

  const removeFile = async (fileId: string) => {
    await fetch(`/api/admin/membros/${member.id}/arquivos/${fileId}`, {
      method: "DELETE",
    });
    router.refresh();
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-text-neutral">{member.name}</p>
          <p className="text-sm text-text-neutral/60">{member.email}</p>
        </div>
        <button
          type="button"
          disabled={loading}
          onClick={onRevoke}
          className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
        >
          <Lock className="h-4 w-4" />
          Revogar validação
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-black/5 pt-3">
        <label className="flex items-center gap-2 text-sm text-text-neutral">
          <input
            type="checkbox"
            checked={isLeadership}
            onChange={(e) => setIsLeadership(e.target.checked)}
            className="h-4 w-4"
          />
          Liderança (acesso à escala de serviços)
        </label>
        <select
          value={churchRole}
          onChange={(e) => setChurchRole(e.target.value)}
          disabled={!isLeadership}
          className="rounded-lg border border-black/10 bg-white px-2 py-1.5 text-sm disabled:opacity-50"
        >
          <option value="">Cargo...</option>
          {CHURCH_ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        {dirty && (
          <button
            type="button"
            disabled={loading}
            onClick={() => onSaveLeadership(isLeadership, churchRole)}
            className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
          >
            Salvar
          </button>
        )}
        {member.is_leadership && !dirty && (
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {member.church_role || "Liderança"}
          </span>
        )}
      </div>

      <div className="mt-3 border-t border-black/5 pt-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-neutral/50">
          Arquivos do membro
        </p>
        {member.files.length > 0 && (
          <ul className="mb-3 flex flex-col gap-1.5">
            {member.files.map((f) => (
              <li key={f.id} className="flex items-center justify-between gap-3 text-sm">
                <a
                  href={f.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 truncate text-secondary hover:underline"
                >
                  <FileText className="h-4 w-4 shrink-0" />
                  <span className="truncate">{f.file_name}</span>
                </a>
                <button
                  type="button"
                  onClick={() => removeFile(f.id)}
                  className="shrink-0 text-text-neutral/40 hover:text-red-600"
                  aria-label={`Remover ${f.file_name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <input ref={fileInputRef} type="file" className="max-w-[220px] text-xs" />
          <button
            type="button"
            disabled={uploading}
            onClick={uploadFile}
            className="flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-xs font-semibold text-text-neutral hover:bg-black/5 disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
            {uploading ? "Enviando..." : "Anexar"}
          </button>
        </div>
        {uploadError && <p className="mt-1 text-xs text-red-600">{uploadError}</p>}
      </div>
    </Card>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-text-neutral/50">
        {label}
      </p>
      <p className="text-text-neutral">{value || "—"}</p>
    </div>
  );
}
