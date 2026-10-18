import React from 'react';

export default function JsonLd() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'OnlineStore',
    name: 'Entrepreneurs Positifs',
    alternateName: 'Entrepreneurs Positifs PRO',
    url: 'https://abonnementspro.com',
    logo: 'https://abonnementspro.com/logo.png',
    image: 'https://abonnementspro.com/logo.png',
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

  const globalFaqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Comment acheter un compte ou abonnement digital sur Abonnements Pro ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sélectionnez simplement le produit ou abonnement souhaité dans notre catalogue (Canva Pro, Netflix, ChatGPT, IPTV, API Claude, etc.), indiquez la quantité et validez votre commande. Vous pouvez régler instantanément par Mobile Money ou Carte Bancaire et vos identifiants sécurisés vous sont livrés en direct.',
        },
      },
      {
        '@type': 'Question',
        name: 'Quels sont les modes de paiement acceptés (Mobile Money, Carte) ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Nous acceptons les règlements par Mobile Money dans toute l’Afrique (MTN Mobile Money, Moov Money, Orange Money, Celtiis Cash, Wave), par Carte Bancaire internationale (Visa, Mastercard) et par Cryptomonnaies.',
        },
      },
      {
        '@type': 'Question',
        name: 'En combien de temps la livraison est-elle effectuée ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'La livraison est 100% automatique et instantanée (en moins de 2 minutes). Dès que le paiement est confirmé, vos identifiants ou liens d’accès s’affichent sur votre écran et restent consultables à tout moment via votre code ticket sécurisé.',
        },
      },
      {
        '@type': 'Question',
        name: 'Comment fonctionne l’activation de numéros virtuels OTP SMS ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sur notre module OTP, sélectionnez le pays et l’application souhaitée (WhatsApp, Telegram, OpenAI, Google, TikTok, etc.). Un numéro temporaire vous est attribué immédiatement. Entrez-le sur l’application et le code SMS de vérification apparaît en direct sur votre écran.',
        },
      },
      {
        '@type': 'Question',
        name: 'Comment devenir revendeur officiel et avoir sa propre boutique ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Rendez-vous dans la section Revendeur pour créer votre compte en 1 minute. Vous obtenez votre propre boutique personnalisée sous le format https://votre-boutique.abonnementspro.com avec vos marges bénéficiaires libres et des tarifs grossistes exclusifs avec jusqu’à 30% de remise.',
        },
      },
    ],
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(globalFaqSchema) }}
      />
    </>
  );
}
