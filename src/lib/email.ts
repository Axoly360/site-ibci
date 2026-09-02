import { Resend } from "resend";

// A instância só é criada no primeiro envio (não no import do módulo), para
// não quebrar o build enquanto RESEND_API_KEY ainda não existir no projeto.
let resend: Resend | null = null;

function getResend(): Resend {
  if (!resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY não configurado.");
    }
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

/**
 * Remetente padrão: enquanto nenhum domínio próprio for verificado no
 * Resend, o envio real só chega na caixa do dono da conta Resend (modo de
 * teste). Configure RESEND_FROM_EMAIL assim que houver um domínio
 * verificado (ex.: "IBCI <contato@ibciibura.com.br>").
 */
const FROM = process.env.RESEND_FROM_EMAIL ?? "IBCI <onboarding@resend.dev>";

interface SendConfirmationEmailParams {
  to: string;
  name: string;
  confirmUrl: string;
  eventTitle?: string;
}

export async function sendConfirmationEmail({
  to,
  name,
  confirmUrl,
  eventTitle,
}: SendConfirmationEmailParams) {
  const intro = eventTitle
    ? `Confirme seu e-mail para concluir sua inscrição em <strong>${eventTitle}</strong>.`
    : "Confirme seu e-mail para acessar sua conta na IBCI.";

  await getResend().emails.send({
    from: FROM,
    to,
    subject: "Confirme seu e-mail — IBCI",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #123B2C;">Olá, ${name}!</h2>
        <p>${intro}</p>
        <p style="margin: 24px 0;">
          <a href="${confirmUrl}" style="background: #D4AF37; color: #123B2C; padding: 12px 24px; border-radius: 999px; text-decoration: none; font-weight: bold;">
            Confirmar e-mail
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">
          Se você não solicitou isso, pode ignorar este e-mail.
        </p>
      </div>
    `,
  });
}
