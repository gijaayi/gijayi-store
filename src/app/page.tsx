import HomePageClient from '@/components/HomePageClient';
import { getHomeData } from '@/lib/shopify';
import { readDatabase } from '@/lib/server/database';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gijayi.com';

export const metadata: Metadata = {
  title: 'Gijayi – Handcrafted Jewelry & Bridal Collections | Global Shipping',
  description: 'Discover Gijayi handcrafted jewelry—authentic bridal collections, statement pieces, and heirloom designs. Worldwide shipping to USA, Europe, GCC, and beyond. Exclusive WhatsApp concierge support.',
  keywords: 'handcrafted jewelry, bridal jewelry online, Indian jewelry international, luxury bridal sets, designer jewelry worldwide, kundan jewelry, polki jewelry, statement jewelry',
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: `${siteUrl}/`,
  },
  openGraph: {
    title: 'Gijayi – Handcrafted Jewelry & Bridal Collections',
    description: 'Premium handcrafted jewelry with worldwide shipping. Bridal collections, statement pieces, and heirloom designs for luxury celebrations.',
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
    title: 'Gijayi – Handcrafted Jewelry',
    description: 'Premium bridal and statement jewelry with worldwide shipping.',
    images: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=90'],
  },
};

export default async function HomePage() {
  const { products, collections } = await getHomeData();
  const db = await readDatabase();

  return <HomePageClient products={products} collections={collections} storefront={db.storefront} />;
}

