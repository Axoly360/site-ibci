import { Tv } from "lucide-react";
import { churchInfo } from "@/data/churchInfo";
import { sermonVideos } from "@/data/sermonVideos";
import Button from "@/components/ui/Button";
import Carousel from "@/components/ui/Carousel";

export default function LatestSermonSection() {
  return (
    <section id="mensagens" className="bg-primary/[0.03] py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold text-primary sm:text-4xl">
            Última Mensagem
          </h2>
          <p className="mt-3 text-text-neutral/80">
            Assista à transmissão mais recente da nossa igreja.
          </p>
        </div>

        <div className="mt-10">
          <Carousel>
            {sermonVideos.length > 0
              ? sermonVideos.map((video) => (
                  <a
                    key={video.id}
                    href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-64 shrink-0 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm sm:w-72"
                  >
                    <div className="aspect-video bg-black/80">
                      <img
                        src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                        alt={video.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <p className="line-clamp-2 text-sm font-semibold text-primary">
                        {video.title}
                      </p>
                    </div>
                  </a>
                ))
              : Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex aspect-video w-64 shrink-0 items-center justify-center rounded-2xl border border-dashed border-primary/20 bg-primary/5 text-sm text-text-neutral/50 sm:w-72"
                  >
                    Em breve
                  </div>
                ))}
          </Carousel>
        </div>

        <div className="mt-8 flex justify-center">
          <Button href={churchInfo.social.youtube} external variant="secondary">
            <Tv className="h-5 w-5" />
            Inscreva-se no nosso canal
          </Button>
        </div>
      </div>
    </section>
  );
}
