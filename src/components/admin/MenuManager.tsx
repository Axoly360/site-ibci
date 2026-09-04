"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, ArrowDown, Plus, Save, Trash2 } from "lucide-react";
import Card from "@/components/ui/Card";
import type { NavItemRow } from "@/lib/navItems";

export default function MenuManager({ items }: { items: NavItemRow[] }) {
  const router = useRouter();
  const [addingChildTo, setAddingChildTo] = useState<string | null>(null);
  const [addingCategory, setAddingCategory] = useState(false);

  const categories = items.filter((i) => !i.parent_id);
  const childrenOf = (id: string) => items.filter((i) => i.parent_id === id);

  const refresh = () => router.refresh();

  return (
    <div className="flex flex-col gap-6">
      {categories.map((cat) => (
        <Card key={cat.id} className="p-5">
          <NavItemRowEditor item={cat} onSaved={refresh} isCategory />

          <div className="mt-4 ml-4 flex flex-col gap-3 border-l border-black/5 pl-4">
            {childrenOf(cat.id).map((child) => (
              <NavItemRowEditor key={child.id} item={child} onSaved={refresh} />
            ))}

            {addingChildTo === cat.id ? (
              <NewItemForm
                parentId={cat.id}
                onDone={() => {
                  setAddingChildTo(null);
                  refresh();
                }}
                onCancel={() => setAddingChildTo(null)}
              />
            ) : (
              <button
                type="button"
                onClick={() => setAddingChildTo(cat.id)}
                className="flex w-fit items-center gap-1.5 text-sm font-semibold text-secondary hover:underline"
              >
                <Plus className="h-4 w-4" />
                Adicionar subcategoria
              </button>
            )}
          </div>
        </Card>
      ))}

      {addingCategory ? (
        <Card className="p-5">
          <NewItemForm
            parentId={null}
            onDone={() => {
              setAddingCategory(false);
              refresh();
            }}
            onCancel={() => setAddingCategory(false)}
          />
        </Card>
      ) : (
        <button
          type="button"
          onClick={() => setAddingCategory(true)}
          className="flex w-fit items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          <Plus className="h-4 w-4" />
          Adicionar categoria
        </button>
      )}
    </div>
  );
}

function NavItemRowEditor({
  item,
  onSaved,
  isCategory,
}: {
  item: NavItemRow;
  onSaved: () => void;
  isCategory?: boolean;
}) {
  const [label, setLabel] = useState(item.label);
  const [href, setHref] = useState(item.href);
  const [value, setValue] = useState(item.value ?? "");
  const [visible, setVisible] = useState(item.visible);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const dirty =
    label !== item.label ||
    href !== item.href ||
    value !== (item.value ?? "") ||
    visible !== item.visible;

  const save = async () => {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/admin/menu/${item.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, href, value, visible }),
    });
    setLoading(false);
    if (res.ok) {
      onSaved();
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível salvar.");
    }
  };

  const move = async (direction: "up" | "down") => {
    await fetch(`/api/admin/menu/${item.id}/mover`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ direction }),
    });
    onSaved();
  };

  const remove = async () => {
    const aviso = isCategory
      ? "Remover esta categoria também remove suas subcategorias. Continuar?"
      : "Remover esta subcategoria do menu?";
    if (!confirm(aviso)) return;
    await fetch(`/api/admin/menu/${item.id}`, { method: "DELETE" });
    onSaved();
  };

  return (
    <div className={isCategory ? "" : "rounded-lg bg-bg-light p-3"}>
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Nome"
          className={`min-w-[140px] flex-1 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 ${
            isCategory ? "font-semibold text-primary" : ""
          }`}
        />
        <input
          value={href}
          onChange={(e) => setHref(e.target.value)}
          placeholder="/link"
          className="min-w-[160px] flex-1 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        {!isCategory && (
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Valor exibido (opcional)"
            className="min-w-[160px] flex-1 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        )}
        <label className="flex items-center gap-1.5 text-xs text-text-neutral/70">
          <input
            type="checkbox"
            checked={visible}
            onChange={(e) => setVisible(e.target.checked)}
            className="h-4 w-4"
          />
          Visível
        </label>
        <button
          type="button"
          onClick={() => move("up")}
          aria-label="Mover para cima"
          className="rounded-lg p-2 text-text-neutral/50 hover:bg-black/5 hover:text-primary"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => move("down")}
          aria-label="Mover para baixo"
          className="rounded-lg p-2 text-text-neutral/50 hover:bg-black/5 hover:text-primary"
        >
          <ArrowDown className="h-4 w-4" />
        </button>
        {dirty && (
          <button
            type="button"
            onClick={save}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            Salvar
          </button>
        )}
        <button
          type="button"
          onClick={remove}
          aria-label="Remover"
          className="rounded-lg p-2 text-red-500/70 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function NewItemForm({
  parentId,
  onDone,
  onCancel,
}: {
  parentId: string | null;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [label, setLabel] = useState("");
  const [href, setHref] = useState("");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const create = async () => {
    if (!label.trim() || !href.trim()) {
      setError("Preencha nome e link.");
      return;
    }
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, href, value, parentId }),
    });
    setLoading(false);
    if (res.ok) {
      onDone();
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível criar.");
    }
  };

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-dashed border-primary/30 bg-white p-3">
      <div className="flex flex-wrap gap-2">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Nome"
          className="min-w-[140px] flex-1 rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <input
          value={href}
          onChange={(e) => setHref(e.target.value)}
          placeholder="/link"
          className="min-w-[160px] flex-1 rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        {parentId && (
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Valor exibido (opcional)"
            className="min-w-[160px] flex-1 rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        )}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={create}
          disabled={loading}
          className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
        >
          {loading ? "Criando..." : "Criar"}
        </button>
        <button type="button" onClick={onCancel} className="text-xs font-semibold text-text-neutral/60">
          Cancelar
        </button>
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>
    </div>
  );
}
