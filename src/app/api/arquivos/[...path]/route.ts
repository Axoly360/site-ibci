import { NextRequest, NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { getSession } from "@/lib/session";
import { getAdminSession, hasPermission, type Permission } from "@/lib/admin-session";
import { getCongregationSession } from "@/lib/congregation-session";

/**
 * Entrega arquivos sensíveis (comprovantes, fotos, documentos de cadastro,
 * comprovantes de lançamentos) guardados no Blob Store privado. Nenhum
 * desses arquivos tem link público — todo acesso passa por aqui, que
 * confere sessão e permissão antes de servir o conteúdo.
 *
 * Prefixos aceitos e quem pode ler cada um:
 *   membros/{memberId}/...      -> o próprio membro, ou admin com "membros"
 *   comprovantes/{memberId}/... -> o próprio membro, ou admin com "financeiro"
 *   financeiro/...              -> admin com "financeiro"
 *   congregacoes/{slug}/...     -> o responsável daquela congregação, ou admin com "financeiro"
 */

type AuthResult = { ok: true } | { ok: false; status: 401 | 403 | 404 };

async function authorize(category: string, segments: string[]): Promise<AuthResult> {
  if (category === "membros" || category === "comprovantes") {
    const memberIdFromPath = segments[1];
    const memberSession = await getSession();
    if (memberSession && memberSession.memberId === memberIdFromPath) {
      return { ok: true };
    }

    const requiredPermission: Permission = category === "membros" ? "membros" : "financeiro";
    const adminSession = await getAdminSession();
    if (adminSession) {
      return hasPermission(adminSession, requiredPermission)
        ? { ok: true }
        : { ok: false, status: 403 };
    }

    return { ok: false, status: memberSession ? 403 : 401 };
  }

  if (category === "financeiro") {
    const adminSession = await getAdminSession();
    if (!adminSession) return { ok: false, status: 401 };
    return hasPermission(adminSession, "financeiro") ? { ok: true } : { ok: false, status: 403 };
  }

  if (category === "congregacoes") {
    const slugFromPath = segments[1];
    const congregationSession = await getCongregationSession();
    if (congregationSession && congregationSession.congregationSlug === slugFromPath) {
      return { ok: true };
    }

    const adminSession = await getAdminSession();
    if (adminSession) {
      return hasPermission(adminSession, "financeiro")
        ? { ok: true }
        : { ok: false, status: 403 };
    }

    return { ok: false, status: congregationSession ? 403 : 401 };
  }

  return { ok: false, status: 404 };
}

// Pathnames de blob são sempre "prefixo/segmento/segmento"; nenhum segmento
// legítimo vem vazio, é "." / "..", ou contém barra (inclusive codificada,
// já decodificada pelo router neste ponto) — qualquer um desses indica
// tentativa de path traversal.
function hasInvalidSegment(segments: string[]): boolean {
  return segments.some(
    (segment) => !segment || segment === "." || segment === ".." || segment.includes("/") || segment.includes("\\")
  );
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;

  if (!segments || segments.length < 2 || hasInvalidSegment(segments)) {
    return NextResponse.json({ error: "Caminho inválido." }, { status: 400 });
  }

  const category = segments[0];
  const auth = await authorize(category, segments);
  if (!auth.ok) {
    const message =
      auth.status === 401 ? "Não autenticado." : auth.status === 403 ? "Sem permissão." : "Não encontrado.";
    return NextResponse.json({ error: message }, { status: auth.status });
  }

  const pathname = segments.join("/");
  let result;
  try {
    result = await get(pathname, {
      access: "private",
      token: process.env.BLOB_PRIVATE_READ_WRITE_TOKEN,
    });
  } catch {
    return NextResponse.json({ error: "Arquivo não encontrado." }, { status: 404 });
  }

  if (!result || result.statusCode !== 200 || !result.stream) {
    return NextResponse.json({ error: "Arquivo não encontrado." }, { status: 404 });
  }

  return new NextResponse(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType || "application/octet-stream",
      "Content-Disposition": result.blob.contentDisposition || "inline",
      "Cache-Control": "private, no-store",
    },
  });
}
