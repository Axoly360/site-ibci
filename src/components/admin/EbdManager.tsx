"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, Plus, Trash2, Users, X } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export interface EbdClass {
  id: string;
  name: string;
  teacher_name: string | null;
  audience: string | null;
  meeting_time: string | null;
  location: string | null;
  description: string | null;
  student_count: number;
  pending_count: number;
  teacher_member_ids: string[];
}

export interface TeacherOption {
  id: string;
  name: string;
}

const MAX_TEACHERS = 3;

interface Fields {
  name: string;
  teacherMemberIds: string[];
  teacherName: string;
  audience: string;
  meetingTime: string;
  location: string;
  description: string;
}

const emptyFields: Fields = {
  name: "",
  teacherMemberIds: [],
  teacherName: "",
  audience: "",
  meetingTime: "",
  location: "",
  description: "",
};

const inputClass =
  "w-full rounded-lg border border-black/10 bg-bg-light px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

const AUDIENCES = ["Crianças", "Adolescentes", "Jovens", "Adultos", "Melhor Idade", "Novos convertidos"];

function FieldsInputs({
  fields,
  onChange,
  teachers,
}: {
  fields: Fields;
  onChange: (f: Fields) => void;
  teachers: TeacherOption[];
}) {
  const typedCount = fields.teacherName
    .split(",")
    .map((n) => n.trim())
    .filter(Boolean).length;
  const chosen = fields.teacherMemberIds.length;
  const total = chosen + typedCount;

  const toggleTeacher = (id: string) => {
    const has = fields.teacherMemberIds.includes(id);
    onChange({
      ...fields,
      teacherMemberIds: has
        ? fields.teacherMemberIds.filter((t) => t !== id)
        : [...fields.teacherMemberIds, id],
    });
  };

  return (
    <>
      <input
        required
        placeholder="Nome da sala (ex.: Sala Betel)"
        value={fields.name}
        onChange={(e) => onChange({ ...fields, name: e.target.value })}
        className={inputClass}
      />

      <div className="rounded-lg border border-black/10 bg-bg-light p-4">
        <p className="text-sm font-semibold text-text-neutral">
          Professores da sala{" "}
          <span className={total > MAX_TEACHERS ? "text-red-600" : "text-text-neutral/60"}>
            ({total} de {MAX_TEACHERS})
          </span>
        </p>
        {teachers.length === 0 ? (
          <p className="mt-2 text-xs text-text-neutral/60">
            Nenhum professor aprovado ainda. Aprove pedidos em Admin → Professores ou digite o nome
            abaixo.
          </p>
        ) : (
          <div className="mt-2 flex flex-col gap-1.5">
            {teachers.map((t) => {
              const checked = fields.teacherMemberIds.includes(t.id);
              return (
                <label key={t.id} className="flex items-center gap-2 text-sm text-text-neutral">
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={!checked && total >= MAX_TEACHERS}
                    onChange={() => toggleTeacher(t.id)}
                  />
                  {t.name}
                </label>
              );
            })}
          </div>
        )}
        <input
          placeholder="Professor sem cadastro (nome; vários separados por vírgula)"
          value={fields.teacherName}
          onChange={(e) => onChange({ ...fields, teacherName: e.target.value })}
          className={`${inputClass} mt-3`}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          list="ebd-audiences"
          placeholder="Público (ex.: Jovens)"
          value={fields.audience}
          onChange={(e) => onChange({ ...fields, audience: e.target.value })}
          className={inputClass}
        />
        <datalist id="ebd-audiences">
          {AUDIENCES.map((a) => (
            <option key={a} value={a} />
          ))}
        </datalist>
        <input
          placeholder="Horário (ex.: Domingo, 10h)"
          value={fields.meetingTime}
          onChange={(e) => onChange({ ...fields, meetingTime: e.target.value })}
          className={inputClass}
        />
        <input
          placeholder="Local (ex.: Térreo, sala 2)"
          value={fields.location}
          onChange={(e) => onChange({ ...fields, location: e.target.value })}
          className={inputClass}
        />
      </div>
      <textarea
        placeholder="Descrição ou tema do trimestre (opcional)"
        value={fields.description}
        onChange={(e) => onChange({ ...fields, description: e.target.value })}
        rows={2}
        className={`${inputClass} resize-none`}
      />
    </>
  );
}

