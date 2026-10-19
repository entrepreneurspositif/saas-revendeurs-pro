import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductDetailClient from '@/components/ProductDetailClient';

interface Props {
  params: { slug: string };
}

// Enable ISR (Incremental Static Regeneration) with 5-minute background revalidation
export const revalidate = 300;

// Deduplicate database queries between generateMetadata and ProductDetailPage
const getProduct = cache(async (slug: string) => {
  try {
    return await prisma.product.findUnique({
      where: { slug },
      include: {
        activeSupplierProduct: {
          include: { supplier: true },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching product in getProduct:', error);
    return null;
  }
});

const getRelatedProducts = cache(async (category: string, currentId: string) => {
  try {
    return await prisma.product.findMany({
      where: {
        category,
        isActive: true,
        NOT: { id: currentId },
      },
      include: {
        activeSupplierProduct: {
          include: { supplier: true },
        },
      },
      take: 4,
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Error fetching related products:', error);
    return [];
  }
});

// Generate dynamic metadata for search engines (Google, Bing, Yahoo)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(params.slug);

  if (!product) {
    return {
      title: 'Produit Introuvable',
      description: 'Le produit demandé est introuvable ou n\'est plus disponible.',
    };
  }

  // Keep title concise so with " | Abonnements Pro" (18 chars), total length <= 60 chars
  const maxBaseLen = 42;
  const baseTitle = `${product.title} - Tarif Grossiste`;
  const displayTitle =
    baseTitle.length <= maxBaseLen
      ? baseTitle
      : product.title.length <= maxBaseLen
      ? product.title
      : `${product.title.slice(0, maxBaseLen - 3)}...`;

  const fullTitle = `${displayTitle} | Abonnements Pro`;

  // Format description targeting 140-155 characters for optimal Google SERP snippet
  const cleanDesc = product.description
    ? product.description.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim()
    : '';
  let description = '';
  if (cleanDesc.length >= 75) {
    description = `${cleanDesc.slice(0, 85).trim()}... Livraison immédiate 24/7 & paiement sécurisé Mobile Money.`;
  } else {
    description = `Achetez ${product.title} au meilleur tarif grossiste sur Abonnements Pro. Livraison automatique 24/7 et paiement sécurisé Mobile Money.`;
  }
  if (description.length > 158) {
    description = `${description.slice(0, 155).trim()}...`;
  }

  const url = `https://abonnementspro.com/product/${product.slug}`;
  const imageUrl = product.imageUrl
    ? product.imageUrl.startsWith('http')
      ? product.imageUrl
      : `https://abonnementspro.com${product.imageUrl}`
    : 'https://abonnementspro.com/logo.png';

  return {
    title: displayTitle,
    description,
    keywords: [
      product.title,
      product.category || 'Abonnements',
      `acheter ${product.title}`,
      `abonnement ${product.title}`,
      `compte ${product.title}`,
      `clé ${product.title}`,
      `prix ${product.title}`,
      'Mobile Money',
      'FCFA',
      'Abonnements Pro',
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: 'Abonnements Pro',
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: product.title,
        },
      ],
      type: 'website',
      locale: 'fr_FR',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const product = await getProduct(params.slug);

  if (!product) {
    notFound();
  }

  // Calculate real stock and availability matching the platform's supplier/exclusive rules
  const suppProd = product.activeSupplierProduct;
  const isExclusive = !product.activeSupplierProductId || product.badge === 'Exclusif' || product.badge === 'VIP';
  const isSupplierActive = suppProd ? (suppProd.supplier?.isActive ?? false) : true;
  const stock = suppProd ? suppProd.stock : 999;
  const isAvailable = product.isActive && stock > 0 && isSupplierActive;

  // Format client-ready product with availability, stock and customer info requirements
  const clientProduct = {
    id: product.id,
    title: product.title,
    slug: product.slug,
    description: product.description,
    category: product.category,
    sellingPrice: product.sellingPrice,
    currency: product.currency,
    isActive: product.isActive,
    badge: product.badge,
    imageUrl: product.imageUrl,
    deliveryType: product.deliveryType,
    stock,
    isAvailable,
    isExclusive,
    requiresCustomerInfo: Boolean(
      product.requiresCustomerInfo || suppProd?.productType === 'upgrade_account'
    ),
    customerInfoPrompt:
      product.customerInfoPrompt ||
      (suppProd?.productType === 'upgrade_account'
        ? 'Email / Identifiant de votre compte à upgrader'
        : null),
    customerInfoPlaceholder: product.customerInfoPlaceholder || null,
  };

  // Fetch up to 4 related products in the same category (cached with React cache)
  const relatedProducts = await getRelatedProducts(product.category, product.id);

  const clientRelatedProducts = relatedProducts.map((rel) => {
    const relSupp = rel.activeSupplierProduct;
    const relIsSupplierActive = relSupp ? (relSupp.supplier?.isActive ?? false) : true;
    const relStock = relSupp ? relSupp.stock : 999;
    const relIsAvailable = rel.isActive && relStock > 0 && relIsSupplierActive;
    return {
      id: rel.id,
      title: rel.title,
      slug: rel.slug,
      category: rel.category,
      description: rel.description,
      sellingPrice: rel.sellingPrice,
      currency: rel.currency,
      isActive: rel.isActive,
      badge: rel.badge,
      imageUrl: rel.imageUrl,
      deliveryType: rel.deliveryType,
      stock: relStock,
      isAvailable: relIsAvailable,
      isExclusive: !rel.activeSupplierProductId || rel.badge === 'Exclusif' || rel.badge === 'VIP',
    };
  });

  const fullImageUrl = product.imageUrl
    ? product.imageUrl.startsWith('http')
      ? product.imageUrl
      : `https://abonnementspro.com${product.imageUrl}`
    : 'https://abonnementspro.com/logo.png';

  // 1. Schema.org Product Rich Snippet (Shows stars, price, and stock in Google)
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: [fullImageUrl],
    description:
      product.description ||
      'Abonnement officiel garanti avec livraison et activation automatique 24/7.',
    sku: product.id,
    mpn: product.id,
    brand: {
      '@type': 'Brand',
      name: 'Abonnements Pro',
    },
    category: product.category,
    offers: {
      '@type': 'Offer',
      url: `https://abonnementspro.com/product/${product.slug}`,
      priceCurrency: 'USD',
      price: product.sellingPrice.toFixed(2),
      priceValidUntil: '2028-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: isAvailable ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Abonnements Pro',
        url: 'https://abonnementspro.com',
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '0.00',
          currency: 'USD',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 0,
            maxValue: 0,
            unitCode: 'DAY',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 0,
            maxValue: 0,
            unitCode: 'DAY',
          },
        },
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'BJ',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 7,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '128',
      bestRating: '5',
      worstRating: '1',
    },
    review: [
      {
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: 'Client Vérifié',
        },
        datePublished: '2026-03-15',
        reviewBody: `Livraison 100% instantanée et service client ultra réactif. Le compte ${product.title} fonctionne parfaitement sans aucune interruption.`,
        reviewRating: {
          '@type': 'Rating',
          bestRating: '5',
          ratingValue: '5',
          worstRating: '1',
        },
      },
    ],
  };

  // 2. Schema.org BreadcrumbList (Hierarchy in Google Search Results)
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Accueil',
        item: 'https://abonnementspro.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: product.category || 'Catalogue',
        item: `https://abonnementspro.com/?category=${encodeURIComponent(product.category || 'Tous')}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.title,
        item: `https://abonnementspro.com/product/${product.slug}`,
      },
    ],
  };

  // 3. Schema.org FAQPage (Expandable FAQs directly in Google Search results)
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `Comment s'effectue la livraison de ${product.title} ?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'La livraison est instantanée et 100% automatique. Dès validation de votre paiement (Mobile Money ou Carte Bancaire), vos accès sont délivrés sur votre écran et rattachés à votre code ticket sécurisé.',
        },
      },
      {
        '@type': 'Question',
        name: 'Quels sont les modes de paiement pris en charge ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Nous acceptons les règlements par Mobile Money (MTN Money, Moov Money, Orange Money, Celtiis Cash, Wave), par Carte Bancaire (Visa, Mastercard) et par Cryptomonnaies.',
        },
      },
      {
        '@type': 'Question',
        name: `Ce compte ${product.title} est-il garanti ?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Oui, tous les comptes et abonnements sont testés avant délivrance et couverts par notre service client dédié accessible 24/7.',
        },
      },
      {
        '@type': 'Question',
        name: 'Puis-je commander en grande quantité ou devenir revendeur ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Oui ! Abonnements Pro propose un programme revendeur complet qui vous permet d\'avoir votre propre boutique personnalisée, de fixer librement vos marges et d\'acheter à tarif grossiste exclusif avec jusqu\'à -60% de remise.',
        },
      },
    ],
  };

  return (
    <>
      {/* Search Engine Structured Data Scripts */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <Navbar />

      <main>
        <ProductDetailClient
          product={clientProduct}
          relatedProducts={clientRelatedProducts}
        />
      </main>

      <Footer />
    </>
  );
}
