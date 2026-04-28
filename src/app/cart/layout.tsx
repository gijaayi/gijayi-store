import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gijayi.com';

export const metadata: Metadata = {
  title: 'Shopping Bag – Gijayi',
  description: 'Review your items, manage quantities, and proceed to checkout. Free shipping on orders over ₹5,000 in India. International shipping available.',
  keywords: 'shopping cart, jewelry shopping bag, checkout, free shipping',
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: `${siteUrl}/cart`,
  },
  robots: {
    index: false, // Don't index cart page
    follow: false,
  },
  openGraph: {
    title: 'Shopping Bag – Gijayi',
    description: 'Review your handcrafted jewelry items and proceed to secure checkout.',
    url: `${siteUrl}/cart`,
    siteName: 'Gijayi',
    type: 'website',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=90',
        width: 1200,
        height: 630,
        alt: 'Gijayi Shopping Cart',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shopping Bag – Gijayi',
    description: 'Review and checkout your handcrafted jewelry items.',
  },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
