import { del } from "@vercel/blob";
import { isLegacyBlobUrl } from "@/lib/privateFiles";

const PRIVATE_BLOB_TOKEN = process.env.BLOB_PRIVATE_READ_WRITE_TOKEN;

/** Apaga um arquivo sensível guardado como URL legada (store público) ou pathname (store privado). */
export async function deleteStoredFile(value: string): Promise<void> {
  if (isLegacyBlobUrl(value)) {
    await del(value);
  } else {
    await del(value, { token: PRIVATE_BLOB_TOKEN });
  }
}
