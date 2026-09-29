import { useState } from "react";
import { obterConteudo, GRUPOS_ESSENCIAIS } from "../data/useConteudo";
import ExecutarQuiz from "../components/ExecutarQuiz";
import {
  contarDominados,
  estaDominado,
  registrarSessao,
  type MapaProgressoEssenciais,
} from "../lib/essenciais";
import { lerStorage, salvarStorage } from "../lib/storage";

const CHAVE_PROGRESSO = "essenciais-progresso";

export default function Quiz() {
  const conteudo = obterConteudo();
  const [progresso, setProgresso] = useState<MapaProgressoEssenciais>(() => lerStorage(CHAVE_PROGRESSO, {}));
  const [grupoAtivo, setGrupoAtivo] = useState<string | null>(null);
  const [temaAtivo, setTemaAtivo] = useState<string | null>(null);
  const [resultado, setResultado] = useState<{ acertos: number; total: number } | null>(null);

  const dominados = contarDominados(progresso, GRUPOS_ESSENCIAIS.map((g) => g.id));

  function finalizarGrupo(grupoId: string, acertos: number, total: number) {
    const todasCorretas = acertos === total;
    const novoProgresso = registrarSessao(progresso, grupoId, todasCorretas);
    setProgresso(novoProgresso);
    salvarStorage(CHAVE_PROGRESSO, novoProgresso);
    setResultado({ acertos, total });
    setGrupoAtivo(null);
  }

  function finalizarTema(acertos: number, total: number) {
    setResultado({ acertos, total });
    setTemaAtivo(null);
  }

  if (grupoAtivo) {
    const perguntas = conteudo.quiz.filter((q) => q.grupoEssencial === grupoAtivo);
    return (
      <ExecutarQuiz
        perguntas={perguntas}
        onFinalizar={(acertos, total) => finalizarGrupo(grupoAtivo, acertos, total)}
      />
    );
  }

  if (temaAtivo) {
    const perguntas = conteudo.quiz.filter((q) => q.temaId === temaAtivo);
    return <ExecutarQuiz perguntas={perguntas} onFinalizar={finalizarTema} />;
  }

  return (
    <div className="flex flex-col gap-6">
      {resultado && (
        <div className="cartao text-center" aria-live="polite">
          <p className="text-lg font-medium">
            Você acertou {resultado.acertos} de {resultado.total}
          </p>
          <button className="botao-secundario mt-2" onClick={() => setResultado(null)}>
            Fechar
          </button>
        </div>
      )}

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold">🏆 Trilha Essenciais</h2>
          <span className="text-sm text-slate-500">Dominados: {dominados} de {GRUPOS_ESSENCIAIS.length}</span>
        </div>
        <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div
            className="h-full bg-accent transition-all"
            style={{ width: `${(dominados / GRUPOS_ESSENCIAIS.length) * 100}%` }}
          />
        </div>
        <ul className="flex flex-col gap-2">
          {GRUPOS_ESSENCIAIS.map((g) => {
            const dominado = estaDominado(progresso[g.id]);
            return (
              <li key={g.id}>
                <button className="cartao flex w-full items-center justify-between text-left" onClick={() => setGrupoAtivo(g.id)}>
                  <span>{g.titulo}</span>
                  <span>{dominado ? "✅" : "☆"}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">Quiz por tema</h2>
        <ul className="flex flex-col gap-2">
          {conteudo.temas
            .filter((t) => conteudo.quiz.some((q) => q.temaId === t.id))
            .map((t) => (
              <li key={t.id}>
                <button className="cartao flex w-full items-center justify-between text-left" onClick={() => setTemaAtivo(t.id)}>
                  <span>{t.titulo}</span>
                  <span className="text-sm text-slate-400">
                    {conteudo.quiz.filter((q) => q.temaId === t.id).length} perguntas
                  </span>
                </button>
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
}
