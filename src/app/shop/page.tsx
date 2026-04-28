import ShopPageClient from '@/components/ShopPageClient';
import { getShopData } from '@/lib/shopify';

export const dynamic = 'force-dynamic';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gijayi.com';

export const metadata = {
  title: 'Shop Handcrafted Jewelry | Worldwide Shipping – Gijayi',
  description: 'Browse handcrafted jewelry collections perfect for every occasion. Bridal luxury, statement pieces, and heritage designs. Free shipping in India, worldwide delivery available.',
  keywords: 'handcrafted jewelry, bridal jewelry shop, statement jewelry, luxury jewelry, jewelry worldwide shipping, Indian jewelry international, designer jewelry online',
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: `${siteUrl}/shop`,
  },
  openGraph: {
    title: 'Shop Handcrafted Jewelry – Worldwide Shipping',
    description: 'Premium handcrafted jewelry curated for bridal, celebrations, and everyday luxury. Ships to USA, Europe, Asia & more with secure checkout.',
    url: `${siteUrl}/shop`,
    siteName: 'Gijayi',
    type: 'website',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=90',
        width: 1200,
        height: 630,
        alt: 'Gijayi Jewelry Collection',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shop Gijayi – Handcrafted Jewelry',
    description: 'Premium bridal and statement jewelry with international shipping available.',
  },
};

export default async function ShopPage() {
  const { products, categories } = await getShopData();

  return <ShopPageClient products={products} categories={categories} />;
}
