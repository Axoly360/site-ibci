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

  const { error } = await getResend().emails.send({
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
  // O SDK do Resend não lança exceção para todo erro de API (ex.: domínio
  // não verificado) — ele devolve { error } normalmente. Sem este check, o
  // chamador nunca fica sabendo que o e-mail não foi enviado de verdade.
  if (error) {
    throw new Error(`Falha ao enviar e-mail de confirmação: ${error.message}`);
  }
}

interface SendPasswordResetEmailParams {
  to: string;
  name: string;
  resetUrl: string;
}

export async function sendPasswordResetEmail({ to, name, resetUrl }: SendPasswordResetEmailParams) {
  const { error } = await getResend().emails.send({
    from: FROM,
    to,
    subject: "Redefinir sua senha — IBCI",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #123B2C;">Olá, ${name}!</h2>
        <p>Recebemos um pedido para redefinir sua senha. Se foi você, clique no botão abaixo — o link vale por 30 minutos.</p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="background: #D4AF37; color: #123B2C; padding: 12px 24px; border-radius: 999px; text-decoration: none; font-weight: bold;">
            Redefinir senha
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">
          Se você não pediu isso, pode ignorar este e-mail — sua senha continua a mesma.
        </p>
      </div>
    `,
  });
  if (error) {
    throw new Error(`Falha ao enviar e-mail de redefinição de senha: ${error.message}`);
  }
}

interface SendMembershipDecisionEmailParams {
  to: string;
  name: string;
  decision: "aprovado" | "recusado";
}

export async function sendMembershipDecisionEmail({
  to,
  name,
  decision,
}: SendMembershipDecisionEmailParams) {
  const isApproved = decision === "aprovado";
  const subject = isApproved
    ? "Seu cadastro de membro foi aprovado — IBCI"
    : "Sobre o seu cadastro de membro — IBCI";
  const body = isApproved
    ? `Seu cadastro de membro na IBCI foi <strong>aprovado</strong> pela diretoria. Você já tem acesso completo à Central do Membro — entre com seu e-mail e senha para ver seus dados, grupos, contribuições e mais.`
    : `Analisamos seu cadastro de membro na IBCI e, desta vez, ele não foi aprovado. Se quiser, você pode enviar novos dados a qualquer momento pela Central do Membro, ou falar com a secretaria para entender melhor.`;

  const { error } = await getResend().emails.send({
    from: FROM,
    to,
    subject,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #123B2C;">Olá, ${name}!</h2>
        <p>${body}</p>
        <p style="color: #666; font-size: 14px;">
          Qualquer dúvida, fale com a secretaria da IBCI.
        </p>
      </div>
    `,
  });
  if (error) {
    throw new Error(`Falha ao enviar e-mail de decisão de cadastro: ${error.message}`);
  }
}

interface SendCheckinQrEmailParams {
  to: string;
  name: string;
  eventTitle: string;
  code: string;
  /** PNG do QR Code, em base64, para anexar ao e-mail. */
  qrBase64: string;
}

export async function sendCheckinQrEmail({
  to,
  name,
  eventTitle,
  code,
  qrBase64,
}: SendCheckinQrEmailParams) {
  const { error } = await getResend().emails.send({
    from: FROM,
    to,
    subject: `Seu QR Code de entrada — ${eventTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #123B2C;">Olá, ${name}!</h2>
        <p>Sua inscrição em <strong>${eventTitle}</strong> foi confirmada.</p>
        <p>Apresente o QR Code em anexo na entrada do evento. Se preferir, seu código também pode ser digitado na recepção:</p>
        <p style="margin: 16px 0; font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #123B2C;">
          ${code}
        </p>
        <p style="color: #666; font-size: 14px;">
          Guarde este e-mail — ele é o seu ingresso.
        </p>
      </div>
    `,
    attachments: [
      {
        filename: `qrcode-${code}.png`,
        content: qrBase64,
      },
    ],
  });
  if (error) {
    throw new Error(`Falha ao enviar e-mail do QR Code: ${error.message}`);
  }
}
