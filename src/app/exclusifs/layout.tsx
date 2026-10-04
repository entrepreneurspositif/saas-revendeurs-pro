import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Offres Exclusives & Produits Premium',
  description: 'Découvrez nos offres exclusives et produits digitaux premium sélectionnés et fournis directement par Entrepreneurs Positifs. Livraison rapide et garanties incluses.',
  keywords: [
    'produits exclusifs',
    'offres premium',
    'abonnements VIP',
    'licences exclusives',
    'Entrepreneurs Positifs',
  ],
  openGraph: {
    title: 'Offres Exclusives & Produits Premium | Entrepreneurs Positifs',
    description: 'Offres exclusives et abonnements digitaux haut de gamme avec garantie et livraison instantanée.',
    url: 'https://revente-abonnement.vercel.app/exclusifs',
    images: ['/logo.png'],
  },
  alternates: {
    canonical: 'https://revente-abonnement.vercel.app/exclusifs',
  },
};

export default function ExclusifsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
