import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Activation SMS OTP & Numéros Virtuels',
  description:
    'Recevez vos SMS de vérification OTP (WhatsApp, Telegram, Google, OpenAI) avec nos numéros virtuels temporaires. Activation instantanée 24/7.',
  keywords: [
    'numéro virtuel SMS',
    'OTP WhatsApp',
    'activation SMS',
    'numéro temporaire',
    'SMS verification',
    'Abonnements Pro',
  ],
  openGraph: {
    title: 'Activation SMS OTP & Numéros Virtuels | Abonnements Pro',
    description:
      'Recevez vos SMS de vérification OTP (WhatsApp, Telegram, Google, OpenAI) avec nos numéros virtuels temporaires. Activation instantanée 24/7.',
    url: 'https://abonnementspro.com/otp',
    images: ['/logo.png'],
  },
  alternates: {
    canonical: 'https://abonnementspro.com/otp',
  },
};

export default function OtpLayout({ children }: { children: React.ReactNode }) {
  const otpBreadcrumbSchema = {
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
        name: 'Activation SMS OTP',
        item: 'https://abonnementspro.com/otp',
      },
    ],
  };

  const otpFaqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Comment fonctionne la réception de SMS OTP en ligne ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sélectionnez le pays et le service désiré (WhatsApp, Telegram, OpenAI, Google, TikTok). Un numéro virtuel dédié vous est immédiatement fourni. Saisissez-le sur l\'application et le code SMS de validation apparaît en temps réel sur votre écran.',
        },
      },
      {
        '@type': 'Question',
        name: 'Que se passe-t-il si je ne reçois pas le code SMS ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Si aucun code SMS n\'est reçu dans le délai imparti, l\'opération est automatiquement annulée sans aucun débit sur votre solde.',
        },
      },
      {
        '@type': 'Question',
        name: 'Quels services en ligne peuvent être activés ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Vous pouvez activer WhatsApp, Telegram, ChatGPT / OpenAI, Google, Instagram, TikTok, Facebook, Discord, Twitter / X, Uber, Netflix et plus de 500 autres plateformes.',
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(otpBreadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(otpFaqSchema) }}
      />
      {children}
    </>
  );
}
