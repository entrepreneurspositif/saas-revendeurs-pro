import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { CurrencyProvider } from '@/components/CurrencyContext';
import AnnouncementBanner from '@/components/AnnouncementBanner';
import MarketingTracker from '@/components/MarketingTracker';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  metadataBase: new URL('https://abonnementspro.com'),
  title: {
    default: 'Abonnements Pro | Fournisseur d\'Abonnements Digitaux & IA',
    template: '%s | Abonnements Pro',
  },
  description:
    'Fournisseur direct d\'abonnements streaming, outils IA, numéros OTP et licences. Livraison automatique 24/7, paiement sécurisé Mobile Money et Carte.',
  keywords: [
    'abonnements digitaux',
    'fournisseur abonnement',
    'fournisseur produits digitaux',
    'comptes streaming',
    'numéros OTP',
    'clés API',
    'licences logiciels',
    'Canva Pro',
    'ChatGPT Plus',
    'Netflix',
    'IPTV',
    'Mobile Money',
    'FCFA',
    'Abonnements Pro',
    'Entrepreneurs Positifs',
  ],
  authors: [{ name: 'Abonnements Pro', url: 'https://abonnementspro.com' }],
  publisher: 'Abonnements Pro',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://abonnementspro.com',
  },
  verification: {
    google: 'cmtiNiXVNp8o1NmGt_UZN8_w2a7mv1CBUGf8_v9Mg7o',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icon-144x144.png', sizes: '144x144', type: 'image/png' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://abonnementspro.com',
    siteName: 'Abonnements Pro',
    title: 'Abonnements Pro | Fournisseur d\'Abonnements Digitaux & IA',
    description:
      'Fournisseur direct d\'abonnements streaming, outils IA, numéros OTP et licences. Livraison automatique 24/7, paiement sécurisé Mobile Money et Carte.',
    images: [
      {
        url: '/logo.png',
        width: 800,
        height: 800,
        alt: 'Abonnements Pro - Fournisseur de Produits Digitaux',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Abonnements Pro | Fournisseur d\'Abonnements Digitaux & IA',
    description:
      'Fournisseur direct d\'abonnements streaming, outils IA, numéros OTP et licences. Livraison automatique 24/7, paiement sécurisé Mobile Money et Carte.',
    images: ['/logo.png'],
    creator: '@abonnementspro',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" data-theme="cyberpunk" className="overflow-x-hidden">
      <head>
        <JsonLd />
      </head>
      <body className="antialiased min-h-screen overflow-x-hidden w-full max-w-full">
        <ThemeProvider>
          <CurrencyProvider>
            <MarketingTracker />
            <AnnouncementBanner />
            {children}
          </CurrencyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
