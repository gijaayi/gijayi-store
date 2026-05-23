import HomePageClient from '@/components/HomePageClient';
import { getHomeData } from '@/lib/shopify';
import { readDatabase } from '@/lib/server/database';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gijayi.com';

export const metadata: Metadata = {
  title: 'Gijayi Homepage',
  description: 'Explore Gijayi’s curated jewelry collections, artisanal bridal pieces, and luxury heritage designs with global shipping and personalized styling.',
  keywords: 'Gijayi homepage, handcrafted jewelry, bridal jewelry, luxury jewelry, Indian jewelry online, artisan jewelry, designer jewelry',
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: `${siteUrl}/`,
  },
  openGraph: {
    title: 'Gijayi Homepage',
    description: 'Explore Gijayi’s curated jewelry collections, artisanal bridal pieces, and luxury heritage designs.',
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
    title: 'Gijayi Homepage',
    description: 'Explore Gijayi’s curated jewelry collections, artisanal bridal pieces, and luxury heritage designs.',
    images: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=90'],
  },
};

export default async function HomePage() {
  const { products, collections } = await getHomeData();
  const db = await readDatabase();

  return <HomePageClient products={products} collections={collections} storefront={db.storefront} />;
}

