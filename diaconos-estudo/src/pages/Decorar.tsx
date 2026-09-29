import { useState } from "react";
import { obterConteudo } from "../data/useConteudo";
import type { Lista, Versiculo } from "../data/schema";
import { SeloConferir, SeloEssencial } from "../components/Selos";
import { embaralhar } from "../lib/shuffle";
import { aplicarResultado, estadoInicial, type EstadoLeitner } from "../lib/leitner";
import { lerStorage, salvarStorage } from "../lib/storage";

const CHAVE_LEITNER_VERSICULOS = "decorar-versiculos-leitner";

export default function Decorar() {
  const [modo, setModo] = useState<"listas" | "versiculos">("listas");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <button
          className={modo === "listas" ? "botao-primario" : "botao-secundario"}
          onClick={() => setModo("listas")}
        >
          Listas
        </button>
        <button
          className={modo === "versiculos" ? "botao-primario" : "botao-secundario"}
          onClick={() => setModo("versiculos")}
        >
          Versículos
        </button>
      </div>
      {modo === "listas" ? <ModoListas /> : <ModoVersiculos />}
    </div>
  );
}

function ModoListas() {
  const conteudo = obterConteudo();
  const [selecionada, setSelecionada] = useState<Lista | null>(null);
  const [revelados, setRevelados] = useState(0);

  if (!selecionada) {
    return (
      <ul className="flex flex-col gap-2">
        {conteudo.listas.map((l) => (
          <li key={l.id}>
            <button
              className="cartao flex w-full items-center justify-between text-left"
              onClick={() => {
                setSelecionada(l);
                setRevelados(0);
              }}
            >
              <span>{l.titulo}</span>
              <span className="flex gap-1">
                {l.essencial && <SeloEssencial />}
                {l.verificar && <SeloConferir />}
              </span>
            </button>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="cartao flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">{selecionada.titulo}</h2>
        <button className="botao-secundario" onClick={() => setSelecionada(null)}>
          Voltar
        </button>
      </div>
      <p className="text-sm text-slate-500">
        Tente recitar {selecionada.ordenada ? "na ordem" : "todos os itens"} antes de tocar para revelar.
      </p>
      <ul className="flex flex-col gap-2">
        {selecionada.itens.map((item, i) => (
          <li key={i}>
            {i < revelados ? (
              <div className="rounded-lg border border-accent/30 bg-accent/5 px-3 py-2">{item}</div>
            ) : (
              <button
                className="w-full rounded-lg border border-dashed border-slate-300 px-3 py-2 text-left text-slate-400 dark:border-slate-700"
                onClick={() => setRevelados((r) => Math.max(r, i + 1))}
              >
                Toque para revelar o item {i + 1}
              </button>
            )}
          </li>
        ))}
      </ul>
      <p className="text-sm text-slate-500">
        {revelados} de {selecionada.itens.length} revelados
      </p>
      {revelados >= selecionada.itens.length && (
        <button className="botao-secundario self-start" onClick={() => setRevelados(0)}>
          Recomeçar
        </button>
      )}
    </div>
  );
}

function ModoVersiculos() {
  const conteudo = obterConteudo();
  const [ordem, setOrdem] = useState<Versiculo[]>(() => embaralhar(conteudo.versiculos));
  const [indice, setIndice] = useState(0);
  const [virado, setVirado] = useState(false);
  const [direcao, setDirecao] = useState<"tema-para-ref" | "ref-para-tema">("tema-para-ref");
  const [leitner, setLeitner] = useState<Record<string, EstadoLeitner>>(() => lerStorage(CHAVE_LEITNER_VERSICULOS, {}));

  const atual = ordem[indice];
  if (!atual) return null;

  function proximo(sabia: boolean) {
    const estadoAtual = leitner[atual.id] ?? estadoInicial();
    const novoEstado = aplicarResultado(estadoAtual, sabia ? 100 : 0);
    const novoLeitner = { ...leitner, [atual.id]: novoEstado };
    setLeitner(novoLeitner);
    salvarStorage(CHAVE_LEITNER_VERSICULOS, novoLeitner);

    if (indice + 1 >= ordem.length) {
      setOrdem(embaralhar(conteudo.versiculos));
      setIndice(0);
    } else {
      setIndice((i) => i + 1);
    }
    setVirado(false);
  }

  const frente = direcao === "tema-para-ref" ? atual.tema : atual.referencia;
  const verso = direcao === "tema-para-ref" ? atual.referencia : atual.tema;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 text-sm">
        <button
          className={direcao === "tema-para-ref" ? "botao-primario" : "botao-secundario"}
          onClick={() => setDirecao("tema-para-ref")}
        >
          Tema → Referência
        </button>
        <button
          className={direcao === "ref-para-tema" ? "botao-primario" : "botao-secundario"}
          onClick={() => setDirecao("ref-para-tema")}
        >
          Referência → Tema
        </button>
      </div>

      <button
        className="cartao flex min-h-[160px] flex-col items-center justify-center gap-2 text-center"
        onClick={() => setVirado((v) => !v)}
      >
        {atual.verificar && <SeloConferir />}
        <p className="text-lg font-medium">{virado ? verso : frente}</p>
        {virado && atual.textoCurto && <p className="text-sm text-slate-500">{atual.textoCurto}</p>}
        <p className="text-xs text-slate-400">{virado ? "toque para voltar" : "toque para revelar"}</p>
      </button>

      <div className="flex gap-2">
        <button className="botao-secundario" onClick={() => proximo(false)}>
          Não sabia
        </button>
        <button className="botao-primario" onClick={() => proximo(true)}>
          Sabia ✓
        </button>
      </div>

      <p className="text-center text-xs text-slate-400">
        {indice + 1} de {ordem.length}
      </p>
    </div>
  );
}
