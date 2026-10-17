import nodemailer from 'nodemailer';
import { prisma } from './prisma';

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
}

export async function getSmtpConfig(): Promise<SmtpConfig | null> {
  try {
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: [
            'smtp_host',
            'smtp_port',
            'smtp_user',
            'smtp_pass',
            'smtp_from',
            'smtp_secure',
          ],
        },
      },
    });

    const map = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value?.trim() || '';
      return acc;
    }, {} as Record<string, string>);

    const host = map['smtp_host'] || process.env.SMTP_HOST || '';
    const port = Number(map['smtp_port'] || process.env.SMTP_PORT || 587);
    const user = map['smtp_user'] || process.env.SMTP_USER || '';
    const pass = map['smtp_pass'] || process.env.SMTP_PASS || '';
    const secure = (map['smtp_secure'] || process.env.SMTP_SECURE) === 'true' || port === 465;
    const from = map['smtp_from'] || process.env.SMTP_FROM || user || 'noreply@abonnementspro.com';

    if (!host || !user || !pass) {
      return null;
    }

    return { host, port, secure, user, pass, from };
  } catch (err) {
    console.error('Error fetching SMTP config:', err);
    return null;
  }
}

export async function sendPasswordResetEmail({
  to,
  name,
  code,
  resetUrl,
}: {
  to: string;
  name: string;
  code: string;
  resetUrl?: string;
}): Promise<{ success: boolean; notConfigured?: boolean; error?: string }> {
  try {
    const config = await getSmtpConfig();
    if (!config) {
      console.warn('SMTP is not configured. Reset email not sent to:', to);
      return { success: false, notConfigured: true, error: 'SMTP non configuré' };
    }

    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Récupération de compte Revendeur</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f8fafc; margin: 0; padding: 24px; }
    .container { max-width: 540px; margin: 0 auto; background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; overflow: hidden; padding: 32px 28px; }
    .badge { display: inline-block; background-color: #0284c7; color: #ffffff; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 16px; }
    h1 { color: #ffffff; font-size: 22px; margin: 0 0 12px 0; font-weight: 800; }
    p { color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0; }
    .code-box { background-color: #1e293b; border: 2px dashed #0284c7; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
    .code { font-family: monospace; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #38bdf8; }
    .btn { display: inline-block; background: linear-gradient(135deg, #0284c7, #4f46e5); color: #ffffff !important; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 14px; margin-top: 8px; text-align: center; }
    .footer { margin-top: 32px; padding-top: 20px; border-top: 1px solid #1f2937; font-size: 12px; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="badge">Sécurité Revendeur</div>
    <h1>Réinitialisation de votre mot de passe</h1>
    <p>Bonjour <strong>${name || 'Revendeur'}</strong>,</p>
    <p>Vous avez demandé un code de sécurité pour réinitialiser le mot de passe de votre espace revendeur.</p>
    
    <div class="code-box">
      <div style="font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: bold; margin-bottom: 8px;">Votre Code de Vérification</div>
      <div class="code">${code}</div>
      <div style="font-size: 11px; color: #64748b; margin-top: 8px;">Valable pendant 15 minutes</div>
    </div>

    ${
      resetUrl
        ? `<div style="text-align: center; margin-bottom: 24px;">
            <a href="${resetUrl}" class="btn" target="_blank">🔑 Réinitialiser mon mot de passe en 1 clic</a>
          </div>`
        : ''
    }

    <p style="font-size: 12px; color: #64748b;">
      Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail en toute sécurité. Votre mot de passe actuel reste inchangé.
    </p>

    <div class="footer">
      Entrepreneurs Positifs SaaS &bull; Plateforme Revendeurs &bull; Assistance 24/7
    </div>
  </div>
</body>
</html>
    `.trim();

    await transporter.sendMail({
      from: `"${config.from.includes('<') ? '' : 'Plateforme Revendeurs'} " <${config.from}>`,
      to,
      subject: `🔐 Votre Code de Récupération : ${code} - Plateforme Revendeur`,
      html: htmlContent,
      text: `Bonjour ${name},\n\nVotre code de réinitialisation de mot de passe est : ${code}\nCe code est valable 15 minutes.\n\nLien de réinitialisation : ${resetUrl || 'Espace connexion revendeur'}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez ce message.`,
    });

    return { success: true };
  } catch (err: any) {
    console.error('Error sending reset email:', err);
    return { success: false, error: err.message };
  }
}
