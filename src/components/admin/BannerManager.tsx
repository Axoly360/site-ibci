"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Send } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export interface BannerSlotConfig {
  key: string;
  label: string;
  hasMobileImage?: boolean;
  hasVideo?: boolean;
  currentImage?: string | null;
  currentImageMobile?: string | null;
  currentTitle?: string | null;
  currentSubtitle?: string | null;
  currentLink?: string | null;
  currentVideo?: string | null;
}

export default function BannerManager({ slot }: { slot: BannerSlotConfig }) {
  const router = useRouter();
  const imageRef = useRef<HTMLInputElement>(null);
  const imageMobileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(slot.currentTitle ?? "");
  const [subtitle, setSubtitle] = useState(slot.currentSubtitle ?? "");
  const [linkUrl, setLinkUrl] = useState(slot.currentLink ?? "");
  const [videoUrl, setVideoUrl] = useState(slot.currentVideo ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    setError("");
    setDone(false);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("subtitle", subtitle);
    formData.append("linkUrl", linkUrl);
    if (slot.hasVideo) formData.append("videoUrl", videoUrl);
    if (imageRef.current?.files?.[0]) {
      formData.append("image", imageRef.current.files[0]);
    }
    if (slot.hasMobileImage && imageMobileRef.current?.files?.[0]) {
      formData.append("imageMobile", imageMobileRef.current.files[0]);
    }

    const res = await fetch(`/api/admin/banners/${slot.key}`, {
      method: "POST",
      body: formData,
    });
    setLoading(false);
    if (res.ok) {
      if (imageRef.current) imageRef.current.value = "";
      if (imageMobileRef.current) imageMobileRef.current.value = "";
      setDone(true);
      router.refresh();
      setTimeout(() => setDone(false), 3000);
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? `Não foi possível salvar (${res.status}).`);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h3 className="font-heading text-lg font-semibold text-primary">{slot.label}</h3>
        <div className="flex gap-3">
          {slot.currentImage && (
            <a
              href={slot.currentImage}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-secondary hover:underline"
            >
              Ver imagem atual
            </a>
          )}
          {slot.currentImageMobile && (
            <a
              href={slot.currentImageMobile}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-secondary hover:underline"
            >
              Ver mobile atual
            </a>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-text-neutral">
            {slot.hasMobileImage ? "Imagem — desktop" : "Imagem"}
          </label>
          <input ref={imageRef} type="file" accept="image/*" className="w-full text-sm" />
        </div>
        {slot.hasMobileImage && (
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-text-neutral">
              Imagem — mobile
            </label>
            <input ref={imageMobileRef} type="file" accept="image/*" className="w-full text-sm" />
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-text-neutral">
            Título / texto alternativo
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-text-neutral">
            Link (para onde leva ao clicar)
          </label>
          <input
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="/para-voce/eventos/..."
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-1.5 block text-sm font-semibold text-text-neutral">
          Legenda / descrição
        </label>
        <textarea
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          rows={2}
          className="w-full resize-none rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {slot.hasVideo && (
        <div className="mt-4">
          <label className="mb-1.5 block text-sm font-semibold text-text-neutral">
            Link do vídeo (YouTube)
          </label>
          <input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      )}

      <div className="mt-5 flex items-center gap-3">
        <Button onClick={handleSave} size="sm" disabled={loading}>
          <Send className="h-4 w-4" />
          {loading ? "Salvando..." : "Salvar"}
        </Button>
        {done && (
          <span className="flex items-center gap-1.5 text-sm font-semibold text-primary">
            <CheckCircle2 className="h-4 w-4" />
            Salvo — já está no ar
          </span>
        )}
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </Card>
  );
}
