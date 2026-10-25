import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getFeexPayConfig, convertUsdToXof } from '@/lib/feexpay';
import { initializeMonerooPayment } from '@/lib/moneroo';

export const dynamic = 'force-dynamic';

function sanitizeSubdomain(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/^-+|-+$/g, '');
}

export async function GET(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('reseller_session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ authenticated: false, reseller: null });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: sessionToken },
      include: {
        plan: true,
      },
    });

    if (!tenant || !tenant.isActive) {
      const res = NextResponse.json({ authenticated: false, reseller: null });
      res.cookies.delete('reseller_session');
      return res;
    }

    let parsedFeatures: string[] = [];
    try {
      parsedFeatures = JSON.parse(tenant.plan?.features || '[]');
    } catch (e) {
      parsedFeatures = [];
    }

    return NextResponse.json({
      authenticated: true,
      reseller: {
        id: tenant.id,
        name: tenant.name,
        email: tenant.email,
        subdomain: tenant.subdomain,
        customDomain: tenant.customDomain,
        storeName: tenant.storeName,
        tagline: tenant.tagline,
        logoUrl: tenant.logoUrl,
        bannerUrl: tenant.bannerUrl,
        themeColor: tenant.themeColor,
        themePreset: tenant.themePreset || 'cyber-dark',
        productTemplate: tenant.productTemplate || 'grid-modern',
        fontFamily: tenant.fontFamily || 'Inter',
        buttonColor: tenant.buttonColor || '#0284c7',
        buttonTextColor: tenant.buttonTextColor || '#ffffff',
        buttonRadius: tenant.buttonRadius || 'rounded-xl',
        contactEmail: tenant.contactEmail,
        contactPhone: tenant.contactPhone,
        contactWhatsApp: tenant.contactWhatsApp,
        contactTelegram: tenant.contactTelegram,
        bannerAnnouncement: tenant.bannerAnnouncement,
        paymentInstructions: tenant.paymentInstructions,
        walletBalance: tenant.walletBalance,
        totalEarnings: tenant.totalEarnings,
        customGatewayEnabled: Boolean(tenant.customGatewayEnabled),
        feexpayApiKey: tenant.feexpayApiKey || '',
        feexpayShopId: tenant.feexpayShopId || '',
        feexpayEnabled: Boolean(tenant.feexpayEnabled),
        monerooSecretKey: tenant.monerooSecretKey || '',
        monerooEnabled: Boolean(tenant.monerooEnabled),
        plan: {
          id: tenant.plan?.id || tenant.planId,
          name: tenant.plan?.name || 'Free',
          description: tenant.plan?.description,
          priceMonthly: tenant.plan?.priceMonthly || 0,
          marginDiscountPercent: tenant.plan?.marginDiscountPercent || 0,
          features: parsedFeatures,
        },
      },
    });
  } catch (error: any) {
    console.error('Error verifying reseller session:', error);
    return NextResponse.json({ authenticated: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, email, password, name, storeName, subdomain, planId, billingInterval, paymentMethod } = body;

    // LOGIN ACTION
    if (action === 'login') {
      if (!email || !password) {
        return NextResponse.json(
          { success: false, message: 'Email et mot de passe requis' },
          { status: 400 }
        );
      }

      const tenant = await prisma.tenant.findUnique({
        where: { email: email.toLowerCase().trim() },
        include: { plan: true },
      });

      if (!tenant) {
        return NextResponse.json(
          { success: false, message: 'Aucun compte revendeur associé à cet email' },
          { status: 401 }
        );
      }

      if (!tenant.isActive) {
        return NextResponse.json(
          { success: false, message: 'Ce compte revendeur a été suspendu par l\'administrateur' },
          { status: 403 }
        );
      }

      const cleanPassword = String(password || '').trim();
      const dbPassword = String(tenant.password || '').trim();

      if (tenant.password !== password && dbPassword !== cleanPassword) {
        return NextResponse.json(
          { success: false, message: 'Mot de passe incorrect. Vérifiez la casse (majuscules/minuscules) et qu\'il n\'y ait aucun espace superflu.' },
          { status: 401 }
        );
      }

      const res = NextResponse.json({
        success: true,
        message: 'Connexion réussie',
        reseller: {
          id: tenant.id,
          name: tenant.name,
          email: tenant.email,
          subdomain: tenant.subdomain,
          storeName: tenant.storeName,
          planId: tenant.planId,
        },
      });

      res.cookies.set('reseller_session', tenant.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });

      return res;
    }

    // REGISTER ACTION
    if (action === 'register') {
      if (!email || !password || !name) {
        return NextResponse.json(
          { success: false, message: 'Nom, email et mot de passe requis' },
          { status: 400 }
        );
      }

      const cleanEmail = email.toLowerCase().trim();
      const existingEmail = await prisma.tenant.findUnique({
        where: { email: cleanEmail },
      });

      if (existingEmail) {
        return NextResponse.json(
          { success: false, message: 'Un compte avec cet email existe déjà' },
          { status: 400 }
        );
      }

      // Generate or clean subdomain
      let cleanSubdomain = sanitizeSubdomain(subdomain || storeName || name);
      if (!cleanSubdomain || cleanSubdomain.length < 3) {
        cleanSubdomain = `boutique-${Date.now().toString(36)}`;
      }

      // Check subdomain availability
      const existingSubdomain = await prisma.tenant.findUnique({
        where: { subdomain: cleanSubdomain },
      });

      if (existingSubdomain) {
        cleanSubdomain = `${cleanSubdomain}-${Math.floor(100 + Math.random() * 900)}`;
      }

      const chosenPlanId = planId || 'free';
      // Verify plan exists
      const targetPlan = await prisma.saasPlan.findUnique({
        where: { id: chosenPlanId },
      });

      // SECURITY RULE: Every new reseller account is strictly created with planId: 'free'!
      // Paid plans (starter, pro) are ONLY activated once payment is confirmed via payment gateway callback.
      const newTenant = await prisma.tenant.create({
        data: {
          name: name.trim(),
          email: cleanEmail,
          password: password,
          storeName: storeName?.trim() || `${name.trim()}'s Store`,
          subdomain: cleanSubdomain,
          planId: 'free',
          planStatus: targetPlan && targetPlan.id !== 'free' ? 'PENDING_PAYMENT' : 'ACTIVE',
          themeColor: 'sky',
          tagline: 'Boutique officielle de licences et abonnements digitaux',
          walletBalance: 0.0,
          totalEarnings: 0.0,
        },
      });

      // If a paid plan was chosen (starter or pro), trigger the payment gateway checkout
      if (targetPlan && targetPlan.id !== 'free') {
        const interval = billingInterval === 'yearly' ? 'yearly' : 'monthly';
        const priceUsd = interval === 'yearly' ? targetPlan.priceYearly : targetPlan.priceMonthly;
        const priceXof = Math.max(50, Math.round(priceUsd * 650));
        const subNonce = Date.now().toString().slice(-6);
        const ticketCode = `SUB_${newTenant.id}_${targetPlan.id}_${interval}_${subNonce}`;

        const host = req.headers.get('host') || '';
        const appUrl = (process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'https://abonnementspro.com').replace(/\/$/, '');
        const baseUrl = (host && !host.includes('localhost')) ? `https://${host}` : appUrl;

        // A. Moneroo Payment Gateway
        if (paymentMethod === 'MONEROO') {
          try {
            const returnUrl = `${baseUrl}/api/moneroo/callback?ticketCode=${encodeURIComponent(ticketCode)}`;
            const { checkoutUrl } = await initializeMonerooPayment({
              amount: priceXof,
              currency: 'XOF',
              amountUsd: priceUsd,
              ticketCode,
              description: `Abonnement ${targetPlan.name} ${interval === 'yearly' ? 'Annuel' : 'Mensuel'} - ${newTenant.storeName}`.replace(/[^a-zA-Z0-9 _-]/g, ''),
              customerEmail: newTenant.email,
              customerName: newTenant.name,
              returnUrl,
            });

            if (checkoutUrl) {
              const resWithPay = NextResponse.json({
                success: true,
                paymentUrl: checkoutUrl,
                ticketCode,
                message: `Compte créé ! Redirection vers le paiement Moneroo pour l'offre ${targetPlan.name}...`,
                reseller: {
                  id: newTenant.id,
                  name: newTenant.name,
                  email: newTenant.email,
                  subdomain: newTenant.subdomain,
                  storeName: newTenant.storeName,
                  planId: newTenant.planId,
                },
              });
              resWithPay.cookies.set('reseller_session', newTenant.id, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60 * 24 * 30,
              });
              return resWithPay;
            }
          } catch (monerooErr) {
            console.error('Moneroo register payment error:', monerooErr);
          }
        }

        // B. FeexPay Payment Gateway (Default & Recommended)
        try {
          const feexConfig = await getFeexPayConfig();
          if (feexConfig.enabled && feexConfig.apiKey && feexConfig.shopId) {
            const callbackUrl = `${baseUrl}/api/feexpay/callback?custom_id=${encodeURIComponent(ticketCode)}&ticketCode=${encodeURIComponent(ticketCode)}`;
            const callbackErrorUrl = `${baseUrl}/api/feexpay/callback?custom_id=${encodeURIComponent(ticketCode)}&status=FAILED`;

            const feexPayRes = await fetch('https://api-v2.feexpay.me/api/feexlinks/generate', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${feexConfig.apiKey}`,
              },
              body: JSON.stringify({
                shop: feexConfig.shopId,
                amount: convertUsdToXof(priceUsd),
                description: `Abonnement ${targetPlan.name} ${interval === 'yearly' ? 'Annuel' : 'Mensuel'} #${subNonce}`.replace(/[^a-zA-Z0-9 _-]/g, '').slice(0, 80),
                paymentMethod: 'ALL',
                expireIn: 60,
                range: 0,
                custom_id: ticketCode,
                callback_url: callbackUrl,
                callback_error: callbackErrorUrl,
              }),
            });

            const feexData = await feexPayRes.json().catch(() => ({}));
            const paymentUrl = feexData.urlPay || feexData.url;

            if (feexPayRes.ok && paymentUrl) {
              const resWithPay = NextResponse.json({
                success: true,
                paymentUrl,
                ticketCode,
                message: `Compte créé ! Redirection vers FeexPay pour activer l'offre ${targetPlan.name}...`,
                reseller: {
                  id: newTenant.id,
                  name: newTenant.name,
                  email: newTenant.email,
                  subdomain: newTenant.subdomain,
                  storeName: newTenant.storeName,
                  planId: newTenant.planId,
                },
              });
              resWithPay.cookies.set('reseller_session', newTenant.id, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60 * 24 * 30,
              });
              return resWithPay;
            }
          }
        } catch (feexErr) {
          console.error('FeexPay register payment error:', feexErr);
        }

        // C. Fallback: If gateway is temporarily unavailable, account remains on Free
        // and user is redirected to their subscription tab to retry
        const resFallback = NextResponse.json({
          success: true,
          redirectTo: `/reseller/dashboard?tab=subscription&pendingPlan=${targetPlan.id}`,
          message: `Compte revendeur créé avec succès sur l'offre Free ! Veuillez finaliser le paiement de votre offre ${targetPlan.name} dans la rubrique Abonnement.`,
          reseller: {
            id: newTenant.id,
            name: newTenant.name,
            email: newTenant.email,
            subdomain: newTenant.subdomain,
            storeName: newTenant.storeName,
            planId: newTenant.planId,
          },
        });
        resFallback.cookies.set('reseller_session', newTenant.id, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 30,
        });
        return resFallback;
      }

      // Free Plan Flow
      const res = NextResponse.json({
        success: true,
        message: 'Compte revendeur créé avec succès sur l\'offre Free',
        redirectTo: '/reseller/dashboard',
        reseller: {
          id: newTenant.id,
          name: newTenant.name,
          email: newTenant.email,
          subdomain: newTenant.subdomain,
          storeName: newTenant.storeName,
          planId: newTenant.planId,
        },
      });

      res.cookies.set('reseller_session', newTenant.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });

      return res;
    }

    return NextResponse.json({ success: false, message: 'Action invalide' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in reseller auth:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true, message: 'Déconnexion réussie' });
  res.cookies.delete('reseller_session');
  return res;
}
