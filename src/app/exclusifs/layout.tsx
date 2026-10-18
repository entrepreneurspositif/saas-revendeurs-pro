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
  return <>{children}</>;
}
