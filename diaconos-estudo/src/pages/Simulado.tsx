import { useEffect, useState } from "react";
import { obterConteudo } from "../data/useConteudo";
import type { PerguntaOral } from "../data/schema";
import { sortearSimulado } from "../lib/simulado";
import { calcularAutoavaliacao } from "../lib/autoavaliacao";
import { lerStorage, salvarStorage } from "../lib/storage";
import FonteInfo from "../components/FonteInfo";
import { SeloConferir, SeloEssencial } from "../components/Selos";

const QUANTIDADE_PERGUNTAS = 12;
const DURACAO_TOTAL_SEGUNDOS = 30 * 60;
const CHAVE_HISTORICO = "simulado-historico";

interface TentativaHistorico {
  data: string;
  notaGeral: number;
  notasPorTema: Record<string, number>;
}

type Fase = "intro" | "prova" | "revisao";

export default function Simulado() {
  const conteudo = obterConteudo();
  const [fase, setFase] = useState<Fase>("intro");
  const [perguntas, setPerguntas] = useState<PerguntaOral[]>([]);
  const [indice, setIndice] = useState(0);
  const [segundosRestantes, setSegundosRestantes] = useState(DURACAO_TOTAL_SEGUNDOS);
  const [marcadosPorPergunta, setMarcadosPorPergunta] = useState<Record<string, Set<number>>>({});
  const [historico, setHistorico] = useState<TentativaHistorico[]>(() => lerStorage(CHAVE_HISTORICO, []));

  useEffect(() => {
    if (fase !== "prova" || segundosRestantes <= 0) return;
    const id = setTimeout(() => setSegundosRestantes((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [fase, segundosRestantes]);

  useEffect(() => {
    if (fase === "prova" && segundosRestantes === 0) {
      setFase("revisao");
    }
  }, [fase, segundosRestantes]);

  function iniciar() {
    const sorteadas = sortearSimulado(conteudo.perguntasOrais, QUANTIDADE_PERGUNTAS);
    setPerguntas(sorteadas);
    setIndice(0);
    setSegundosRestantes(DURACAO_TOTAL_SEGUNDOS);
    setMarcadosPorPergunta({});
    setFase("prova");
  }

  function avancar() {
    if (indice + 1 >= perguntas.length) {
      setFase("revisao");
    } else {
      setIndice((i) => i + 1);
    }
  }

  function alternarPonto(perguntaId: string, i: number) {
    setMarcadosPorPergunta((prev) => {
      const atual = new Set(prev[perguntaId] ?? []);
      if (atual.has(i)) atual.delete(i);
      else atual.add(i);
      return { ...prev, [perguntaId]: atual };
    });
  }

  function finalizarRevisao() {
    const notasPorTema: Record<string, { soma: number; qtd: number }> = {};
    let somaGeral = 0;

    for (const p of perguntas) {
      const marcados = marcadosPorPergunta[p.id]?.size ?? 0;
      const score = calcularAutoavaliacao(p.pontosChave.length, marcados);
      somaGeral += score;
      if (!notasPorTema[p.temaId]) notasPorTema[p.temaId] = { soma: 0, qtd: 0 };
      notasPorTema[p.temaId].soma += score;
      notasPorTema[p.temaId].qtd += 1;
    }

    const notaGeral = perguntas.length > 0 ? Math.round(somaGeral / perguntas.length) : 0;
    const notasFinais: Record<string, number> = {};
    for (const [temaId, { soma, qtd }] of Object.entries(notasPorTema)) {
      notasFinais[temaId] = Math.round(soma / qtd);
    }

    const nova: TentativaHistorico = { data: new Date().toISOString(), notaGeral, notasPorTema: notasFinais };
    const novoHistorico = [nova, ...historico].slice(0, 10);
    setHistorico(novoHistorico);
    salvarStorage(CHAVE_HISTORICO, novoHistorico);
    setFase("intro");
  }

  if (fase === "intro") {
    return (
      <div className="flex flex-col gap-6">
        <div className="cartao">
          <h2 className="mb-2 text-lg font-semibold">Simulado do concílio</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {QUANTIDADE_PERGUNTAS} perguntas sorteadas de todos os temas, com peso maior para as que mais caem na
            banca. Pelo menos uma pergunta de cada grupo essencial aparece. Cronômetro total de 30 minutos. Você
            não vê as respostas durante a prova — só na revisão final.
          </p>
          <button className="botao-primario mt-4" onClick={iniciar}>
            Começar simulado
          </button>
        </div>

        {historico.length > 0 && (
          <div className="cartao">
            <h3 className="mb-2 font-medium">Últimas tentativas</h3>
            <ul className="flex flex-col gap-1 text-sm">
              {historico.map((h, i) => (
                <li key={i} className="flex justify-between">
                  <span>{new Date(h.data).toLocaleDateString("pt-BR")}</span>
                  <span>{h.notaGeral}%</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  if (fase === "prova") {
    const pergunta = perguntas[indice];
    if (!pergunta) return null;
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between text-sm">
          <span>
            Pergunta {indice + 1} de {perguntas.length}
          </span>
          <span className="font-mono tabular-nums" aria-live="polite">
            {String(Math.floor(segundosRestantes / 60)).padStart(2, "0")}:
            {String(segundosRestantes % 60).padStart(2, "0")}
          </span>
        </div>
        <div className="cartao flex flex-col gap-2">
          {pergunta.essencial && <SeloEssencial />}
          <p className="text-lg font-medium">{pergunta.pergunta}</p>
          <p className="text-sm text-slate-500">Fale sua resposta em voz alta. As respostas serão revisadas ao final.</p>
        </div>
        <button className="botao-primario" onClick={avancar}>
          {indice + 1 >= perguntas.length ? "Terminar e revisar" : "Próxima pergunta"}
        </button>
      </div>
    );
  }

  // fase === "revisao"
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Revisão do simulado</h2>
      {perguntas.map((p) => (
        <div key={p.id} className="cartao flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            {p.essencial && <SeloEssencial />}
            {p.verificar && <SeloConferir />}
          </div>
          <p className="font-medium">{p.pergunta}</p>
          <p className="rounded-lg bg-slate-50 p-2 text-sm dark:bg-slate-800">{p.respostaModelo}</p>
          <FonteInfo fonte={p.fonte} />
          <div>
            <p className="mb-1 text-sm font-medium">O que você disse:</p>
            <ul className="flex flex-col gap-1">
              {p.pontosChave.map((ponto, i) => (
                <li key={i}>
                  <label className="flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-200 px-3 dark:border-slate-700">
                    <input
                      type="checkbox"
                      checked={marcadosPorPergunta[p.id]?.has(i) ?? false}
                      onChange={() => alternarPonto(p.id, i)}
                    />
                    <span>{ponto}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
      <button className="botao-primario" onClick={finalizarRevisao}>
        Salvar resultado
      </button>
    </div>
  );
}
