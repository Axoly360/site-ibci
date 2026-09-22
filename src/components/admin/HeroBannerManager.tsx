"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2, X } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export interface HeroBannerRow {
  id: string;
  srcDesktop: string;
  srcMobile: string;
  alt: string | null;
  href: string | null;
}

export default function HeroBannerManager({ banners }: { banners: HeroBannerRow[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleRemove = async (id: string) => {
    if (!confirm("Remover este banner do Hero? Fica só com os que restarem.")) return;
    const res = await fetch(`/api/admin/hero-banners/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  };

  const handleMove = async (id: string, direction: "up" | "down") => {
    const res = await fetch(`/api/admin/hero-banners/${id}/mover`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ direction }),
    });
    if (res.ok) router.refresh();
  };

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-text-neutral/60">
        {banners.length === 1
          ? "1 banner ativo no momento."
          : `${banners.length} banners ativos no momento.`}{" "}
        Adicione, remova ou reordene à vontade — dá pra ter só 1, 2, 3 ou mais.
      </p>

      {creating ? (
        <HeroBannerFormCard
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
          Novo banner
        </button>
      )}

      {banners.length === 0 ? (
        <p className="text-sm text-text-neutral/60">Nenhum banner ativo no Hero ainda.</p>
      ) : (
        banners.map((banner, index) =>
          editingId === banner.id ? (
            <HeroBannerFormCard
              key={banner.id}
              banner={banner}
              onCancel={() => setEditingId(null)}
              onSaved={() => {
                setEditingId(null);
                router.refresh();
              }}
            />
          ) : (
            <Card key={banner.id} className="flex items-center justify-between gap-4 p-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-lg bg-black/5">
                  <Image
                    src={banner.srcDesktop}
                    alt={banner.alt ?? ""}
                    fill
                    unoptimized={banner.srcDesktop.startsWith("http")}
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-text-neutral">
                    {banner.alt || "Sem texto alternativo"}
                  </p>
                  <p className="truncate text-xs text-text-neutral/60">
                    {banner.href || "Sem link (não clicável)"}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleMove(banner.id, "up")}
                    disabled={index === 0}
                    aria-label="Mover banner para cima"
                    className="rounded-lg p-1.5 text-text-neutral/50 hover:bg-black/5 hover:text-primary disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(banner.id, "down")}
                    disabled={index === banners.length - 1}
                    aria-label="Mover banner para baixo"
                    className="rounded-lg p-1.5 text-text-neutral/50 hover:bg-black/5 hover:text-primary disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingId(banner.id)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark"
                >
                  <Pencil className="h-4 w-4" />
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(banner.id)}
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

function HeroBannerFormCard({
  banner,
  onCancel,
  onSaved,
}: {
  banner?: HeroBannerRow;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const isEditing = Boolean(banner);
  const imageDesktopRef = useRef<HTMLInputElement>(null);
  const imageMobileRef = useRef<HTMLInputElement>(null);
  const [alt, setAlt] = useState(banner?.alt ?? "");
  const [href, setHref] = useState(banner?.href ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const desktopFile = imageDesktopRef.current?.files?.[0];
    const mobileFile = imageMobileRef.current?.files?.[0];
    if (!isEditing && (!desktopFile || !mobileFile)) {
      setError("Envie as duas imagens (desktop e mobile) para criar um banner novo.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("alt", alt);
    formData.append("href", href);
    if (desktopFile) formData.append("imageDesktop", desktopFile);
    if (mobileFile) formData.append("imageMobile", mobileFile);

    const res = await fetch(
      isEditing ? `/api/admin/hero-banners/${banner!.id}` : "/api/admin/hero-banners",
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
            {isEditing ? "Editar banner" : "Novo banner"}
          </h3>
          <button type="button" onClick={onCancel} className="text-text-neutral/50 hover:text-text-neutral">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-text-neutral">
              Imagem — desktop (1360x460){isEditing && banner?.srcDesktop && " — deixe em branco para manter"}
            </label>
            {isEditing && banner?.srcDesktop && (
              <a
                href={banner.srcDesktop}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-1 block text-xs font-semibold text-secondary hover:underline"
              >
                Ver imagem atual
              </a>
            )}
            <input ref={imageDesktopRef} type="file" accept="image/*" className="w-full text-sm" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-text-neutral">
              Imagem — mobile (390x546){isEditing && banner?.srcMobile && " — deixe em branco para manter"}
            </label>
            {isEditing && banner?.srcMobile && (
              <a
                href={banner.srcMobile}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-1 block text-xs font-semibold text-secondary hover:underline"
              >
                Ver imagem atual
              </a>
            )}
            <input ref={imageMobileRef} type="file" accept="image/*" className="w-full text-sm" />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-text-neutral">
            Texto alternativo (descrição da imagem)
          </label>
          <input
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-text-neutral">
            Link (para onde leva ao clicar — opcional)
          </label>
          <input
            value={href}
            onChange={(e) => setHref(e.target.value)}
            placeholder="/para-voce/eventos/..."
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

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
