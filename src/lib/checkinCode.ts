import { randomInt } from "crypto";

// Sem 0/O/1/I/L (fáceis de confundir) — o código também é digitado à mão na
// recepção como fallback do QR Code.
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

export function generateCheckinCode(length = 6): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += ALPHABET[randomInt(ALPHABET.length)];
  }
  return code;
}
