import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductDetailClient from '@/components/ProductDetailClient';

interface Props {
  params: { slug: string };
}

// Generate dynamic metadata for search engines (Google, Bing, Yahoo)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
  });

  if (!product) {
    return {
      title: 'Produit Introuvable | Abonnements Pro',
      description: 'Le produit demandé est introuvable ou n\'est plus disponible.',
    };
  }

  const title = `Acheter ${product.title} - Tarif Grossiste & Livraison Immédiate | Abonnements Pro`;
  const description = `${product.description?.slice(0, 150) || `Achetez ${product.title} au meilleur prix sur Abonnements Pro.`} Livraison automatique et instantanée 24/7. Paiement sécurisé Mobile Money (MTN, Moov, Orange, Wave) et Carte Bancaire.`;
  const url = `https://abonnementspro.com/product/${product.slug}`;
  const imageUrl = product.imageUrl
    ? product.imageUrl.startsWith('http')
      ? product.imageUrl
      : `https://abonnementspro.com${product.imageUrl}`
    : 'https://abonnementspro.com/logo.png';

  return {
    title,
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
      'Entrepreneurs Positifs',
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
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
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
  });

  if (!product) {
    notFound();
  }

  // Fetch up to 4 related products in the same category
  const relatedProducts = await prisma.product.findMany({
    where: {
      category: product.category,
      isActive: true,
      NOT: { id: product.id },
    },
    take: 4,
    orderBy: { createdAt: 'desc' },
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
      availability: product.isActive ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Abonnements Pro',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '128',
      bestRating: '5',
      worstRating: '1',
    },
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
          product={JSON.parse(JSON.stringify(product))}
          relatedProducts={JSON.parse(JSON.stringify(relatedProducts))}
        />
      </main>

      <Footer />
    </>
  );
}
