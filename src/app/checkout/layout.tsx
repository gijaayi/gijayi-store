import type { Metadata } from 'next';
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from '@/lib/siteMetadata';

export const metadata: Metadata = {
  title: 'Secure Checkout – Gijayi',
  description: 'Complete your jewelry purchase securely. Fast shipping worldwide, hassle-free returns, and personalized WhatsApp support. Pay with Razorpay or PayPal.',
  keywords: 'checkout, secure payment, international shipping, jewelry purchase, payment gateway',
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: `${SITE_URL}/checkout`,
  },
  robots: {
    index: false, // Don't index checkout page
    follow: false,
  },
  openGraph: {
    title: 'Secure Checkout – Gijayi',
    description: 'Complete your purchase with secure payment options and worldwide shipping.',
    url: `${SITE_URL}/checkout`,
    siteName: SITE_NAME,
    type: 'website',
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Secure Checkout – Gijayi',
    description: 'Secure payment and worldwide shipping for handcrafted jewelry.',
    images: [DEFAULT_OG_IMAGE.url],
  },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
