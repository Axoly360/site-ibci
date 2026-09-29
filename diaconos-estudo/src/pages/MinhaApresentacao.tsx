import { useEffect, useState } from "react";
import {
  BLOCOS_PADRAO,
  montarRoteiroCompleto,
  moverBloco,
  novoBloco,
  type BlocoApresentacao,
} from "../lib/apresentacao";
import { estimarSegundosDeFala, formatarDuracao } from "../lib/tempoFala";
import { lerStorage, salvarStorage, removerStorage } from "../lib/storage";

const CHAVE_BLOCOS = "apresentacao-blocos";

type Modo = "editar" | "ensaio" | "sequencia" | "roteiro";

export default function MinhaApresentacao() {
  const [blocos, setBlocos] = useState<BlocoApresentacao[]>(() => lerStorage(CHAVE_BLOCOS, BLOCOS_PADRAO));
  const [modo, setModo] = useState<Modo>("editar");

  useEffect(() => {
    salvarStorage(CHAVE_BLOCOS, blocos);
  }, [blocos]);

  function atualizarTexto(id: string, texto: string) {
    setBlocos((prev) => prev.map((b) => (b.id === id ? { ...b, texto } : b)));
  }

  function alternarPrecisaMelhorar(id: string) {
    setBlocos((prev) => prev.map((b) => (b.id === id ? { ...b, precisaMelhorar: !b.precisaMelhorar } : b)));
  }

  function remover(id: string) {
    setBlocos((prev) => prev.filter((b) => b.id !== id));
  }

  function mover(indice: number, direcao: -1 | 1) {
    setBlocos((prev) => moverBloco(prev, indice, direcao));
  }

  function adicionar() {
    const pergunta = window.prompt("Nova pergunta para o seu roteiro:");
    if (!pergunta || !pergunta.trim()) return;
    setBlocos((prev) => [...prev, novoBloco(pergunta.trim())]);
  }

  function apagarTudo() {
    if (!window.confirm("Apagar todos os textos da sua apresentação? Essa ação não pode ser desfeita.")) return;
    setBlocos(BLOCOS_PADRAO);
    removerStorage(CHAVE_BLOCOS);
  }

  const tempoTotalSegundos = blocos.reduce((soma, b) => soma + estimarSegundosDeFala(b.texto), 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="cartao no-print text-sm">
        <p className="font-medium">🔒 Privacidade</p>
        <p className="text-slate-600 dark:text-slate-300">
          Tudo o que você escreve aqui fica salvo apenas neste aparelho (no seu navegador). Nada é enviado para
          servidor, repositório ou para qualquer assistente de IA. Você pode apagar tudo quando quiser.
        </p>
      </div>

      <div className="no-print flex flex-wrap gap-2 text-sm">
        {(["editar", "ensaio", "sequencia", "roteiro"] as Modo[]).map((m) => (
          <button key={m} className={modo === m ? "botao-primario" : "botao-secundario"} onClick={() => setModo(m)}>
            {{ editar: "Editar blocos", ensaio: "Modo ensaio", sequencia: "Modo sequência", roteiro: "Roteiro completo" }[m]}
          </button>
        ))}
      </div>

      {modo === "editar" && (
        <EditarBlocos
          blocos={blocos}
          onAtualizarTexto={atualizarTexto}
          onRemover={remover}
          onMover={mover}
          onAdicionar={adicionar}
          onApagarTudo={apagarTudo}
        />
      )}
      {modo === "ensaio" && (
        <ModoEnsaio blocos={blocos} onAlternarPrecisaMelhorar={alternarPrecisaMelhorar} />
      )}
      {modo === "sequencia" && <ModoSequencia blocos={blocos} tempoTotalSegundos={tempoTotalSegundos} />}
      {modo === "roteiro" && <RoteiroCompleto blocos={blocos} />}
    </div>
  );
}

function EditarBlocos({
  blocos,
  onAtualizarTexto,
  onRemover,
  onMover,
  onAdicionar,
  onApagarTudo,
}: {
  blocos: BlocoApresentacao[];
  onAtualizarTexto: (id: string, texto: string) => void;
  onRemover: (id: string) => void;
  onMover: (indice: number, direcao: -1 | 1) => void;
  onAdicionar: () => void;
  onApagarTudo: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      {blocos.map((bloco, i) => {
        const segundos = estimarSegundosDeFala(bloco.texto);
        const dentroDaMeta = segundos >= 25 && segundos <= 70;
        return (
          <div key={bloco.id} className="cartao flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium">{bloco.pergunta}</p>
              <div className="flex shrink-0 gap-1">
                <button className="botao-secundario px-2" onClick={() => onMover(i, -1)} aria-label="Mover para cima">
                  ↑
                </button>
                <button className="botao-secundario px-2" onClick={() => onMover(i, 1)} aria-label="Mover para baixo">
                  ↓
                </button>
                <button className="botao-secundario px-2" onClick={() => onRemover(bloco.id)} aria-label="Remover bloco">
                  ✕
                </button>
              </div>
            </div>
            {bloco.dica && <p className="text-xs text-slate-500">{bloco.dica}</p>}
            <textarea
              className="min-h-[100px] rounded-lg border border-slate-300 bg-white p-2 dark:border-slate-700 dark:bg-slate-900"
              value={bloco.texto}
              onChange={(e) => onAtualizarTexto(bloco.id, e.target.value)}
              placeholder="Escreva aqui, com suas próprias palavras..."
            />
            <p className={`text-xs ${dentroDaMeta ? "text-green-600" : "text-slate-400"}`}>
              Tempo estimado de fala: {formatarDuracao(segundos)} (meta: 30 a 60 segundos)
            </p>
          </div>
        );
      })}
      <button className="botao-secundario" onClick={onAdicionar}>
        + Adicionar pergunta própria
      </button>
      <button className="botao-secundario text-red-600" onClick={onApagarTudo}>
        Apagar tudo
      </button>
    </div>
  );
}

