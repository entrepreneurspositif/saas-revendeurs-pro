import { prisma } from './prisma';

export interface PricingMarginRule {
  id: string;
  minPrice: number;
  maxPrice: number;
  marginPercent: number; // e.g. 75 means +75% markup
}

export const DEFAULT_PRICING_RULES: PricingMarginRule[] = [
  { id: 'rule_1', minPrice: 0, maxPrice: 5, marginPercent: 75 },
  { id: 'rule_2', minPrice: 5.01, maxPrice: 20, marginPercent: 50 },
  { id: 'rule_3', minPrice: 20.01, maxPrice: 50, marginPercent: 40 },
  { id: 'rule_4', minPrice: 50.01, maxPrice: 100, marginPercent: 30 },
  { id: 'rule_5', minPrice: 100.01, maxPrice: 999999, marginPercent: 20 },
];

export async function getPricingRules(): Promise<PricingMarginRule[]> {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: 'pricing_margin_rules' },
    });
    if (setting && setting.value) {
      const parsed = JSON.parse(setting.value);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading pricing rules:', e);
  }
  return DEFAULT_PRICING_RULES;
}

export function calculateSellingPriceFromCost(costPrice: number, rules: PricingMarginRule[]): number {
  if (costPrice <= 0 || isNaN(costPrice)) return 0;

  const matchedRule = rules.find(
    (rule) => costPrice >= rule.minPrice && costPrice <= rule.maxPrice
  );

  const percent = matchedRule ? matchedRule.marginPercent : 75;
  const multiplier = 1 + percent / 100;
  const calculated = costPrice * multiplier;

  return Number(calculated.toFixed(2));
}
