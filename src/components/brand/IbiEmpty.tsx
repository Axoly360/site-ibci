import Ibi from "@/components/brand/Ibi";

/** Estado vazio do painel: rosto do Ibi discreto ao lado da mensagem. */
export default function IbiEmpty({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-3">
      <Ibi pose="marca" size={44} />
      <p className="text-sm text-text-neutral/60">{children}</p>
    </div>
  );
}
