import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendTelegramNotification } from '@/lib/telegram';
import { sendPasswordResetEmail, getSmtpConfig } from '@/lib/mail';

export const dynamic = 'force-dynamic';

async function getTelegramBotInfo(): Promise<{ botToken?: string; username?: string }> {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: 'telegram_bot_token' },
    });
    const botToken = setting?.value?.trim();
    if (!botToken) return {};

    const res = await fetch(`https://api.telegram.org/bot${botToken}/getMe`).catch(() => null);
    if (!res || !res.ok) return { botToken };
    const data = await res.json().catch(() => ({}));
    return {
      botToken,
      username: data?.result?.username,
    };
  } catch (e) {
    return {};
  }
}

export async function GET() {
  try {
    const { username } = await getTelegramBotInfo();
    const smtpConfig = await getSmtpConfig();
    return NextResponse.json({
      success: true,
      hasTelegramBot: Boolean(username),
      botUsername: username || null,
      hasSmtpConfig: Boolean(smtpConfig),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, email, code, newPassword } = body;

    const cleanEmail = String(email || '').toLowerCase().trim();
    if (!cleanEmail) {
      return NextResponse.json(
        { success: false, message: 'Veuillez saisir votre adresse email.' },
        { status: 400 }
      );
    }

    // 1. REQUEST RESET CODE
    if (action === 'REQUEST_CODE') {
      const tenant = await prisma.tenant.findUnique({
        where: { email: cleanEmail },
        select: {
          id: true,
          name: true,
          email: true,
          storeName: true,
          subdomain: true,
          telegramChatId: true,
          telegramNotificationsEnabled: true,
        },
      });

      const { botToken, username: botUsername } = await getTelegramBotInfo();

      if (!tenant) {
        // Obfuscate whether account exists to prevent email scraping
        return NextResponse.json({
          success: true,
          message: 'Si un compte est associé à cet email, les instructions de sécurité vous ont été transmises.',
          botUsername: botUsername || null,
        });
      }

      // Generate a secure 6-digit verification code
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes validity

      await prisma.tenant.update({
        where: { id: tenant.id },
        data: {
          resetToken: resetCode,
          resetTokenExpiresAt: expiresAt,
        },
      });

      // Construct resetUrl dynamically based on incoming request
      const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'abonnements-pro.shop';
      const proto = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
      const resetUrl = `${proto}://${host}/reseller/login?email=${encodeURIComponent(cleanEmail)}&code=${resetCode}`;

      // 1. Send real email via SMTP
      const mailRes = await sendPasswordResetEmail({
        to: cleanEmail,
        name: tenant.name,
        code: resetCode,
        resetUrl,
      });

      let sentDirectlyToTelegram = false;

      // 2. If reseller has Telegram connected, send code directly to their chat
      if (botToken && tenant.telegramChatId) {
        try {
          const text = `
🔐 <b>RÉCUPÉRATION DE COMPTE REVENDEUR</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━
Bonjour <b>${tenant.name}</b>,

Vous avez demandé la réinitialisation de votre mot de passe pour la boutique <b>${tenant.storeName || tenant.subdomain}</b>.

🔑 <b>Votre code de sécurité :</b>
<code>${resetCode}</code>

⏰ Ce code expire dans <b>15 minutes</b>.
<i>Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer ce message en toute sécurité.</i>
`.trim();

          const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: tenant.telegramChatId,
              text,
              parse_mode: 'HTML',
            }),
          });
          const tgData = await tgRes.json().catch(() => ({}));
          sentDirectlyToTelegram = Boolean(tgData.ok);
        } catch (err) {
          console.error('Error sending code to reseller telegram:', err);
        }
      }

      // 3. Notify Super Admin on Telegram
      sendTelegramNotification({
        title: `Demande de Réinitialisation MDP Revendeur`,
        ticketCode: `RESET-${resetCode}`,
        type: 'SUPPORT',
        amount: 'N/A',
        details: `Revendeur : ${tenant.name} (${cleanEmail})\nCode de sécurité : ${resetCode}\nEmail envoyé : ${mailRes.success ? 'Oui' : (mailRes.notConfigured ? 'Non configuré' : 'Échec')}\nTelegram revendeur : ${sentDirectlyToTelegram ? 'Oui' : 'Non lié'}`,
      }).catch(console.error);

      let responseMessage = '';
      if (mailRes.success) {
        responseMessage = `Code de sécurité envoyé à votre boîte email (${cleanEmail}) ! Vérifiez votre boîte de réception et vos spams.`;
        if (sentDirectlyToTelegram) {
          responseMessage += ' Et également sur votre Telegram.';
        }
      } else if (sentDirectlyToTelegram) {
        responseMessage = 'Votre code vous a été envoyé directement sur Telegram !';
      } else if (mailRes.notConfigured) {
        responseMessage = 'Code de sécurité généré ! Le serveur email (SMTP) n\'est pas encore configuré : obtenez votre code en 2 secondes via notre Bot Telegram en 1 clic.';
      } else {
        responseMessage = 'Code généré ! Vous pouvez également l\'obtenir instantanément via notre Bot Telegram ci-dessous.';
      }

      return NextResponse.json({
        success: true,
        sentDirectlyToTelegram,
        sentByEmail: mailRes.success,
        emailNotConfigured: Boolean(mailRes.notConfigured),
        botUsername: botUsername || null,
        message: responseMessage,
      });
    }

    // 2. VERIFY CODE AND RESET PASSWORD
    if (action === 'RESET_PASSWORD') {
      const cleanCode = String(code || '').trim();
      const cleanPassword = String(newPassword || '').trim();

      if (!cleanCode || cleanCode.length < 5) {
        return NextResponse.json(
          { success: false, message: 'Veuillez saisir le code de sécurité à 6 chiffres.' },
          { status: 400 }
        );
      }

      if (!cleanPassword || cleanPassword.length < 6) {
        return NextResponse.json(
          { success: false, message: 'Le nouveau mot de passe doit comporter au moins 6 caractères.' },
          { status: 400 }
        );
      }

      const tenant = await prisma.tenant.findUnique({
        where: { email: cleanEmail },
      });

      if (!tenant) {
        return NextResponse.json(
          { success: false, message: 'Compte revendeur introuvable.' },
          { status: 404 }
        );
      }

      if (
        !tenant.resetToken ||
        tenant.resetToken !== cleanCode ||
        !tenant.resetTokenExpiresAt ||
        new Date(tenant.resetTokenExpiresAt) < new Date()
      ) {
        return NextResponse.json(
          {
            success: false,
            message: 'Le code de vérification est invalide ou a expiré. Veuillez demander un nouveau code.',
          },
          { status: 400 }
        );
      }

      // Reset password and invalidate token
      const updatedTenant = await prisma.tenant.update({
        where: { id: tenant.id },
        data: {
          password: cleanPassword,
          resetToken: null,
          resetTokenExpiresAt: null,
        },
      });

      // Send confirmation to reseller Telegram if configured
      const { botToken } = await getTelegramBotInfo();
      if (botToken && tenant.telegramChatId) {
        try {
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: tenant.telegramChatId,
              text: `✅ <b>Mot de passe modifié avec succès</b>\nVotre compte revendeur <b>${tenant.email}</b> est désormais sécurisé avec votre nouveau mot de passe.`,
              parse_mode: 'HTML',
            }),
          });
        } catch (e) {
          // Ignore
        }
      }

      // Auto-login response by setting reseller_session cookie
      const res = NextResponse.json({
        success: true,
        message: 'Mot de passe réinitialisé avec succès ! Connexion en cours...',
        reseller: {
          id: updatedTenant.id,
          name: updatedTenant.name,
          email: updatedTenant.email,
          subdomain: updatedTenant.subdomain,
        },
      });

      res.cookies.set('reseller_session', updatedTenant.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });

      return res;
    }

    return NextResponse.json({ success: false, message: 'Action invalide.' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in forgot-password API:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
