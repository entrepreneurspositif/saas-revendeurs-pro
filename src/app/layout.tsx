import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { CurrencyProvider } from '@/components/CurrencyContext';
import AnnouncementBanner from '@/components/AnnouncementBanner';
import MarketingTracker from '@/components/MarketingTracker';

export const metadata: Metadata = {
  title: 'Entrepreneurs Positifs - Plateforme de Revente de Produits & Abonnements Digitaux',
  description: 'Abonnements, clés d’API, licences et comptes digitaux avec livraison automatisée multi-fournisseurs.',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
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
