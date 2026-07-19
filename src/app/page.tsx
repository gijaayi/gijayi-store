import HomePageClient from '@/components/HomePageClient';
import { getHomeData } from '@/lib/shopify';
import { readDatabase } from '@/lib/server/database';
import type { Metadata } from 'next';
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  DEFAULT_TITLE,
  SITE_NAME,
  SITE_URL,
} from '@/lib/siteMetadata';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/`,
  },
  openGraph: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: `${SITE_URL}/`,
    siteName: SITE_NAME,
    type: 'website',
    locale: 'en_IN',
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE.url],
  },
};

export default async function HomePage() {
  const { products, collections } = await getHomeData();
  const db = await readDatabase();

  return <HomePageClient products={products} collections={collections} storefront={db.storefront} />;
}

