import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Activation SMS OTP - Numéros Virtuels Temporaires',
  description:
    'Obtenez des numéros virtuels temporaires pour la réception de SMS de vérification (OTP) WhatsApp, Telegram, Google, OpenAI, TikTok, etc. Réception instantanée et livraison automatique.',
  keywords: [
    'numéro virtuel SMS',
    'OTP WhatsApp',
    'activation SMS',
    'numéro temporaire',
    'SMS verification',
    'Entrepreneurs Positifs',
  ],
  openGraph: {
    title: 'Activation SMS OTP - Numéros Virtuels Temporaires | Entrepreneurs Positifs',
    description:
      'Service d\'activation SMS temporaire pour vérifier vos comptes en ligne rapidement et sans carte SIM physique.',
    url: 'https://revente-abonnement.vercel.app/otp',
    images: ['/logo.png'],
  },
  alternates: {
    canonical: 'https://revente-abonnement.vercel.app/otp',
  },
};

export default function OtpLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
