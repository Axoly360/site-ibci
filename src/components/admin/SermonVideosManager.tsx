"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2, Tv, X } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export interface SermonVideoRow {
  id: string;
  youtubeId: string;
  title: string;
}

export default function SermonVideosManager({ videos }: { videos: SermonVideoRow[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleRemove = async (id: string) => {
    if (!confirm("Remover este vídeo da seção Últimas Mensagens?")) return;
    const res = await fetch(`/api/admin/mensagens/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  };

  return (
    <div className="flex flex-col gap-6">
      {creating ? (
        <VideoFormCard
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
          Novo vídeo
        </button>
      )}

      {videos.length === 0 ? (
        <p className="text-sm text-text-neutral/60">Nenhum vídeo cadastrado ainda.</p>
      ) : (
        videos.map((video) =>
          editingId === video.id ? (
            <VideoFormCard
              key={video.id}
              video={video}
              onCancel={() => setEditingId(null)}
              onSaved={() => {
                setEditingId(null);
                router.refresh();
              }}
            />
          ) : (
            <Card key={video.id} className="flex items-center justify-between gap-4 p-5">
              <div className="flex items-center gap-4">
                <img
                  src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                  alt={video.title}
                  className="h-14 w-20 shrink-0 rounded-lg object-cover"
                />
                <div>
                  <p className="line-clamp-2 font-semibold text-text-neutral">{video.title}</p>
                  <a
                    href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-secondary hover:underline"
                  >
                    <Tv className="h-3.5 w-3.5" />
                    Ver no YouTube
                  </a>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <button
                  type="button"
                  onClick={() => setEditingId(video.id)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark"
                >
                  <Pencil className="h-4 w-4" />
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(video.id)}
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

function VideoFormCard({
  video,
  onCancel,
  onSaved,
}: {
  video?: SermonVideoRow;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const isEditing = Boolean(video);
  const [link, setLink] = useState(
    video ? `https://www.youtube.com/watch?v=${video.youtubeId}` : ""
  );
  const [title, setTitle] = useState(video?.title ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch(
      isEditing ? `/api/admin/mensagens/${video!.id}` : "/api/admin/mensagens",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ link, title }),
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
            {isEditing ? "Editar vídeo" : "Novo vídeo"}
          </h3>
          <button type="button" onClick={onCancel} className="text-text-neutral/50 hover:text-text-neutral">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-text-neutral">
            Link do vídeo no YouTube
          </label>
          <input
            required
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="Ex.: https://www.youtube.com/watch?v=..."
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-text-neutral">Título</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex.: Culto Noturno | Domingo | 14/09/2026"
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
