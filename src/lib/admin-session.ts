import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "ibci_admin";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12; // 12 horas

export const PERMISSIONS = {
  banners: "Banners",
  paginas: "Páginas & Textos",
  eventos: "Eventos",
  membros: "Membros (aprovar cadastros)",
  admins: "Gerenciar administradores",
} as const;

export type Permission = keyof typeof PERMISSIONS;

export const ROLES: Record<string, Permission[]> = {
  "Administrador geral": ["banners", "paginas", "eventos", "membros", "admins"],
  "Editor de Conteúdo": ["banners", "paginas"],
  "Gestor de Eventos": ["eventos"],
  "Validador de Cadastros": ["membros"],
};

export interface AdminSessionPayload {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: Permission[];
}

/**
 * Chave de assinatura do cookie de sessão. Reaproveita ADMIN_PASSWORD (já
 * configurado) enquanto ADMIN_SESSION_SECRET não existir, para não exigir
 * uma nova variável de ambiente nesta migração.
 */
function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET (ou ADMIN_PASSWORD) não configurado.");
  }
  return secret;
}

function sign(value: string): string {
  return createHmac("sha256", getSecret()).update(value).digest("hex");
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
