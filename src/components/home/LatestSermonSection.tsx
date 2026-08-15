import { Tv } from "lucide-react";
import { churchInfo } from "@/data/churchInfo";
import Button from "@/components/ui/Button";

export default function LatestSermonSection() {
  return (
    <section id="mensagens" className="bg-primary/[0.03] py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold text-primary sm:text-4xl">
            Última Mensagem
          </h2>
          <p className="mt-3 text-text-neutral/80">
            Assista à transmissão mais recente da nossa igreja.
          </p>
        </div>

        <div className="mx-auto mt-10 aspect-video w-full max-w-4xl overflow-hidden rounded-2xl border border-black/5 shadow-lg">
          <iframe
            className="h-full w-full"
            src="https://www.youtube.com/embed/live_stream?channel=UC_CHANNEL_ID"
            title="Última mensagem - IBCI"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
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
