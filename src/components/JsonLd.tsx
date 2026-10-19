import React from 'react';

export default function JsonLd() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'OnlineStore'],
    name: 'Abonnements Pro',
    legalName: 'Entrepreneurs Positifs PRO',
    alternateName: ['Abonnements Pro', 'Entrepreneurs Positifs'],
    url: 'https://abonnementspro.com',
    logo: 'https://abonnementspro.com/logo.png',
    image: 'https://abonnementspro.com/logo.png',
    description:
      'Fournisseur direct et officiel d’abonnements digitaux, comptes streaming, outils d’IA, numéros OTP SMS et licences logiciels avec livraison automatique instantanée 24/7.',
    currenciesAccepted: 'XOF, USD',
    paymentAccepted:
      'Mobile Money, MTN Mobile Money, Moov Money, Orange Money, Celtiis Cash, Wave, Carte Bancaire, Cryptomonnaies',
    priceRange: '100 FCFA - 100000 FCFA',
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        url: 'https://t.me/MakeMoney01_bot',
        availableLanguage: ['French', 'English'],
      },
    ],
    sameAs: ['https://t.me/MakeMoney01_bot'],
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'BJ',
    },
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Abonnements Pro',
    alternateName: 'Entrepreneurs Positifs',
    url: 'https://abonnementspro.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://abonnementspro.com/?search={search_term_string}',
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
