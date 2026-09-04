import { extractYouTubeId } from "@/lib/youtube";

interface InstitutionalVideoSectionProps {
  title?: string;
  subtitle?: string;
  videoUrl?: string;
}

/** Vídeo institucional da igreja. */
export default function InstitutionalVideoSection({
  title = "Conheça a IBCI",
  subtitle = "Aqui vamos usar um vídeo institucional da igreja.",
  videoUrl = "https://www.youtube.com/watch?v=6QYUSWm85gY",
}: InstitutionalVideoSectionProps) {
  const videoId = extractYouTubeId(videoUrl);

  return (
    <section className="bg-primary/[0.03] py-20">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="font-heading text-3xl font-bold text-primary sm:text-4xl">
          {title}
        </h2>
        <p className="mt-3 text-text-neutral/80">{subtitle}</p>

        <div className="mx-auto mt-10 aspect-video w-full overflow-hidden rounded-2xl">
          <iframe
            className="h-full w-full"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="Vídeo institucional da IBCI"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}
