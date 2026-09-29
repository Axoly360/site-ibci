import { useMemo, useState } from "react";
import type { QuizItem } from "../data/schema";
import { embaralhar } from "../lib/shuffle";
import { SeloConferir } from "./Selos";
import FonteInfo from "./FonteInfo";

interface Props {
  perguntas: QuizItem[];
  onFinalizar: (acertos: number, total: number) => void;
}

export default function ExecutarQuiz({ perguntas, onFinalizar }: Props) {
  const perguntasEmbaralhadas = useMemo(
    () => embaralhar(perguntas).map((p) => ({ ...p, alternativas: embaralhar(p.alternativas) })),
    [perguntas],
  );
  const [indice, setIndice] = useState(0);
  const [resposta, setResposta] = useState<string | null>(null);
  const [acertos, setAcertos] = useState(0);

  const atual = perguntasEmbaralhadas[indice];
  if (!atual) return null;

  function escolher(idAlternativa: string) {
    if (resposta) return;
    setResposta(idAlternativa);
    if (idAlternativa === atual.correta) setAcertos((a) => a + 1);
  }

  function proxima() {
    if (indice + 1 >= perguntasEmbaralhadas.length) {
      onFinalizar(acertos, perguntasEmbaralhadas.length);
      return;
    }
    setIndice((i) => i + 1);
    setResposta(null);
  }

  return (
    <div className="cartao flex flex-col gap-3">
      <p className="text-xs text-slate-400">
        Pergunta {indice + 1} de {perguntasEmbaralhadas.length}
      </p>
      <p className="text-lg font-medium">{atual.enunciado}</p>
      <ul className="flex flex-col gap-2">
        {atual.alternativas.map((alt) => {
          const selecionada = resposta === alt.id;
          const correta = atual.correta === alt.id;
          let estilo = "border-slate-200 dark:border-slate-700";
          if (resposta) {
            if (correta) estilo = "border-green-500 bg-green-50 dark:bg-green-900/30";
            else if (selecionada) estilo = "border-red-500 bg-red-50 dark:bg-red-900/30";
          }
          return (
            <li key={alt.id}>
              <button
                className={`min-h-[44px] w-full rounded-lg border px-3 py-2 text-left ${estilo}`}
                onClick={() => escolher(alt.id)}
                disabled={!!resposta}
              >
                {alt.texto}
              </button>
            </li>
          );
        })}
      </ul>

      {resposta && (
        <div className="flex flex-col gap-2" aria-live="polite">
          <p className={resposta === atual.correta ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}>
            {resposta === atual.correta ? "Certo!" : "Não foi dessa vez."}
          </p>
          <p className="text-sm">{atual.explicacao}</p>
          {atual.verificar && <SeloConferir />}
          <FonteInfo fonte={atual.fonte} />
          <button className="botao-primario self-start" onClick={proxima}>
            {indice + 1 >= perguntasEmbaralhadas.length ? "Ver resultado" : "Próxima"}
          </button>
        </div>
      )}
    </div>
  );
}
