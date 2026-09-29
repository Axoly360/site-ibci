import { Link } from "react-router-dom";
import { obterConteudo, GRUPOS_ESSENCIAIS } from "../data/useConteudo";
import { lerStorage, salvarStorage, listarChavesStorage, removerStorage } from "../lib/storage";
import { contarDominados, type MapaProgressoEssenciais } from "../lib/essenciais";
import { useRef, useState } from "react";

const CARTOES = [
  { to: "/sabatina", titulo: "Sabatina oral", descricao: "O modo principal: pergunta, fala, revela e autoavalia.", icone: "🗣️" },
  { to: "/decorar", titulo: "Decorar listas e versículos", descricao: "Flashcards de listas e do mapa versículo → tema.", icone: "🧠" },
  { to: "/quiz", titulo: "Quiz", descricao: "Múltipla escolha, com a Trilha Essenciais em destaque.", icone: "✅", destaque: true },
  { to: "/simulado", titulo: "Simulado do concílio", descricao: "12 perguntas, 30 minutos, revisão ao final.", icone: "⏱️" },
  { to: "/apresentacao", titulo: "Minha apresentação", descricao: "Monte sua fala, bloco a bloco, na ordem do concílio.", icone: "📝", destaque: true },
  { to: "/concilio", titulo: "Como é o concílio", descricao: "O rito, passo a passo, e como a banca decide.", icone: "ℹ️" },
];

interface TentativaHistorico {
  data: string;
  notaGeral: number;
  notasPorTema: Record<string, number>;
}

export default function Painel() {
  const conteudo = obterConteudo();
  const inputRef = useRef<HTMLInputElement>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);

  const progressoEssenciais = lerStorage<MapaProgressoEssenciais>("essenciais-progresso", {});
  const dominados = contarDominados(progressoEssenciais, GRUPOS_ESSENCIAIS.map((g) => g.id));

  const historico = lerStorage<TentativaHistorico[]>("simulado-historico", []);
  const ultimaTentativa = historico[0];
  const temasFracos = ultimaTentativa
    ? Object.entries(ultimaTentativa.notasPorTema)
        .sort((a, b) => a[1] - b[1])
        .slice(0, 3)
        .map(([temaId, nota]) => ({
          titulo: conteudo.temas.find((t) => t.id === temaId)?.titulo ?? temaId,
          nota,
        }))
    : [];

  function exportarProgresso() {
    const dados: Record<string, unknown> = {};
    for (const chave of listarChavesStorage()) {
      dados[chave] = lerStorage(chave, null);
    }
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "progresso-diaconos.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function importarProgresso(arquivo: File) {
    const leitor = new FileReader();
    leitor.onload = () => {
      try {
        const dados = JSON.parse(String(leitor.result));
        for (const [chave, valor] of Object.entries(dados)) {
          salvarStorage(chave, valor);
        }
        setMensagem("Progresso importado com sucesso! Recarregue a página para ver tudo atualizado.");
      } catch {
        setMensagem("Não foi possível ler esse arquivo. Verifique se é um export válido.");
      }
    };
    leitor.readAsText(arquivo);
  }

  function zerarProgresso() {
    if (!window.confirm("Isso vai apagar todo o seu progresso salvo neste aparelho. Tem certeza?")) return;
    for (const chave of listarChavesStorage()) removerStorage(chave);
    setMensagem("Progresso zerado.");
  }

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h2 className="mb-1 text-lg font-semibold">🏆 Trilha Essenciais</h2>
        <p className="text-sm text-slate-500">
          {dominados} de {GRUPOS_ESSENCIAIS.length} grupos dominados
        </p>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div className="h-full bg-accent" style={{ width: `${(dominados / GRUPOS_ESSENCIAIS.length) * 100}%` }} />
        </div>
      </section>

      {temasFracos.length > 0 && (
        <section>
          <h2 className="mb-2 text-lg font-semibold">Temas mais fracos (último simulado)</h2>
          <ul className="flex flex-col gap-2">
            {temasFracos.map((t) => (
              <li key={t.titulo} className="cartao flex items-center justify-between">
                <span>{t.titulo}</span>
                <span className="text-sm text-slate-500">{t.nota}%</span>
              </li>
            ))}
          </ul>
          <Link to="/sabatina" className="botao-secundario mt-2 inline-block">
            Estudar meus pontos fracos
          </Link>
        </section>
      )}

      <section>
        <h2 className="mb-2 text-lg font-semibold">Modos de estudo</h2>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {CARTOES.map((c) => (
            <li key={c.to}>
              <Link
                to={c.to}
                className={`cartao flex h-full flex-col gap-1 ${c.destaque ? "border-accent" : ""}`}
              >
                <span className="text-2xl">{c.icone}</span>
                <span className="font-medium">{c.titulo}</span>
                <span className="text-sm text-slate-500">{c.descricao}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="cartao flex flex-col gap-2">
        <h2 className="font-semibold">Seu progresso</h2>
        <div className="flex flex-wrap gap-2">
          <button className="botao-secundario" onClick={exportarProgresso}>
            Exportar progresso (JSON)
          </button>
          <button className="botao-secundario" onClick={() => inputRef.current?.click()}>
            Importar progresso
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const arquivo = e.target.files?.[0];
              if (arquivo) importarProgresso(arquivo);
            }}
          />
          <button className="botao-secundario text-red-600" onClick={zerarProgresso}>
            Zerar progresso
          </button>
        </div>
        {mensagem && <p className="text-sm text-slate-600 dark:text-slate-300">{mensagem}</p>}
      </section>

      <footer className="pb-4 pt-2 text-center text-xs text-slate-400">
        Material de apoio ao estudo. O conteúdo oficial é a apostila do curso e a orientação do seu pastor.
      </footer>
    </div>
  );
}
