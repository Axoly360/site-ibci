import Image from "next/image";
import Link from "next/link";
import { Pencil, Phone, UserRound } from "lucide-react";

export interface MemberProfileSummaryData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  photo_url: string | null;
  marital_status: string | null;
  birthplace: string | null;
  profession: string | null;
  birthdate: string | null;
  baptism_date: string | null;
  time_at_church: string | null;
  is_leadership: boolean;
  church_role: string | null;
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-wide text-secondary">{label}</p>
      <p className="mt-1 font-semibold text-white">{value || "—"}</p>
    </div>
  );
}

export default function MemberProfileSummary({ member }: { member: MemberProfileSummaryData }) {
  return (
    <div className="rounded-2xl border-t-4 border-secondary bg-primary-dark p-6 shadow-lg sm:p-8">
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-white/20 bg-white/10">
          {member.photo_url ? (
            <Image
              src={member.photo_url}
              alt={member.name}
              fill
              unoptimized={member.photo_url.startsWith("http")}
              className="object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-white/40">
              <UserRound className="h-10 w-10" />
            </span>
          )}
        </div>

        <div className="flex-1">
          <h2 className="font-heading text-2xl font-bold text-white">{member.name}</h2>
          <p className="text-sm font-semibold text-secondary">
            {member.is_leadership ? member.church_role || "Liderança" : "Membro"}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span className="whitespace-nowrap rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white">
            # ID: {member.id.slice(0, 8).toUpperCase()}
          </span>
          <Link
            href="/central-do-membro/perfil"
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-secondary px-5 py-2.5 text-sm font-bold text-primary shadow-sm transition-colors hover:bg-secondary-light"
          >
            <Pencil className="h-4 w-4" />
            Editar Dados
          </Link>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 sm:col-span-2">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-secondary">
            <Phone className="h-3.5 w-3.5" />
            Contato (telefone &amp; e-mail)
          </p>
          <p className="mt-1 font-semibold text-white">
            {[member.phone, member.email].filter(Boolean).join(" • ")}
          </p>
        </div>
        <Field label="Profissão" value={member.profession} />
        <Field label="Estado civil" value={member.marital_status} />
        <Field label="Aniversário" value={member.birthdate} />
        <Field label="Naturalidade" value={member.birthplace} />
        <Field label="Batismo" value={member.baptism_date} />
        <Field label="Há quanto tempo na IBCI" value={member.time_at_church} />
      </div>
    </div>
  );
}
