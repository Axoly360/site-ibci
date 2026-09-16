"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2, X } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { QUICK_ACCESS_ICONS, QUICK_ACCESS_ICON_KEYS } from "@/lib/quickAccessIcons";

export interface AccessCardRow {
  id: string;
  icon: string;
  title: string;
  description: string;
  actionType: "link" | "pix" | "info";
  linkUrl: string | null;
  external: boolean;
  ctaLabel: string | null;
}

const ACTION_TYPE_LABELS: Record<AccessCardRow["actionType"], string> = {
  link: "Link (abre um endereço)",
  pix: "Chave PIX (abre o modal de dízimos já existente)",
  info: "Só informativo (sem ação)",
};

export default function AccessCardsManager({ cards }: { cards: AccessCardRow[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleRemove = async (id: string) => {
    if (!confirm("Remover este card do Acesso Rápido?")) return;
    const res = await fetch(`/api/admin/acesso-rapido/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  };

  const handleMove = async (id: string, direction: "up" | "down") => {
    const res = await fetch(`/api/admin/acesso-rapido/${id}/mover`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ direction }),
    });
    if (res.ok) router.refresh();
  };

  return (
    <div className="flex flex-col gap-6">
      {creating ? (
        <CardFormCard
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
          Novo card
        </button>
      )}

      {cards.length === 0 ? (
        <p className="text-sm text-text-neutral/60">Nenhum card cadastrado ainda.</p>
      ) : (
        cards.map((card, index) => {
          const Icon = QUICK_ACCESS_ICONS[card.icon] ?? QUICK_ACCESS_ICONS.Clock;
          return editingId === card.id ? (
            <CardFormCard
              key={card.id}
              card={card}
              onCancel={() => setEditingId(null)}
              onSaved={() => {
                setEditingId(null);
                router.refresh();
              }}
            />
          ) : (
            <Card key={card.id} className="flex items-center justify-between gap-4 p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-text-neutral">{card.title}</p>
                  <p className="line-clamp-1 text-sm text-text-neutral/60">
                    {card.description}
                  </p>
                  <p className="text-xs font-semibold text-secondary">
                    {ACTION_TYPE_LABELS[card.actionType]}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleMove(card.id, "up")}
                    disabled={index === 0}
                    aria-label="Mover card para cima"
                    className="rounded-lg p-1.5 text-text-neutral/50 hover:bg-black/5 hover:text-primary disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(card.id, "down")}
                    disabled={index === cards.length - 1}
                    aria-label="Mover card para baixo"
                    className="rounded-lg p-1.5 text-text-neutral/50 hover:bg-black/5 hover:text-primary disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingId(card.id)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark"
                >
                  <Pencil className="h-4 w-4" />
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(card.id)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  Remover
                </button>
              </div>
            </Card>
          );
        })
      )}
    </div>
  );
}

function CardFormCard({
  card,
  onCancel,
  onSaved,
}: {
  card?: AccessCardRow;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const isEditing = Boolean(card);
  const [icon, setIcon] = useState(card?.icon ?? QUICK_ACCESS_ICON_KEYS[0]);
  const [title, setTitle] = useState(card?.title ?? "");
  const [description, setDescription] = useState(card?.description ?? "");
  const [actionType, setActionType] = useState<AccessCardRow["actionType"]>(
    card?.actionType ?? "link"
  );
  const [linkUrl, setLinkUrl] = useState(card?.linkUrl ?? "");
  const [external, setExternal] = useState(card?.external ?? true);
  const [ctaLabel, setCtaLabel] = useState(card?.ctaLabel ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch(
      isEditing ? `/api/admin/acesso-rapido/${card!.id}` : "/api/admin/acesso-rapido",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ icon, title, description, actionType, linkUrl, external, ctaLabel }),
      }
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
            {isEditing ? "Editar card" : "Novo card"}
          </h3>
          <button type="button" onClick={onCancel} className="text-text-neutral/50 hover:text-text-neutral">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-text-neutral">Ícone</label>
            <select
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {QUICK_ACCESS_ICON_KEYS.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-text-neutral">Título</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-text-neutral">Descrição</label>
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full resize-none rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-text-neutral">
            Tipo de ação
          </label>
          <select
            value={actionType}
            onChange={(e) => setActionType(e.target.value as AccessCardRow["actionType"])}
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            {Object.entries(ACTION_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {(actionType === "link" || actionType === "pix") && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {actionType === "link" && (
              <div>
                <label className="mb-1 block text-sm font-semibold text-text-neutral">Link</label>
                <input
                  required
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            )}
            <div>
              <label className="mb-1 block text-sm font-semibold text-text-neutral">
                Texto do botão
              </label>
              <input
                value={ctaLabel}
                onChange={(e) => setCtaLabel(e.target.value)}
                placeholder="Ex.: Como chegar"
                className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        )}

        {actionType === "link" && (
          <label className="flex items-center gap-2 text-sm text-text-neutral">
            <input
              type="checkbox"
              checked={external}
              onChange={(e) => setExternal(e.target.checked)}
              className="h-4 w-4"
            />
            Abrir em nova aba
          </label>
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
