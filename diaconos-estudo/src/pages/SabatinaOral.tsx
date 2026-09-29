import { useEffect, useMemo, useState } from "react";
import { obterConteudo } from "../data/useConteudo";
import type { PerguntaOral } from "../data/schema";
import { embaralhar } from "../lib/shuffle";
import { calcularAutoavaliacao } from "../lib/autoavaliacao";
import { aplicarResultado, estadoInicial, type EstadoLeitner } from "../lib/leitner";
import { lerStorage, salvarStorage } from "../lib/storage";
import { SeloConferir, SeloEssencial } from "../components/Selos";
import FonteInfo from "../components/FonteInfo";

const CHAVE_LEITNER = "sabatina-leitner";
const CHAVE_ERROS = "sabatina-erros";

type MapaLeitner = Record<string, EstadoLeitner>;

export default function SabatinaOral() {
  const conteudo = obterConteudo();
  const [temaFiltro, setTemaFiltro] = useState<string>("todos");
  const [frequenciaFiltro, setFrequenciaFiltro] = useState<string>("todas");
  const [soErros, setSoErros] = useState(false);

  const [leitner, setLeitner] = useState<MapaLeitner>(() => lerStorage(CHAVE_LEITNER, {}));
  const [errosIds, setErrosIds] = useState<string[]>(() => lerStorage(CHAVE_ERROS, []));

  const banco = useMemo(() => {
    let lista = conteudo.perguntasOrais;
    if (temaFiltro !== "todos") lista = lista.filter((p) => p.temaId === temaFiltro);
    if (frequenciaFiltro !== "todas") lista = lista.filter((p) => p.frequenciaBanca === frequenciaFiltro);
    if (soErros) lista = lista.filter((p) => errosIds.includes(p.id));
    return lista;
  }, [conteudo, temaFiltro, frequenciaFiltro, soErros, errosIds]);

  const [ordem, setOrdem] = useState<PerguntaOral[]>(() => embaralhar(banco));
  const [indice, setIndice] = useState(0);
  const [revelado, setRevelado] = useState(false);
  const [marcados, setMarcados] = useState<Set<number>>(new Set());
  const [mostrarCronometro, setMostrarCronometro] = useState(true);
  const [segundosRestantes, setSegundosRestantes] = useState(60);
  const [cronometroAtivo, setCronometroAtivo] = useState(false);

  const pergunta = ordem[indice] as PerguntaOral | undefined;

  function reiniciarBanco() {
    setOrdem(embaralhar(banco));
    setIndice(0);
    setRevelado(false);
    setMarcados(new Set());
    setCronometroAtivo(false);
    setSegundosRestantes(60);
  }

  function proxima() {
    if (indice + 1 >= ordem.length) {
      reiniciarBanco();
      return;
    }
    setIndice((i) => i + 1);
    setRevelado(false);
    setMarcados(new Set());
    setCronometroAtivo(false);
    setSegundosRestantes(60);
  }

  function revelar() {
    setRevelado(true);
    setCronometroAtivo(false);
  }

  function alternarPonto(i: number) {
    setMarcados((prev) => {
      const novo = new Set(prev);
      if (novo.has(i)) novo.delete(i);
      else novo.add(i);
      return novo;
    });
  }

  function confirmarAutoavaliacao() {
    if (!pergunta) return;
    const score = calcularAutoavaliacao(pergunta.pontosChave.length, marcados.size);
    const estadoAtual = leitner[pergunta.id] ?? estadoInicial();
    const novoEstado = aplicarResultado(estadoAtual, score);
    const novoLeitner = { ...leitner, [pergunta.id]: novoEstado };
    setLeitner(novoLeitner);
    salvarStorage(CHAVE_LEITNER, novoLeitner);

    const acertou = score >= 70;
    const novosErros = acertou ? errosIds.filter((id) => id !== pergunta.id) : Array.from(new Set([...errosIds, pergunta.id]));
    setErrosIds(novosErros);
    salvarStorage(CHAVE_ERROS, novosErros);

    proxima();
  }

  if (banco.length === 0) {
    return (
      <div className="cartao">
        <p>Nenhuma pergunta encontrada com esses filtros.</p>
        <button className="botao-secundario mt-3" onClick={() => { setTemaFiltro("todos"); setFrequenciaFiltro("todas"); setSoErros(false); }}>
          Limpar filtros
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2 text-sm">
        <select
          className="rounded-lg border border-slate-300 bg-white px-2 py-2 dark:border-slate-700 dark:bg-slate-900"
          value={temaFiltro}
          onChange={(e) => { setTemaFiltro(e.target.value); }}
          aria-label="Filtrar por tema"
        >
          <option value="todos">Todos os temas</option>
          {conteudo.temas.map((t) => (
            <option key={t.id} value={t.id}>{t.titulo}</option>
          ))}
        </select>
        <select
          className="rounded-lg border border-slate-300 bg-white px-2 py-2 dark:border-slate-700 dark:bg-slate-900"
          value={frequenciaFiltro}
          onChange={(e) => { setFrequenciaFiltro(e.target.value); }}
          aria-label="Filtrar por frequência na banca"
        >
          <option value="todas">Qualquer frequência</option>
          <option value="alta">Cai bastante na banca</option>
          <option value="media">Frequência média</option>
          <option value="baixa">Frequência baixa</option>
        </select>
        <label className="flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-300 px-2 dark:border-slate-700">
          <input type="checkbox" checked={soErros} onChange={(e) => setSoErros(e.target.checked)} />
          Só o que eu errei
        </label>
      </div>

      <button className="botao-secundario self-start" onClick={reiniciarBanco}>
        🔀 Novo sorteio ({banco.length} perguntas)
      </button>

      {pergunta && (
        <div className="cartao flex flex-col gap-3" aria-live="polite">
          <div className="flex flex-wrap items-center gap-2">
            {pergunta.essencial && <SeloEssencial />}
            {pergunta.verificar && <SeloConferir />}
          </div>
          <p className="text-lg font-medium">{pergunta.pergunta}</p>

          {!revelado && (
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={mostrarCronometro}
                  onChange={(e) => setMostrarCronometro(e.target.checked)}
                />
                Usar cronômetro de 60s
              </label>
              {mostrarCronometro && (
                <TemporizadorSimples
                  segundos={segundosRestantes}
                  ativo={cronometroAtivo}
                  onTick={setSegundosRestantes}
                  onIniciar={() => setCronometroAtivo(true)}
                />
              )}
              <button className="botao-primario" onClick={revelar}>
                Ver resposta
              </button>
            </div>
          )}

          {revelado && (
            <div className="flex flex-col gap-4">
              <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                <p>{pergunta.respostaModelo}</p>
                {pergunta.versiculos.length > 0 && (
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    Versículos: {pergunta.versiculos.join("; ")}
                  </p>
                )}
                <div className="mt-2">
                  <FonteInfo fonte={pergunta.fonte} />
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium">Marque o que você conseguiu dizer:</p>
                <ul className="flex flex-col gap-2">
                  {pergunta.pontosChave.map((ponto, i) => (
                    <li key={i}>
                      <label className="flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 dark:border-slate-700">
                        <input type="checkbox" checked={marcados.has(i)} onChange={() => alternarPonto(i)} />
                        <span>{ponto}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300" aria-live="polite">
                Sua autoavaliação: {calcularAutoavaliacao(pergunta.pontosChave.length, marcados.size)}%
              </p>

              <div className="flex gap-2">
                <button className="botao-primario" onClick={confirmarAutoavaliacao}>
                  Confirmar e ir para a próxima
                </button>
                <a
                  className="botao-secundario"
                  href={`mailto:?subject=${encodeURIComponent(`Erro na pergunta ${pergunta.id}`)}&body=${encodeURIComponent(`Pergunta: ${pergunta.pergunta}`)}`}
                >
                  Reportar erro
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      <p className="text-center text-xs text-slate-400">
        {indice + 1} de {ordem.length}
      </p>
    </div>
  );
}

function TemporizadorSimples({
  segundos,
  ativo,
  onTick,
  onIniciar,
}: {
  segundos: number;
  ativo: boolean;
  onTick: (s: number) => void;
  onIniciar: () => void;
}) {
  useEffect(() => {
    if (!ativo || segundos <= 0) return;
    const id = setTimeout(() => onTick(segundos - 1), 1000);
    return () => clearTimeout(id);
  }, [ativo, segundos, onTick]);

  return (
    <div className="flex items-center gap-3">
      <span className="text-2xl font-mono tabular-nums" aria-live="polite">
        {String(Math.floor(segundos / 60)).padStart(2, "0")}:{String(segundos % 60).padStart(2, "0")}
      </span>
      {!ativo && (
        <button className="botao-secundario" onClick={onIniciar}>
          Iniciar
        </button>
      )}
    </div>
  );
}
