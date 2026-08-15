import { PlayCircle, HeartHandshake } from "lucide-react";
import { churchInfo } from "@/data/churchInfo";
import Button from "@/components/ui/Button";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-primary text-white">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, #D4AF37 0%, transparent 45%), radial-gradient(circle at 80% 60%, #D4AF37 0%, transparent 40%)",
        }}
      />
      <div className="relative mx-auto flex max-w-5xl flex-col items-center px-4 py-24 text-center sm:px-6 sm:py-32 lg:px-8">
        <span className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-secondary">
          {churchInfo.fullName}
        </span>
        <h1 className="mt-6 font-heading text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
          Uma família para pertencer,
          <br className="hidden sm:block" /> um lugar para servir.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-white/80">
          Bem-vindo à Igreja Batista Central do Ibura.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Button href={churchInfo.social.youtube} external variant="primary" size="lg">
            <PlayCircle className="h-5 w-5" />
            Assistir Ao Vivo
          </Button>
          <Button href="/quem-somos" variant="outline" size="lg">
            <HeartHandshake className="h-5 w-5" />
            Sou Novo Aqui
          </Button>
        </div>
      </div>
    </section>
  );
}
