import { Construction, MessageCircle } from "lucide-react";
import { churchInfo } from "@/data/churchInfo";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface ComingSoonProps {
  /** Nome da seção, usado na mensagem (ex.: "conteúdo do ministério Pastoral"). */
  label: string;
}

/** Bloco reutilizável para páginas da nova árvore que ainda não têm conteúdo definitivo. */
export default function ComingSoon({ label }: ComingSoonProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <Card className="flex flex-col items-center gap-4 p-10 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Construction className="h-7 w-7" />
        </span>
        <h2 className="font-heading text-xl font-bold text-primary">
          Conteúdo em preparação
        </h2>
        <p className="max-w-md text-sm leading-relaxed text-text-neutral/80">
          Ainda estamos organizando {label}. Em breve esta página será
          atualizada com todas as informações.
        </p>
        <Button href={churchInfo.social.whatsapp} external variant="secondary">
          <MessageCircle className="h-5 w-5" />
          Falar com a igreja no WhatsApp
        </Button>
      </Card>
    </div>
  );
}
