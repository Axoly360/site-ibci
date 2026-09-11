"use client";

import { useRouter } from "next/navigation";
import { FileText, CheckCircle2 } from "lucide-react";
import Card from "@/components/ui/Card";

export interface ComprovanteRow {
  id: string;
  file_name: string;
  file_url: string;
  note: string | null;
  category: string | null;
  sender_type: string | null;
  type: string | null;
  amount: string | null;
  status: string;
  created_at: string;
  name: string;
  email: string;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(value: string | null) {
  if (!value) return "—";
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ComprovantesManager({ comprovantes }: { comprovantes: ComprovanteRow[] }) {
  const router = useRouter();

  const selecionar = (id: string) => {
    router.push(`/admin/financeiro/lancamentos?comprovanteId=${id}`);
  };

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center gap-3 text-primary">
        <FileText className="h-6 w-6 text-secondary" />
        <h2 className="font-heading text-lg font-semibold">
          Comprovantes recebidos ({comprovantes.length})
        </h2>
      </div>
      <p className="mb-4 text-sm text-text-neutral/60">
        Marque um comprovante pendente para preencher o lançamento
        automaticamente — depois é só conferir e clicar em Lançar.
      </p>

      {comprovantes.length === 0 ? (
        <p className="text-sm text-text-neutral/60">
          Nenhum comprovante enviado até o momento.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-black/10 text-xs font-semibold uppercase tracking-wider text-text-neutral/50">
                <th className="py-2 pr-4"></th>
                <th className="py-2 pr-4">Membro</th>
                <th className="py-2 pr-4">Categoria</th>
                <th className="py-2 pr-4">Quem enviou</th>
                <th className="py-2 pr-4">Tipo</th>
                <th className="py-2 pr-4 text-right">Valor</th>
                <th className="py-2 pr-4">Arquivo</th>
                <th className="py-2 pr-4">Enviado em</th>
              </tr>
            </thead>
            <tbody>
              {comprovantes.map((c) => (
                <tr key={c.id} className="border-b border-black/5 align-top">
                  <td className="py-3 pr-4">
                    {c.status === "aprovado" ? (
                      <span title="Já lançado">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      </span>
                    ) : (
                      <input
                        type="checkbox"
                        aria-label="Selecionar para lançar"
                        disabled={!c.category || !c.type || !c.amount}
                        onChange={(e) => {
                          if (e.target.checked) selecionar(c.id);
                        }}
                        className="h-5 w-5 accent-secondary disabled:cursor-not-allowed disabled:opacity-40"
                      />
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    <div className="font-semibold text-text-neutral">{c.name}</div>
                    <div className="text-xs text-text-neutral/60">{c.email}</div>
                  </td>
                  <td className="py-3 pr-4 text-text-neutral/80">{c.category || "—"}</td>
                  <td className="py-3 pr-4 text-text-neutral/80">{c.sender_type || "—"}</td>
                  <td className="py-3 pr-4">
                    {c.type ? (
                      <span
                        className={`font-semibold ${
                          c.type === "entrada" ? "text-primary" : "text-red-600"
                        }`}
                      >
                        {c.type === "entrada" ? "Entrada" : "Saída"}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="py-3 pr-4 text-right font-semibold text-text-neutral">
                    {formatCurrency(c.amount)}
                  </td>
                  <td className="py-3 pr-4">
                    <a
                      href={c.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 font-semibold text-secondary hover:underline"
                    >
                      <FileText className="h-4 w-4 shrink-0" />
                      Ver
                    </a>
                    {c.note && (
                      <div className="mt-0.5 text-xs text-text-neutral/60">{c.note}</div>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-text-neutral/70">{formatDate(c.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
