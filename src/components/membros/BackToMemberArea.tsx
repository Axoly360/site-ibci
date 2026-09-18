import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function BackToMemberArea() {
  return (
    <Link
      href="/central-do-membro/area"
      className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-secondary hover:underline"
    >
      <ArrowLeft className="h-4 w-4" />
      Voltar para o menu principal
    </Link>
  );
}
