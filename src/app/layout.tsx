import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { CurrencyProvider } from '@/components/CurrencyContext';
import AnnouncementBanner from '@/components/AnnouncementBanner';
import MarketingTracker from '@/components/MarketingTracker';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  metadataBase: new URL('https://revente-abonnement.vercel.app'),
  title: {
    default: 'Entrepreneurs Positifs - Fournisseur Direct d\'Abonnements & Produits Digitaux',
    template: '%s | Entrepreneurs Positifs',
  },
  description:
    'Votre fournisseur direct et officiel de comptes de streaming, abonnements IA, clés API, numéros OTP SMS et licences logicielles. Livraison automatique 24/7, paiement sécurisé Mobile Money et Carte Bancaire.',
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
    'Entrepreneurs Positifs',
  ],
  authors: [{ name: 'Entrepreneurs Positifs', url: 'https://revente-abonnement.vercel.app' }],
  publisher: 'Entrepreneurs Positifs',
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
    canonical: 'https://revente-abonnement.vercel.app',
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://revente-abonnement.vercel.app',
    siteName: 'Entrepreneurs Positifs',
    title: 'Entrepreneurs Positifs - Fournisseur Direct d\'Abonnements & Produits Digitaux',
    description:
      'Fournisseur direct de comptes streaming, outils d’IA, clés API, numéros OTP et licences. Livraison instantanée et automatique 24/7.',
    images: [
      {
        url: '/logo.png',
        width: 800,
        height: 800,
        alt: 'Entrepreneurs Positifs - Fournisseur de Produits Digitaux',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Entrepreneurs Positifs - Fournisseur Direct d\'Abonnements & Produits Digitaux',
    description:
      'Fournisseur direct de comptes streaming, outils d’IA, clés API, numéros OTP et licences. Livraison instantanée et automatique 24/7.',
    images: ['/logo.png'],
    creator: '@entrepreneurspos',
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
