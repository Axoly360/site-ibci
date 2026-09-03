import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "ibci_admin";

/**
 * Autenticação mínima para o teste real do painel: uma senha única
 * (ADMIN_PASSWORD), sem cadastro de usuários ainda. Serve para validar o
 * fluxo de edição de conteúdo antes de construir login/funções por admin.
 */
function getPassword(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error("ADMIN_PASSWORD não configurado.");
  }
  return password;
}

function sign(value: string, secret: string): string {
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function checkAdminPassword(input: string): boolean {
  const password = getPassword();
  const a = Buffer.from(input);
  const b = Buffer.from(password);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function createAdminCookieValue(): string {
  return sign("admin-ok", getPassword());
}

export function verifyAdminCookieValue(value: string): boolean {
  try {
    const expected = createAdminCookieValue();
    const a = Buffer.from(value);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export const adminCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 12, // 12 horas
};

export async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const value = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!value) return false;
  return verifyAdminCookieValue(value);
}
