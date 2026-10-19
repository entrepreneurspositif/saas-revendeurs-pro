import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Offres Exclusives & Produits Premium',
  description:
    'Découvrez nos offres exclusives et produits digitaux premium. Abonnements VIP et comptes garantis avec livraison immédiate 24/7 au meilleur tarif.',
  keywords: [
    'produits exclusifs',
    'offres premium',
    'abonnements VIP',
    'licences exclusives',
    'Abonnements Pro',
  ],
  openGraph: {
    title: 'Offres Exclusives & Produits Premium | Abonnements Pro',
    description:
      'Découvrez nos offres exclusives et produits digitaux premium. Abonnements VIP et comptes garantis avec livraison immédiate 24/7 au meilleur tarif.',
    url: 'https://abonnementspro.com/exclusifs',
    images: ['/logo.png'],
  },
  alternates: {
    canonical: 'https://abonnementspro.com/exclusifs',
  },
};

export default function ExclusifsLayout({ children }: { children: React.ReactNode }) {
  const exclusifsBreadcrumbSchema = {
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
        name: 'Offres Exclusives',
        item: 'https://abonnementspro.com/exclusifs',
      },
    ],
  };

  const exclusifsFaqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Que sont les offres et produits exclusifs sur Abonnements Pro ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Ce sont des méthodes privées, licences logicielles d\'entreprise, et abonnements VIP fournis directement avec un support prioritaire et des garanties de remplacement exclusives.',
        },
      },
      {
        '@type': 'Question',
        name: 'Puis-je demander l\'ajout d\'un produit digital non listé ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Oui, via notre formulaire de demande sur mesure ou notre bot Telegram 24/7. Notre équipe approvisionne l\'accès demandé au meilleur tarif sous 24h.',
        },
      },
      {
        '@type': 'Question',
        name: 'Comment s\'effectue la livraison des produits exclusifs ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Dès validation de votre règlement (Mobile Money ou Carte Bancaire), vos accès sont livrés automatiquement et archivés dans votre espace ticket.',
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(exclusifsBreadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(exclusifsFaqSchema) }}
      />
      {children}
    </>
  );
}
