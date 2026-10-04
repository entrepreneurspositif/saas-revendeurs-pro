import React from 'react';

export default function JsonLd() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'OnlineStore',
    name: 'Entrepreneurs Positifs',
    alternateName: 'Entrepreneurs Positifs PRO',
    url: 'https://revente-abonnement.vercel.app',
    logo: 'https://revente-abonnement.vercel.app/logo.png',
    image: 'https://revente-abonnement.vercel.app/logo.png',
    description:
      'Fournisseur direct et officiel d’abonnements digitaux, comptes streaming, outils d’IA, numéros OTP SMS et licences logiciels avec livraison automatique instantanée 24/7.',
    currenciesAccepted: 'XOF, USD',
    paymentAccepted:
      'Mobile Money, MTN Mobile Money, Moov Money, Orange Money, Celtiis Cash, Wave, Carte Bancaire',
    priceRange: '100 FCFA - 100000 FCFA',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'BJ',
    },
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Entrepreneurs Positifs',
    url: 'https://revente-abonnement.vercel.app',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://revente-abonnement.vercel.app/?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  );
}
