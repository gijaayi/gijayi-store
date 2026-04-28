import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gijayi.com';

export const metadata: Metadata = {
  title: 'Secure Checkout – Gijayi',
  description: 'Complete your jewelry purchase securely. Fast shipping worldwide, hassle-free returns, and personalized WhatsApp support. Pay with Razorpay or PayPal.',
  keywords: 'checkout, secure payment, international shipping, jewelry purchase, payment gateway',
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: `${siteUrl}/checkout`,
  },
  robots: {
    index: false, // Don't index checkout page
    follow: false,
  },
  openGraph: {
    title: 'Secure Checkout – Gijayi',
    description: 'Complete your purchase with secure payment options and worldwide shipping.',
    url: `${siteUrl}/checkout`,
    siteName: 'Gijayi',
    type: 'website',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=90',
        width: 1200,
        height: 630,
        alt: 'Gijayi Checkout',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Secure Checkout – Gijayi',
    description: 'Secure payment and worldwide shipping for handcrafted jewelry.',
  },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
