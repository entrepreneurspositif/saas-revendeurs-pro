/**
 * SaaS Pricing & Plan Features Definition
 * Handles multi-tenant plan features, margins, and calculations.
 * 
 * DISCOUNT LOGIC:
 * - Free: 0% discount on Super Admin margin (reseller buys at base retail price, redefines their own prices)
 * - Starter: 35% discount on Super Admin margin (Cs + 65% of Msa)
 * - Pro: 60% discount on Super Admin margin (Cs + 40% of Msa)
 * Reductions apply EXCLUSIVELY to the platform's profit margin, protecting supplier cost!
 */

export interface SaasFeatureDefinition {
  id: string;
  name: string;
  description: string;
  category: 'storefront' | 'catalog' | 'tools' | 'support';
}

export const SAAS_AVAILABLE_FEATURES: SaasFeatureDefinition[] = [
  {
    id: 'custom_pricing',
    name: 'Redéfinition des prix de vente',
    description: 'Fixer et ajuster librement ses propres tarifs et marges de revente',
    category: 'catalog',
  },
  {
    id: 'custom_subdomain',
    name: 'Sous-domaine personnalisé',
    description: 'Boutique dédiée sur un sous-domaine configurable (ex: maboutique.site.com)',
    category: 'storefront',
  },
  {
    id: 'custom_domain',
    name: 'Nom de domaine propre (DNS)',
    description: 'Connecter son propre nom de domaine personnalisé (ex: shop.mamarque.com)',
    category: 'storefront',
  },
  {
    id: 'custom_branding',
    name: 'Branding & Identité visuelle',
    description: 'Personnaliser le logo, la bannière, le slogan et les informations de contact',
    category: 'storefront',
  },
  {
    id: 'custom_theme',
    name: 'Thèmes & Couleurs sur-mesure',
    description: 'Sélectionner les thèmes et nuances de couleurs de sa vitrine',
    category: 'storefront',
  },
  {
    id: 'otp_resale',
    name: 'Revente de numéros OTP SMS',
    description: 'Intégrer le catalogue de vérification téléphonique OTP dans sa boutique',
    category: 'catalog',
  },
  {
    id: 'exclusive_products',
    name: 'Catalogue Produits Exclusifs VIP',
    description: 'Revendre les articles VIP et exclusifs à forte valeur ajoutée',
    category: 'catalog',
  },
  {
    id: 'ticket_support',
    name: 'Support direct & Tickets clients',
    description: 'Messagerie intégrée et suivi des réclamations clients',
    category: 'support',
  },
  {
    id: 'analytics_pixels',
    name: 'Pixels Publicitaires (FB, TikTok, GA4)',
    description: 'Suivi des conversions avec les tags Meta Pixel, TikTok Pixel et Google Analytics',
    category: 'tools',
  },
  {
    id: 'export_reports',
    name: 'Exportation des rapports comptables (CSV)',
    description: 'Télécharger les bilans de ventes, commissions et marges au format CSV',
    category: 'tools',
  },
  {
    id: 'custom_announcement',
    name: 'Bannière d\'annonce promotionnelle',
    description: 'Afficher un message flash promotionnel en haut de sa boutique',
    category: 'storefront',
  },
  {
    id: 'priority_fulfillment',
    name: 'Traitement prioritaire des commandes',
    description: 'Synchronisation et livraison ultra-prioritaire auprès des fournisseurs',
    category: 'support',
  },
];

export interface DefaultPlanData {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  marginDiscountPercent: number;
  features: string[];
  sortOrder: number;
}

export const DEFAULT_SAAS_PLANS: DefaultPlanData[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Offre gratuite sans engagement. Idéal pour débuter votre activité, fixer vos prix de revente et tester votre vitrine.',
    priceMonthly: 0,
    priceYearly: 0,
    marginDiscountPercent: 0,
    features: ['custom_pricing', 'custom_subdomain', 'ticket_support'],
    sortOrder: 1,
  },
  {
    id: 'starter',
    name: 'Starter',
    description: 'Bénéficiez de remises grossistes réelles (jusqu\'à 15-20% d\'économie par produit), d\'une vitrine personnalisée et des outils marketing.',
    priceMonthly: 19,
    priceYearly: 190,
    marginDiscountPercent: 35,
    features: [
      'custom_pricing',
      'custom_subdomain',
      'custom_branding',
      'custom_theme',
      'otp_resale',
      'exclusive_products',
      'ticket_support',
      'analytics_pixels',
      'export_reports',
      'custom_announcement',
    ],
    sortOrder: 2,
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Remise grossiste maximale (jusqu\'à 25-30% d\'économie par produit), connexion de votre propre nom de domaine DNS et support VIP prioritaire.',
    priceMonthly: 49,
    priceYearly: 490,
    marginDiscountPercent: 60,
    features: [
      'custom_pricing',
      'custom_subdomain',
      'custom_domain',
      'custom_branding',
      'custom_theme',
      'otp_resale',
      'exclusive_products',
      'ticket_support',
      'analytics_pixels',
      'export_reports',
      'custom_announcement',
      'priority_fulfillment',
    ],
    sortOrder: 3,
  },
];

