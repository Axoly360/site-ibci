"use client";

import { useRouter } from "next/navigation";
import { FileText, CheckCircle2 } from "lucide-react";
import Card from "@/components/ui/Card";
import ApproveButton from "@/components/admin/ApproveButton";

export interface CongregationSubmissionRow {
  id: string;
  type: string;
  category: string;
  amount: string;
  entry_date: string;
  description: string | null;
  receipt_url: string | null;
  status: string;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

function formatCurrency(value: string) {
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function CongregationFinanceiroManager({
  slug,
  submissoes,
}: {
  slug: string;
  submissoes: CongregationSubmissionRow[];
}) {
  const router = useRouter();

  const selecionar = (id: string) => {
    router.push(`/admin/financeiro/lancamentos?congregacaoSubmissaoId=${id}`);
  };

  return (
    <Card className="p-6">
      <p className="mb-4 text-sm text-text-neutral/60">
        Clique em <strong>Aprovar</strong> para lançar direto com os dados enviados, ou marque a
        prestação de contas para revisar e ajustar no formulário antes de clicar em Lançar.
      </p>

      {submissoes.length === 0 ? (
        <p className="text-sm text-text-neutral/60">Nenhum lançamento enviado ainda.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-black/10 text-xs font-semibold uppercase tracking-wider text-text-neutral/50">
                <th className="py-2 pr-4">Ação</th>
                <th className="py-2 pr-4">Data</th>
                <th className="py-2 pr-4">Tipo</th>
                <th className="py-2 pr-4">Categoria</th>
                <th className="py-2 pr-4">Descrição</th>
                <th className="py-2 pr-4">Comprovante</th>
                <th className="py-2 pr-4 text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {submissoes.map((s) => (
                <tr key={s.id} className="border-b border-black/5 align-top">
                  <td className="py-3 pr-4">
                    {s.status === "aprovado" ? (
                      <span
                        title="Já lançado"
                        className="flex items-center gap-1 whitespace-nowrap text-xs font-semibold text-primary"
                      >
                        <CheckCircle2 className="h-5 w-5" />
                        Lançado
                      </span>
                    ) : (
                      <div className="flex flex-col items-start gap-2">
                        <ApproveButton url={`/api/admin/financeiro/congregacao/${s.id}/aprovar`} />
                        <label className="flex cursor-pointer items-center gap-1.5 whitespace-nowrap text-xs text-text-neutral/70">
                          <input
                            type="checkbox"
                            aria-label="Revisar antes de lançar"
                            onChange={(e) => {
                              if (e.target.checked) selecionar(s.id);
                            }}
                            className="h-4 w-4 accent-secondary"
                          />
                          Revisar antes
                        </label>
                      </div>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-text-neutral/80">{formatDate(s.entry_date)}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={`font-semibold ${
                        s.type === "entrada" ? "text-primary" : "text-red-600"
                      }`}
                    >
                      {s.type === "entrada" ? "Entrada" : "Saída"}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-text-neutral/80">{s.category}</td>
                  <td className="py-3 pr-4 text-text-neutral/70">{s.description || "—"}</td>
                  <td className="py-3 pr-4">
                    {s.receipt_url ? (
                      <a
                        href={s.receipt_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 font-semibold text-primary hover:underline"
                      >
                        <FileText className="h-4 w-4 shrink-0" />
                        Ver
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="py-3 pr-4 text-right font-semibold text-text-neutral">
                    {formatCurrency(s.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