export default function EbdManager({
  classes,
  teachers,
}: {
  classes: EbdClass[];
  teachers: TeacherOption[];
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [fields, setFields] = useState<Fields>(emptyFields);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/ebd", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    setLoading(false);
    if (res.ok) {
      setFields(emptyFields);
      setCreating(false);
      router.refresh();
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível criar a sala.");
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm("Remover esta sala? Os alunos serão desvinculados dela.")) return;
    const res = await fetch(`/api/admin/ebd/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  };

  return (
    <div className="flex flex-col gap-6">
      {creating ? (
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold text-primary">Nova sala</h2>
            <button type="button" onClick={() => setCreating(false)} className="text-text-neutral/50 hover:text-text-neutral">
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={handleCreate} className="flex flex-col gap-3">
            <FieldsInputs fields={fields} onChange={setFields} teachers={teachers} />
            <Button type="submit" disabled={loading}>
              <Plus className="h-4 w-4" />
              {loading ? "Criando..." : "Criar sala"}
            </Button>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </form>
        </Card>
      ) : (
        <Button onClick={() => setCreating(true)} size="sm">
          <Plus className="h-4 w-4" />
          Nova sala
        </Button>
      )}

      <div className="flex flex-col gap-3">
        {classes.length === 0 ? (
          <p className="text-sm text-text-neutral/60">Nenhuma sala cadastrada ainda.</p>
        ) : (
          classes.map((c) =>
            editingId === c.id ? (
              <EditCard
                key={c.id}
                item={c}
                teachers={teachers}
                onCancel={() => setEditingId(null)}
                onSaved={() => {
                  setEditingId(null);
                  router.refresh();
                }}
              />
            ) : (
              <Card key={c.id} className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-semibold text-text-neutral">
                    {c.name}
                    {c.audience && (
                      <span className="ml-2 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                        {c.audience}
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-text-neutral/60">
                    {[c.teacher_name, c.meeting_time, c.location].filter(Boolean).join(" · ") || "—"}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-primary">
                    <Users className="h-3.5 w-3.5" />
                    {c.student_count} {c.student_count === 1 ? "aluno" : "alunos"}
                    {c.pending_count > 0 && (
                      <span className="ml-1 rounded-full bg-secondary px-2 py-0.5 text-primary">
                        {c.pending_count} pendente{c.pending_count > 1 ? "s" : ""}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <Link
                    href={`/admin/ebd/${c.id}`}
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    Ver alunos
                  </Link>
                  <button
                    type="button"
                    onClick={() => setEditingId(c.id)}
                    className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark"
                  >
                    <Pencil className="h-4 w-4" />
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(c.id)}
                    className="flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remover
                  </button>
                </div>
              </Card>
            )
          )
        )}
      </div>
    </div>
  );
}

function EditCard({
  item,
  teachers,
  onCancel,
  onSaved,
}: {
  item: EbdClass;
  teachers: TeacherOption[];
  onCancel: () => void;
  onSaved: () => void;
}) {
  // teacher_name junta os professores escolhidos e os digitados; ao editar, só
  // os nomes que não são de professores escolhidos voltam para o campo de texto.
  const chosenNames = teachers
    .filter((t) => item.teacher_member_ids.includes(t.id))
    .map((t) => t.name);
  const typedNames = (item.teacher_name ?? "")
    .split(",")
    .map((n) => n.trim())
    .filter((n) => n && !chosenNames.includes(n))
    .join(", ");

  const [fields, setFields] = useState<Fields>({
    name: item.name,
    teacherMemberIds: item.teacher_member_ids.filter((id) => teachers.some((t) => t.id === id)),
    teacherName: typedNames,
    audience: item.audience ?? "",
    meetingTime: item.meeting_time ?? "",
    location: item.location ?? "",
    description: item.description ?? "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch(`/api/admin/ebd/${item.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    setLoading(false);
    if (res.ok) {
      onSaved();
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível salvar.");
    }
  };

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-sm font-semibold text-primary">Editar sala</h3>
          <button type="button" onClick={onCancel} className="text-text-neutral/50 hover:text-text-neutral">
            <X className="h-4 w-4" />
          </button>
        </div>
        <FieldsInputs fields={fields} onChange={setFields} teachers={teachers} />
        <div className="flex items-center gap-3">
          <Button type="submit" size="sm" disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </Button>
          <button type="button" onClick={onCancel} className="text-sm font-semibold text-text-neutral/60">
            Cancelar
          </button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </Card>
  );
}
