import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import PageBanner from "@/components/layout/PageBanner";
import AdminNav from "@/components/admin/AdminNav";
import Card from "@/components/ui/Card";
import PrintButton from "@/components/eventos/PrintButton";
import { getAdminSession, hasPermission } from "@/lib/admin-session";
import { generateQrCodeDataUrl } from "@/lib/qrcode";
import { getOrigin } from "@/lib/site";
import { VISITOR_EVENT_OPTIONS, visitorEventLabel } from "@/data/visitorEvents";

export const metadata: Metadata = {
  title: "QR Code de Visitantes | Painel IBCI",
  robots: { index: false, follow: false },
};

export default async function AdminVisitantesQrCodePage({
  searchParams,
}: {
  searchParams: Promise<{ evento?: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/entrar");
  if (!hasPermission(session, "visitantes")) redirect("/admin");

  const { evento } = await searchParams;
  const origin = await getOrigin();
  const url = evento ? `${origin}/visitantes/cadastro?evento=${evento}` : `${origin}/visitantes/cadastro`;

  const qrCodeDataUrl = await generateQrCodeDataUrl(url);

  return (
    <div className="bg-bg-light">
      <AdminNav session={session} />
      <PageBanner
        title="QR Code de Visitantes"
        description="Imprima e exponha na entrada física ou num evento específico."
      />
      <div className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8">
        <Link
          href="/admin/visitantes"
          className="mb-6 inline-block text-sm font-semibold text-secondary hover:underline"
        >
          ← Voltar para Visitantes
        </Link>

        <Card className="space-y-4 p-6">
          <form className="flex flex-wrap items-end gap-3" method="get">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-semibold text-text-neutral/70">
                Evento (ou geral, para o QR fixo da entrada)
              </label>
              <select
                name="evento"
                defaultValue={evento || ""}
                className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
              >
                <option value="">Visita geral (entrada da igreja)</option>
                {VISITOR_EVENT_OPTIONS.map((e) => (
                  <option key={e.slug} value={e.slug}>
                    {e.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="rounded-full bg-secondary px-5 py-2 text-sm font-bold text-primary hover:bg-secondary-light"
            >
              Gerar
            </button>
          </form>
        </Card>

        <Card className="mt-6 space-y-4 p-8 text-center">
          <p className="text-sm font-semibold text-text-neutral/70">
            {evento ? `Evento: ${visitorEventLabel(evento)}` : "Visita geral (entrada da igreja)"}
          </p>
          <div className="mx-auto w-fit rounded-xl bg-white p-3 shadow-sm">
            <Image
              src={qrCodeDataUrl}
              alt="QR Code de cadastro de visitante"
              width={260}
              height={260}
              unoptimized
            />
          </div>
          <p className="break-all text-xs text-text-neutral/50">{url}</p>
        </Card>

        <PrintButton />
      </div>
    </div>
  );
}
