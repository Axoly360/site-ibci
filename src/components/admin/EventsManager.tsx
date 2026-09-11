"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CalendarDays, Pencil, Plus, Trash2, X } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export interface EventRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  date_label: string;
  location: string;
  capacity: number | null;
  price: string | null;
  image_url: string | null;
  external_contact_label: string | null;
  external_contact_whatsapp_message: string | null;
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function EventsManager({ events }: { events: EventRow[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleRemove = async (id: string) => {
    if (!confirm("Remover este evento? Isso não afeta inscrições/check-ins já feitos.")) return;
    const res = await fetch(`/api/admin/eventos/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  };

  return (
    <div className="flex flex-col gap-6">
      {creating ? (
        <EventFormCard
          onCancel={() => setCreating(false)}
          onSaved={() => {
            setCreating(false);
            router.refresh();
          }}
        />
      ) : (
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="flex w-fit items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          <Plus className="h-4 w-4" />
          Novo evento
        </button>
      )}

      {events.length === 0 ? (
        <p className="text-sm text-text-neutral/60">Nenhum evento cadastrado ainda.</p>
      ) : (
        events.map((event) =>
          editingId === event.id ? (
            <EventFormCard
              key={event.id}
              event={event}
              onCancel={() => setEditingId(null)}
              onSaved={() => {
                setEditingId(null);
                router.refresh();
              }}
            />
          ) : (
            <Card key={event.id} className="flex items-center justify-between gap-4 p-5">
              <div className="flex items-center gap-4">
                {event.image_url && (
                  <Image
                    src={event.image_url}
                    alt={event.title}
                    width={80}
                    height={56}
                    unoptimized
                    className="h-14 w-20 shrink-0 rounded-lg object-cover"
                  />
                )}
                <div>
                  <p className="font-semibold text-text-neutral">{event.title}</p>
                  <p className="text-sm text-text-neutral/60">
                    {event.date_label} · /{event.slug}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <Link
                  href={`/admin/eventos/${event.slug}/checkin`}
                  className="flex items-center gap-1.5 text-sm font-semibold text-secondary hover:underline"
                >
                  <CalendarDays className="h-4 w-4" />
                  Check-in
                </Link>
                <button
                  type="button"
                  onClick={() => setEditingId(event.id)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark"
                >
                  <Pencil className="h-4 w-4" />
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(event.id)}
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
  );
}

function EventFormCard({
  event,
  onCancel,
  onSaved,
}: {
  event?: EventRow;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const isEditing = Boolean(event);
  const [title, setTitle] = useState(event?.title ?? "");
  const [slug, setSlug] = useState(event?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEditing);
  const [description, setDescription] = useState(event?.description ?? "");
  const [dateLabel, setDateLabel] = useState(event?.date_label ?? "");
  const [location, setLocation] = useState(event?.location ?? "");
  const [capacity, setCapacity] = useState(event?.capacity ? String(event.capacity) : "");
  const [price, setPrice] = useState(event?.price ?? "");
  const [hasExternalContact, setHasExternalContact] = useState(
    Boolean(event?.external_contact_label)
  );
  const [externalLabel, setExternalLabel] = useState(event?.external_contact_label ?? "");
  const [externalMessage, setExternalMessage] = useState(
    event?.external_contact_whatsapp_message ?? ""
  );
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !description.trim() || !dateLabel.trim() || !location.trim()) {
      setError("Título, descrição, data e local são obrigatórios.");
      return;
    }

    const formData = new FormData();
    formData.set("slug", slug);
    formData.set("title", title);
    formData.set("description", description);
    formData.set("dateLabel", dateLabel);
    formData.set("location", location);
    formData.set("capacity", capacity);
    formData.set("price", price);
    if (hasExternalContact) {
      formData.set("externalContactLabel", externalLabel);
      formData.set("externalContactWhatsappMessage", externalMessage);
    }
    const file = fileInputRef.current?.files?.[0];
    if (file) formData.set("image", file);

    setLoading(true);
    const res = await fetch(
      isEditing ? `/api/admin/eventos/${event!.id}` : "/api/admin/eventos",
      { method: "POST", body: formData }
    );
    setLoading(false);

    if (res.ok) {
      onSaved();
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível salvar.");
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-lg font-semibold text-primary">
            {isEditing ? "Editar evento" : "Novo evento"}
          </h3>
          <button type="button" onClick={onCancel} className="text-text-neutral/50 hover:text-text-neutral">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-text-neutral">Título</label>
            <input
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-text-neutral">
              Slug (usado na URL)
            </label>
            <input
              required
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugify(e.target.value));
              }}
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {isEditing && (
              <p className="mt-1 text-xs text-text-neutral/50">
                Cuidado: mudar o slug depois de já ter inscritos quebra o vínculo com o cadastro
                existente.
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-text-neutral">Descrição</label>
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full resize-none rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-text-neutral">
              Data (texto livre)
            </label>
            <input
              required
              value={dateLabel}
              onChange={(e) => setDateLabel(e.target.value)}
              placeholder="Ex.: 12 e 13 de setembro — Hotel X"
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-text-neutral">Local</label>
            <input
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-text-neutral">
              Capacidade (opcional)
            </label>
            <input
              type="number"
              min={1}
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="Só se a inscrição é pelo site"
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-text-neutral">
              Preço (opcional)
            </label>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Ex.: R$ 350,00 por casal"
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-text-neutral">
            Imagem do evento (PNG ou JPEG, opcional)
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
            className="w-full text-sm"
          />
          {fileName && <p className="mt-1 text-xs text-text-neutral/60">{fileName}</p>}
          {event?.image_url && !fileName && (
            <a
              href={event.image_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-xs font-semibold text-secondary hover:underline"
            >
              Ver imagem atual
            </a>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm font-semibold text-text-neutral">
          <input
            type="checkbox"
            checked={hasExternalContact}
            onChange={(e) => setHasExternalContact(e.target.checked)}
            className="h-4 w-4"
          />
          Inscrição é combinada por fora do site (evento pago, com responsável)
        </label>

        {hasExternalContact && (
          <div className="grid grid-cols-1 gap-3 rounded-lg bg-bg-light p-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-text-neutral">
                Texto do botão
              </label>
              <input
                value={externalLabel}
                onChange={(e) => setExternalLabel(e.target.value)}
                placeholder="Ex.: Falar com Fulano e Sicrana"
                className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-text-neutral">
                Mensagem do WhatsApp
              </label>
              <input
                value={externalMessage}
                onChange={(e) => setExternalMessage(e.target.value)}
                className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        )}

        <div className="mt-2 flex items-center gap-3">
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
