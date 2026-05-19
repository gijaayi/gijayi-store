import HomePageClient from '@/components/HomePageClient';
import { getHomeData } from '@/lib/shopify';
import { readDatabase } from '@/lib/server/database';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gijayi.com';

export const metadata: Metadata = {
  title: 'Gijayi – Women Led Start-up for Handcrafted Jewelry | Worldwide Shipping',
  description: 'Welcome to Gijayi Family. Explore carefully crafted jewelry from a women led start-up with secure payment and worldwide shipping.',
  keywords: 'women led start-up, secure payment, carefully crafted jewelry, worldwide shipping, handcrafted jewelry, bridal jewelry online, Indian jewelry international, luxury bridal sets, designer jewelry worldwide',
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: `${siteUrl}/`,
  },
  openGraph: {
    title: 'Welcome to Gijayi Family',
    description: 'Women led start-up with carefully crafted jewelry, secure payment, and worldwide shipping.',
    url: `${siteUrl}/`,
    siteName: 'Gijayi',
    type: 'website',
    locale: 'en_IN',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=90',
        width: 1200,
        height: 630,
        alt: 'Gijayi Handcrafted Jewelry',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Welcome to Gijayi Family',
    description: 'Women led start-up with carefully crafted jewelry, secure payment, and worldwide shipping.',
    images: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=90'],
  },
};

export default async function HomePage() {
  const { products, collections } = await getHomeData();
  const db = await readDatabase();

  return <HomePageClient products={products} collections={collections} storefront={db.storefront} />;
}