export interface PricingCalculationResult {
  supplierCost: number;          // Cs : coût fournisseur brut incompressible
  baseSellingPrice: number;      // Pbase : tarif public défini par le Super Admin
  superAdminMargin: number;      // Msa = max(0, Pbase - Cs) : marge brute du Super Admin
  discountPercent: number;       // D : pourcentage de réduction (Free=0%, Starter=35%, Pro=60%)
  discountAmount: number;        // Msa * (D / 100) : économie accordée au revendeur
  realDiscountPercent: number;   // Réduction RÉELLE en % sur le prix public du produit : (discountAmount / baseSellingPrice) * 100
  resellerBuyPrice: number;      // Pbuy = Cs + Msa * (1 - D/100) : prix d'achat grossiste du revendeur
  resellerSellingPrice: number;  // Pretail : prix final affiché aux clients du revendeur
  resellerProfit: number;        // Pretail - Pbuy : marge nette perçue par le revendeur
  platformProfit: number;        // Pbuy - Cs : marge nette conservée par le Super Admin
}

/**
 * Calcule avec rigueur financière les tarifs d'un article pour un tenant en fonction de son plan SaaS.
 * 
 * La formule garantit :
 * 1. Le coût fournisseur (Cs) n'est JAMAIS réduit (sécurité financière absolue).
 * 2. La réduction D% est déduite EXCLUSIVEMENT de la marge Super Admin (Msa).
 * 3. Le revendeur achète au prix grossiste Pbuy et fixe son prix de vente Pretail.
 */
export function calculateSaasPrices(params: {
  supplierCost: number;
  baseSellingPrice: number;
  discountPercent: number;
  customSellingPrice?: number | null;
}): PricingCalculationResult {
  const supplierCost = Math.max(0, Number(params.supplierCost || 0));
  const baseSellingPrice = Math.max(supplierCost, Number(params.baseSellingPrice || 0));
  const superAdminMargin = Math.max(0, baseSellingPrice - supplierCost);
  const discountPercent = Math.max(0, Math.min(100, Number(params.discountPercent || 0)));

  // Réduction calculée UNIQUEMENT sur la marge Super Admin
  const discountAmount = parseFloat((superAdminMargin * (discountPercent / 100)).toFixed(2));
  const discountedAdminMargin = parseFloat((superAdminMargin - discountAmount).toFixed(2));

  // Réduction RÉELLE en % sur le tarif de base public
  const realDiscountPercent =
    baseSellingPrice > 0 && discountAmount > 0
      ? parseFloat(((discountAmount / baseSellingPrice) * 100).toFixed(1))
      : 0;

  // Prix de cession / achat pour le revendeur
  const resellerBuyPrice = parseFloat((supplierCost + discountedAdminMargin).toFixed(2));

  // Prix de vente fixé par le revendeur (ou tarif de base par défaut)
  const resellerSellingPrice =
    params.customSellingPrice !== undefined &&
    params.customSellingPrice !== null &&
    Number(params.customSellingPrice) > 0
      ? parseFloat(Number(params.customSellingPrice).toFixed(2))
      : baseSellingPrice;

  // Bénéfice net revendeur
  const resellerProfit = parseFloat(Math.max(0, resellerSellingPrice - resellerBuyPrice).toFixed(2));

  // Bénéfice net conservé par la plateforme Super Admin
  const platformProfit = parseFloat(Math.max(0, resellerBuyPrice - supplierCost).toFixed(2));

  return {
    supplierCost,
    baseSellingPrice,
    superAdminMargin,
    discountPercent,
    discountAmount,
    realDiscountPercent,
    resellerBuyPrice,
    resellerSellingPrice,
    resellerProfit,
    platformProfit,
  };
}
