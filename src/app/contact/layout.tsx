import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gijayi.com';

export const metadata: Metadata = {
  title: 'Contact Gijayi – Styling Help, Custom Orders & Support',
  description: 'Reach Gijayi concierge for bridal styling, custom jewelry orders, international shipping help, and personalized support. Direct WhatsApp, email, and phone channels.',
  keywords: 'contact Gijayi, fashion styling help, custom jewelry orders, bridal consultation, jewelry support, international shipping help, WhatsApp support',
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: `${siteUrl}/contact`,
  },
  openGraph: {
    title: 'Contact Gijayi – Concierge & Styling Support',
    description: 'Direct contact for bridal consultations, styling help, and personalized jewelry expertise. Available via WhatsApp, email, and phone.',
    url: `${siteUrl}/contact`,
    siteName: 'Gijayi',
    type: 'website',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=90',
        width: 1200,
        height: 630,
        alt: 'Gijayi Contact & Concierge',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Gijayi Concierge',
    description: 'Personalized styling, bridal consultations, and customer support.',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
