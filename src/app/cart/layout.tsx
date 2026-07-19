import type { Metadata } from 'next';
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from '@/lib/siteMetadata';

export const metadata: Metadata = {
  title: 'Cart | Gijayi',
  description: 'Review your items, manage quantities, and proceed to checkout. Free shipping on orders over ₹5,000 in India. International shipping available.',
  keywords: 'shopping cart, jewelry shopping bag, checkout, free shipping',
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: `${SITE_URL}/cart`,
  },
  robots: {
    index: false, // Don't index cart page
    follow: false,
  },
  openGraph: {
    title: 'Cart | Gijayi',
    description: 'Review your handcrafted jewelry items and proceed to secure checkout.',
    url: `${SITE_URL}/cart`,
    siteName: SITE_NAME,
    type: 'website',
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cart | Gijayi',
    description: 'Review and checkout your handcrafted jewelry items.',
    images: [DEFAULT_OG_IMAGE.url],
  },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
