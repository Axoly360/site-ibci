import Image from "next/image";
import Link from "next/link";
import { BookOpen, HandHeart, Pencil, Phone, ShieldCheck, UserRound, type LucideIcon } from "lucide-react";

export interface MemberProfileSummaryData {
  id: string;
  member_number: number;
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
  deacon_kind?: string | null;
  deacon_status?: string | null;
  teacher_status?: string | null;
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-wide text-secondary">{label}</p>
      <p className="mt-1 font-semibold text-white">{value || "—"}</p>
    </div>
  );
}

type BadgeKey = "pastor" | "diacono" | "professor";

// Hierarquia das insígnias, da esquerda para a direita: o ofício mais antigo/
// de maior autoridade vem primeiro (Pastor, depois Diácono, depois Professor).
// Ao criar uma insígnia nova, é aqui que ela entra na ordem.
const BADGE_ORDER: BadgeKey[] = ["pastor", "diacono", "professor"];

export default function MemberProfileSummary({ member }: { member: MemberProfileSummaryData }) {
  const deaconApproved = Boolean(member.deacon_kind) && member.deacon_status !== "solicitado" && Boolean(member.deacon_status);
  const deaconActive = member.deacon_status === "ativo";
  const teacherApproved = Boolean(member.teacher_status) && member.teacher_status !== "solicitado";
  const teacherActive = member.teacher_status === "ativo";
  const deaconTag =
    member.deacon_status === "emerito"
      ? `${member.deacon_kind} emérito`
      : member.deacon_status === "afastado"
        ? `${member.deacon_kind} (afastado)`
        : member.deacon_kind;

  const roleText = member.is_leadership ? member.church_role || "Liderança" : "Membro";
  const isPastor = member.is_leadership && /pastor/i.test(member.church_role ?? "");
  const pastorLabel = /pastora/i.test(member.church_role ?? "") ? "Pastora" : "Pastor";
  // Quando o cargo é só "Pastor(a)", a insígnia já diz isso; a linha de texto some para não repetir.
  const showRoleText = !(isPastor && /^\s*pastora?\s*$/i.test(member.church_role ?? ""));

  const badges: { key: BadgeKey; label: string; Icon: LucideIcon }[] = [];
  if (isPastor) badges.push({ key: "pastor", label: pastorLabel, Icon: HandHeart });
  if (deaconApproved) {
    badges.push({ key: "diacono", label: deaconTag ?? "Diácono", Icon: ShieldCheck });
  }
  if (teacherApproved) {
    badges.push({
      key: "professor",
      label: teacherActive ? "Professor(a)" : "Professor(a) (afastado)",
      Icon: BookOpen,
    });
  }
  badges.sort((a, b) => BADGE_ORDER.indexOf(a.key) - BADGE_ORDER.indexOf(b.key));

  return (
    <div className="rounded-2xl border-t-4 border-secondary bg-primary-dark p-6 shadow-lg sm:p-8">
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-white/20 bg-white/10">
          {member.photo_url ? (
            <Image
              src={member.photo_url}
              alt={member.name}
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-white/40">
              <UserRound className="h-10 w-10" />
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="font-heading text-2xl font-bold text-white">{member.name}</h2>
          {showRoleText && <p className="text-sm font-semibold text-secondary">{roleText}</p>}
          {badges.length > 0 && (
            <div className="mt-1.5 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              {badges.map(({ key, label, Icon }) => (
                <span
                  key={key}
                  className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-secondary px-2.5 py-0.5 text-xs font-bold text-primary"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-center gap-3 sm:justify-end">
          <span className="whitespace-nowrap rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white">
            # ID: IBCI{String(member.member_number).padStart(4, "0")}
          </span>
          {(deaconActive || teacherActive) && (
            <div className="flex flex-col gap-2">
              {deaconActive && (
                <Link
                  href="/central-do-membro/diaconos"
                  className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-secondary px-5 py-2.5 text-sm font-bold text-secondary transition-colors hover:bg-secondary hover:text-primary"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Área dos Diáconos
                </Link>
              )}
              {teacherActive && (
                <Link
                  href="/central-do-membro/professor"
                  className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-secondary px-5 py-2.5 text-sm font-bold text-secondary transition-colors hover:bg-secondary hover:text-primary"
                >
                  <BookOpen className="h-4 w-4" />
                  Área do Professor
                </Link>
              )}
            </div>
          )}
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
