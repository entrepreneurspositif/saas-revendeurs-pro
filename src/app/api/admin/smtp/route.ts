import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';
import { getSmtpConfig } from '@/lib/mail';

export const dynamic = 'force-dynamic';

export async function GET() {
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
      acc[curr.key] = curr.value || '';
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json({
      success: true,
      config: {
        host: map['smtp_host'] || process.env.SMTP_HOST || '',
        port: map['smtp_port'] || process.env.SMTP_PORT || '587',
        user: map['smtp_user'] || process.env.SMTP_USER || '',
        pass: map['smtp_pass'] ? '••••••••' : '',
        from: map['smtp_from'] || process.env.SMTP_FROM || '',
        secure: map['smtp_secure'] === 'true',
        isConfigured: Boolean(map['smtp_host'] && map['smtp_user'] && map['smtp_pass']),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, host, port, user, pass, from, secure, testEmail } = body;

    // Handle Test Email
    if (action === 'test') {
      const config = await getSmtpConfig();
      if (!config) {
        return NextResponse.json(
          { success: false, message: 'Veuillez d\'abord enregistrer la configuration SMTP avant de tester.' },
          { status: 400 }
        );
      }

      const targetEmail = testEmail || config.user;
      const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
          user: config.user,
          pass: config.pass,
        },
      });

      await transporter.sendMail({
        from: `"${config.from.includes('<') ? '' : 'Plateforme Revendeurs'} " <${config.from}>`,
        to: targetEmail,
        subject: '✅ Test SMTP Réussi - Plateforme Revendeurs',
        text: 'Félicitations ! Votre serveur SMTP fonctionne parfaitement. Les e-mails de récupération de mot de passe et notifications seront délivrés sans encombre.',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #0b0f19; color: #ffffff; border-radius: 12px;">
            <h2 style="color: #38bdf8;">✅ Test de Connexion SMTP Réussi</h2>
            <p>Félicitations ! Votre configuration SMTP sur la plateforme est validée avec succès.</p>
            <p>Désormais, tous les revendeurs recevront instantanément leurs codes de récupération et leurs alertes directement par e-mail.</p>
            <hr style="border: 0; border-top: 1px solid #1e293b; margin: 20px 0;" />
            <small style="color: #94a3b8;">Entrepreneurs Positifs SaaS</small>
          </div>
        `,
      });

      return NextResponse.json({
        success: true,
        message: `E-mail de test envoyé avec succès à ${targetEmail} !`,
      });
    }

    // Save SMTP Settings
    const updates: { key: string; value: string }[] = [
      { key: 'smtp_host', value: String(host || '').trim() },
      { key: 'smtp_port', value: String(port || '587').trim() },
      { key: 'smtp_user', value: String(user || '').trim() },
      { key: 'smtp_from', value: String(from || '').trim() },
      { key: 'smtp_secure', value: secure ? 'true' : 'false' },
    ];

    if (pass && pass !== '••••••••') {
      updates.push({ key: 'smtp_pass', value: String(pass).trim() });
    }

    for (const item of updates) {
      await prisma.setting.upsert({
        where: { key: item.key },
        update: { value: item.value },
        create: { key: item.key, value: item.value },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Configuration SMTP enregistrée avec succès !',
    });
  } catch (error: any) {
    console.error('SMTP API Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
