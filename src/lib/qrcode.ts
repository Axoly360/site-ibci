import QRCode from "qrcode";

/**
 * Gera um QR Code como data URL (PNG base64), no estilo padrão usado em todo
 * o site (chave PIX, check-in de eventos). Reaproveitado por qualquer nova
 * tela que precise de QR Code em vez de repetir a config em cada página.
 */
export function generateQrCodeDataUrl(text: string, size = 320): Promise<string> {
  return QRCode.toDataURL(text, {
    margin: 1,
    width: size,
    color: { dark: "#123B2C", light: "#FFFFFF" },
  });
}
