import { headers } from "next/headers";

/** URL de origem absoluta (https://dominio) a partir dos headers da requisição atual. */
export async function getOrigin(): Promise<string> {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("host");
  return `${proto}://${host}`;
}