function ModoEnsaio({
  blocos,
  onAlternarPrecisaMelhorar,
}: {
  blocos: BlocoApresentacao[];
  onAlternarPrecisaMelhorar: (id: string) => void;
}) {
  const [indice, setIndice] = useState(0);
  const [revelado, setRevelado] = useState(false);
  const [segundos, setSegundos] = useState(0);
  const [rodando, setRodando] = useState(false);

  useEffect(() => {
    if (!rodando) return;
    const id = setTimeout(() => setSegundos((s) => s + 1), 1000);
    return () => clearTimeout(id);
  }, [rodando, segundos]);

  const bloco = blocos[indice];
  if (!bloco) return <p>Nenhum bloco cadastrado ainda.</p>;

  function proximo() {
    setRevelado(false);
    setRodando(false);
    setSegundos(0);
    setIndice((i) => (i + 1) % blocos.length);
  }

  return (
    <div className="cartao flex flex-col gap-3">
      <p className="text-xs text-slate-400">
        Bloco {indice + 1} de {blocos.length}
      </p>
      <p className="text-lg font-medium">{bloco.pergunta}</p>
      <p className="font-mono text-2xl tabular-nums">
        {String(Math.floor(segundos / 60)).padStart(2, "0")}:{String(segundos % 60).padStart(2, "0")}
      </p>
      {!rodando && (
        <button className="botao-secundario self-start" onClick={() => setRodando(true)}>
          Iniciar cronômetro e falar
        </button>
      )}
      {!revelado ? (
        <button className="botao-primario self-start" onClick={() => setRevelado(true)}>
          Ver meu texto
        </button>
      ) : (
        <p className="rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800">
          {bloco.texto || "(você ainda não escreveu nada para este bloco)"}
        </p>
      )}
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={bloco.precisaMelhorar} onChange={() => onAlternarPrecisaMelhorar(bloco.id)} />
        Precisa melhorar
      </label>
      <button className="botao-secundario self-start" onClick={proximo}>
        Próximo bloco
      </button>
    </div>
  );
}

function ModoSequencia({ blocos, tempoTotalSegundos }: { blocos: BlocoApresentacao[]; tempoTotalSegundos: number }) {
  const [indice, setIndice] = useState(0);
  const [concluido, setConcluido] = useState(false);
  const bloco = blocos[indice];

  if (concluido || !bloco) {
    return (
      <div className="cartao text-center">
        <p className="text-lg font-medium">Apresentação concluída!</p>
        <p className="text-sm text-slate-500">Tempo total estimado: {formatarDuracao(tempoTotalSegundos)}</p>
        <button
          className="botao-secundario mt-3"
          onClick={() => {
            setIndice(0);
            setConcluido(false);
          }}
        >
          Recomeçar
        </button>
      </div>
    );
  }

  return (
    <div className="cartao flex flex-col gap-3">
      <p className="text-xs text-slate-400">
        Bloco {indice + 1} de {blocos.length}
      </p>
      <p className="text-lg font-medium">{bloco.pergunta}</p>
      <p className="rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800">
        {bloco.texto || "(sem texto — fale livremente)"}
      </p>
      <button
        className="botao-primario self-start"
        onClick={() => {
          if (indice + 1 >= blocos.length) setConcluido(true);
          else setIndice((i) => i + 1);
        }}
      >
        {indice + 1 >= blocos.length ? "Concluir" : "Próximo"}
      </button>
    </div>
  );
}

function RoteiroCompleto({ blocos }: { blocos: BlocoApresentacao[] }) {
  const texto = montarRoteiroCompleto(blocos);
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      window.alert("Não foi possível copiar automaticamente. Selecione o texto manualmente.");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="no-print flex gap-2">
        <button className="botao-secundario" onClick={copiar}>
          {copiado ? "Copiado!" : "Copiar texto"}
        </button>
        <button className="botao-secundario" onClick={() => window.print()}>
          Imprimir
        </button>
      </div>
      <div className="cartao whitespace-pre-wrap leading-relaxed">
        {texto || "Você ainda não escreveu nenhum bloco."}
      </div>
    </div>
  );
}
