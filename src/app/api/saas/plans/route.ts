import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DEFAULT_SAAS_PLANS } from '@/lib/saasPricingHelper';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let plans = await prisma.saasPlan.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    if (!plans || plans.length === 0) {
      // Auto-seed default plans if empty
      for (const defPlan of DEFAULT_SAAS_PLANS) {
        await prisma.saasPlan.upsert({
          where: { id: defPlan.id },
          update: {},
          create: {
            id: defPlan.id,
            name: defPlan.name,
            description: defPlan.description,
            priceMonthly: defPlan.priceMonthly,
            priceYearly: defPlan.priceYearly,
            currency: 'USD',
            marginDiscountPercent: defPlan.marginDiscountPercent,
            features: JSON.stringify(defPlan.features),
            sortOrder: defPlan.sortOrder,
          },
        });
      }
      plans = await prisma.saasPlan.findMany({
        orderBy: { sortOrder: 'asc' },
      });
    }

    const formattedPlans = plans.map((p) => {
      let parsedFeatures: string[] = [];
      try {
        parsedFeatures = JSON.parse(p.features || '[]');
      } catch (e) {
        parsedFeatures = [];
      }
      return {
        ...p,
        features: parsedFeatures,
      };
    });

    return NextResponse.json({
      success: true,
      plans: formattedPlans,
    });
  } catch (error: any) {
    console.error('Error fetching SaaS plans:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { plans } = body;

    if (!Array.isArray(plans)) {
      return NextResponse.json(
        { success: false, message: 'La liste des offres (plans) est requise' },
        { status: 400 }
      );
    }

    for (const plan of plans) {
      if (!plan.id) continue;

      const featuresStr = Array.isArray(plan.features)
        ? JSON.stringify(plan.features)
        : typeof plan.features === 'string'
        ? plan.features
        : '[]';

      await prisma.saasPlan.upsert({
        where: { id: plan.id },
        update: {
          name: plan.name,
          description: plan.description,
          priceMonthly: Number(plan.priceMonthly ?? 0),
          priceYearly: Number(plan.priceYearly ?? 0),
          marginDiscountPercent: Number(plan.marginDiscountPercent ?? 0),
          features: featuresStr,
          isActive: plan.isActive ?? true,
        },
        create: {
          id: plan.id,
          name: plan.name || plan.id,
          description: plan.description || '',
          priceMonthly: Number(plan.priceMonthly ?? 0),
          priceYearly: Number(plan.priceYearly ?? 0),
          marginDiscountPercent: Number(plan.marginDiscountPercent ?? 0),
          features: featuresStr,
          isActive: plan.isActive ?? true,
          sortOrder: Number(plan.sortOrder ?? 0),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Offres SaaS et fonctionnalités mises à jour avec succès',
    });
  } catch (error: any) {
    console.error('Error updating SaaS plans:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
