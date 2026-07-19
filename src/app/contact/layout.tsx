import type { Metadata } from 'next';
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from '@/lib/siteMetadata';

export const metadata: Metadata = {
  title: 'Contact Us | Gijayi',
  description: 'Reach Gijayi concierge for bridal styling, custom jewelry orders, international shipping help, and personalized support. Direct WhatsApp, email, and phone channels.',
  keywords: 'contact Gijayi, fashion styling help, custom jewelry orders, bridal consultation, jewelry support, international shipping help, WhatsApp support',
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: `${SITE_URL}/contact`,
  },
  openGraph: {
    title: 'Contact Us | Gijayi',
    description: 'Direct contact for bridal consultations, styling help, and personalized jewelry expertise. Available via WhatsApp, email, and phone.',
    url: `${SITE_URL}/contact`,
    siteName: SITE_NAME,
    type: 'website',
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us | Gijayi',
    description: 'Personalized styling, bridal consultations, and customer support.',
    images: [DEFAULT_OG_IMAGE.url],
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
