import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('reseller_session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ success: false, message: 'Non authentifié' }, { status: 401 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: sessionToken },
      select: {
        id: true,
        subdomain: true,
        storeName: true,
        walletBalance: true,
        totalEarnings: true,
        customGatewayEnabled: true,
        feexpayApiKey: true,
        feexpayShopId: true,
        feexpayEnabled: true,
        monerooSecretKey: true,
        monerooEnabled: true,
      },
    });

    if (!tenant) {
      return NextResponse.json({ success: false, message: 'Revendeur introuvable' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      gateways: {
        customGatewayEnabled: Boolean(tenant.customGatewayEnabled),
        feexpayApiKey: tenant.feexpayApiKey || '',
        feexpayShopId: tenant.feexpayShopId || '',
        feexpayEnabled: Boolean(tenant.feexpayEnabled),
        monerooSecretKey: tenant.monerooSecretKey || '',
        monerooEnabled: Boolean(tenant.monerooEnabled),
        walletBalance: tenant.walletBalance,
        totalEarnings: tenant.totalEarnings,
      },
    });
  } catch (error: any) {
    console.error('Error fetching reseller gateways:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('reseller_session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ success: false, message: 'Non authentifié' }, { status: 401 });
    }

    const body = await req.json();
    const {
      customGatewayEnabled,
      feexpayApiKey,
      feexpayShopId,
      feexpayEnabled,
      monerooSecretKey,
      monerooEnabled,
    } = body;

    const updatedTenant = await prisma.tenant.update({
      where: { id: sessionToken },
      data: {
        customGatewayEnabled: Boolean(customGatewayEnabled),
        feexpayApiKey: feexpayApiKey !== undefined ? String(feexpayApiKey).trim() : undefined,
        feexpayShopId: feexpayShopId !== undefined ? String(feexpayShopId).trim() : undefined,
        feexpayEnabled: Boolean(feexpayEnabled),
        monerooSecretKey: monerooSecretKey !== undefined ? String(monerooSecretKey).trim() : undefined,
        monerooEnabled: Boolean(monerooEnabled),
      },
      select: {
        id: true,
        customGatewayEnabled: true,
        feexpayApiKey: true,
        feexpayShopId: true,
        feexpayEnabled: true,
        monerooSecretKey: true,
        monerooEnabled: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Configuration des passerelles de paiement mise à jour avec succès !',
      gateways: {
        customGatewayEnabled: updatedTenant.customGatewayEnabled,
        feexpayApiKey: updatedTenant.feexpayApiKey || '',
        feexpayShopId: updatedTenant.feexpayShopId || '',
        feexpayEnabled: updatedTenant.feexpayEnabled,
        monerooSecretKey: updatedTenant.monerooSecretKey || '',
        monerooEnabled: updatedTenant.monerooEnabled,
      },
    });
  } catch (error: any) {
    console.error('Error updating reseller gateways:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
