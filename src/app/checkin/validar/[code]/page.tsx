import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Lock } from "lucide-react";
import { getAdminSession, hasPermission } from "@/lib/admin-session";
import { performCheckin } from "@/lib/checkin";

export const metadata: Metadata = {
  title: "Validar Check-in | IBCI",
  robots: { index: false, follow: false },
};

export default async function ValidarCheckinPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const session = await getAdminSession();

  // Se quem abriu o link não estiver logado como admin (ex.: o próprio
  // convidado abriu com a câmera do celular), não faz check-in sozinho —
  // evita autoconfirmação sem ninguém da recepção conferir.
  if (!session || !hasPermission(session, "eventos")) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-bg-light px-4">
        <div className="mx-auto max-w-sm space-y-4 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Lock className="h-7 w-7" />
          </span>
          <h1 className="font-heading text-xl font-bold text-primary">
            Faça login como administrador
          </h1>
          <p className="text-sm text-text-neutral/70">
            Este link só confirma a entrada quando aberto pela equipe da
            recepção, logada no painel.
          </p>
          <Link
            href="/admin/entrar"
            className="inline-block font-semibold text-secondary hover:underline"
          >
            Entrar no painel
          </Link>
        </div>
      </div>
    );
  }

  const result = await performCheckin(code, session.id);

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-bg-light px-4">
      <div className="mx-auto max-w-sm space-y-4 text-center">
        {result.status === "not_found" && (
          <>
            <h1 className="font-heading text-xl font-bold text-red-600">
              Código não encontrado
            </h1>
            <p className="text-sm text-text-neutral/70">
              Confira o código na tela de check-in do painel.
            </p>
          </>
        )}
        {result.status === "already" && (
          <>
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary/10 text-secondary">
              <CheckCircle2 className="h-7 w-7" />
            </span>
            <h1 className="font-heading text-xl font-bold text-primary">
              {result.name}
            </h1>
            <p className="text-sm text-text-neutral/70">
              Já fez check-in às{" "}
              {new Date(result.checkedInAt).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </>
        )}
        {result.status === "ok" && (
          <>
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CheckCircle2 className="h-7 w-7" />
            </span>
            <h1 className="font-heading text-xl font-bold text-primary">
              {result.name}
            </h1>
            <p className="text-sm font-semibold text-primary">
              Check-in confirmado!
            </p>
          </>
        )}
      </div>
    </div>
  );
}
