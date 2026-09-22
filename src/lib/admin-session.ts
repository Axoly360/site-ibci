import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { getSessionSecret } from "@/lib/session-secret";

export const ADMIN_COOKIE = "ibci_admin";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12; // 12 horas

export const PERMISSIONS = {
  banners: "Banners",
  paginas: "Páginas & Conteúdo Visual",
  documentos: "Documentos & Consentimento",
  eventos: "Eventos",
  membros: "Membros (aprovar cadastros)",
  financeiro: "Financeiro (dízimos, ofertas e comprovantes)",
  visitantes: "Visitantes (cadastro espontâneo)",
  congregacoes: "Congregações (filiais)",
  admins: "Gerenciar administradores",
} as const;

export type Permission = keyof typeof PERMISSIONS;

/**
 * Setor de cada permissão — só para agrupar visualmente o painel
 * (/admin) e as telas de administradores. Não afeta o controle de
 * acesso em si, que continua sendo checado por permissão individual.
 */
export const PERMISSION_SECTOR: Record<Permission, string> = {
  banners: "Mídias",
  paginas: "Mídias",
  documentos: "Secretaria",
  eventos: "Secretaria",
  membros: "Secretaria",
  visitantes: "Secretaria",
  financeiro: "Financeiro",
  congregacoes: "Congregações",
  admins: "Administração",
};

/**
 * 5 acessos iniciais da IBCI, um por setor responsável. Cada um só tem as
 * permissões do seu setor (ver PERMISSION_SECTOR) — Administrador geral
 * continua com tudo.
 */
export const ROLES: Record<string, Permission[]> = {
  "Administrador geral": [
    "banners",
    "paginas",
    "documentos",
    "eventos",
    "membros",
    "financeiro",
    "visitantes",
    "congregacoes",
    "admins",
  ],
  "Mídias": ["banners", "paginas"],
  "Secretária": ["documentos", "eventos", "membros", "visitantes"],
  "Financeiro": ["financeiro"],
  "Congregação": ["congregacoes"],
};

export interface AdminSessionPayload {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: Permission[];
}

function sign(value: string): string {
  return createHmac("sha256", getSessionSecret()).update(value).digest("hex");
}

export function createAdminCookieValue(payload: AdminSessionPayload): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${data}.${sign(data)}`;
}

export function verifyAdminCookieValue(value: string): AdminSessionPayload | null {
  const [data, signature] = value.split(".");
  if (!data || !signature) return null;

  const expected = sign(data);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    return JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

export const adminCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE_SECONDS,
};

export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!value) return null;
  return verifyAdminCookieValue(value);
}

export function hasPermission(
  session: AdminSessionPayload | null,
  permission: Permission
): boolean {
  return Boolean(session?.permissions.includes(permission));
}
