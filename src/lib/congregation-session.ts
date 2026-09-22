import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { getSessionSecret } from "@/lib/session-secret";

export const CONGREGATION_COOKIE = "ibci_congregacao";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12; // 12 horas

export interface CongregationSessionPayload {
  id: string; // id do congregation_users
  name: string;
  email: string;
  congregationId: string;
  congregationSlug: string;
  congregationName: string;
}

function sign(value: string): string {
  return createHmac("sha256", getSessionSecret()).update(value).digest("hex");
}

export function createCongregationCookieValue(payload: CongregationSessionPayload): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${data}.${sign(data)}`;
}

export function verifyCongregationCookieValue(
  value: string
): CongregationSessionPayload | null {
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

export const congregationCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE_SECONDS,
};

export async function getCongregationSession(): Promise<CongregationSessionPayload | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(CONGREGATION_COOKIE)?.value;
  if (!value) return null;
  return verifyCongregationCookieValue(value);
}
