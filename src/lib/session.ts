import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "ibci_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 90; // 90 dias

export interface SessionPayload {
  memberId: string;
  name: string;
  email: string;
}

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET não configurado.");
  }
  return secret;
}

function sign(value: string): string {
  return createHmac("sha256", getSecret()).update(value).digest("hex");
}

/** Gera o valor assinado do cookie de sessão a partir dos dados do membro logado. */
export function createSessionCookieValue(payload: SessionPayload): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${data}.${sign(data)}`;
}

/** Valida e decodifica um valor de cookie de sessão. Retorna null se inválido/expirado. */
export function verifySessionCookieValue(value: string): SessionPayload | null {
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

export const sessionCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE_SECONDS,
};

/** Lê a sessão do membro logado a partir dos cookies da requisição atual (uso em Server Components). */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(SESSION_COOKIE)?.value;
  if (!value) return null;
  return verifySessionCookieValue(value);
}
