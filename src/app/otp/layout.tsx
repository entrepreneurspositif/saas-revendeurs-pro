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
  return <>{children}</>;
}
