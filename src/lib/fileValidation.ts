export type SniffedFileType =
  | "image/png"
  | "image/jpeg"
  | "image/gif"
  | "image/webp"
  | "application/pdf"
  | "application/zip" // .docx/.xlsx/.pptx são ZIP por dentro
  | "application/x-ole-storage" // .doc/.xls/.ppt (formato antigo)
  | null;

/**
 * Confere os primeiros bytes do arquivo (assinatura/"magic bytes"), em vez
 * de confiar em `file.type`/extensão — esses dois são só o que o navegador
 * do cliente diz que é, fáceis de falsificar. Sem isso, um upload "de
 * imagem" podia na prática ser qualquer arquivo (HTML/SVG com script,
 * executável) hospedado publicamente no Vercel Blob.
 */
export async function sniffFileType(file: File): Promise<SniffedFileType> {
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const startsWith = (signature: number[]) => signature.every((b, i) => bytes[i] === b);

  if (startsWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  if (startsWith([0xff, 0xd8, 0xff])) return "image/jpeg";
  if (startsWith([0x47, 0x49, 0x46, 0x38])) return "image/gif";
  if (
    startsWith([0x52, 0x49, 0x46, 0x46]) &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  if (startsWith([0x25, 0x50, 0x44, 0x46, 0x2d])) return "application/pdf";
  if (startsWith([0x50, 0x4b, 0x03, 0x04])) return "application/zip";
  if (startsWith([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])) return "application/x-ole-storage";
  return null;
}

const IMAGE_TYPES: SniffedFileType[] = ["image/png", "image/jpeg", "image/gif", "image/webp"];

export async function isImageFile(file: File): Promise<boolean> {
  return IMAGE_TYPES.includes(await sniffFileType(file));
}

export async function isImageOrPdfFile(file: File): Promise<boolean> {
  const type = await sniffFileType(file);
  return type !== null && (IMAGE_TYPES.includes(type) || type === "application/pdf");
}

/** Whitelist mais ampla para "documentos anexados" de uso geral (ex.: um
 * arquivo do membro no admin) — imagem, PDF, ou um documento de escritório
 * (Word/Excel/PowerPoint, novo ou antigo). Ainda bloqueia HTML/SVG/scripts
 * disfarçados de outra coisa, que era o risco real sem nenhuma checagem. */
export async function isSafeDocumentFile(file: File): Promise<boolean> {
  const type = await sniffFileType(file);
  return type !== null;
}

/** Sanitiza o nome antes de compor a chave do Vercel Blob — remove tudo que
 * não seja letra/número/ponto/hífen/underscore, pra evitar que um nome de
 * arquivo malicioso (ex.: com "../") interfira no caminho de armazenamento. */
export function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100);
}
