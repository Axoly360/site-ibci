import type { Fonte } from "../data/schema";

const ROTULOS: Record<Fonte["tipo"], string> = {
  apostila: "Apostila",
  "banca-anterior": "Banca anterior",
  "video-concilio": "Vídeo de um concílio real",
  complemento: "Complemento (fora da apostila)",
};

export default function FonteInfo({ fonte }: { fonte: Fonte }) {
  const partes = [ROTULOS[fonte.tipo]];
  if (fonte.secao) partes.push(fonte.secao);
  if (fonte.pagina) partes.push(`pág. ${fonte.pagina}`);
  return <p className="text-xs text-slate-500 dark:text-slate-400">Fonte: {partes.join(" — ")}</p>;
}
