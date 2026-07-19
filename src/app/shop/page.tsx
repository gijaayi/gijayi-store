import ShopPageClient from '@/components/ShopPageClient';
import { getShopData } from '@/lib/shopify';
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from '@/lib/siteMetadata';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Shop | Gijayi',
  description: 'Browse handcrafted jewelry collections perfect for every occasion. Bridal luxury, statement pieces, and heritage designs. Free shipping in India, worldwide delivery available.',
  keywords: 'handcrafted jewelry, bridal jewelry shop, statement jewelry, luxury jewelry, jewelry worldwide shipping, Indian jewelry international, designer jewelry online',
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: `${SITE_URL}/shop`,
  },
  openGraph: {
    title: 'Shop | Gijayi',
    description: 'Premium handcrafted jewelry curated for bridal, celebrations, and everyday luxury. Ships to USA, Europe, Asia & more with secure checkout.',
    url: `${SITE_URL}/shop`,
    siteName: SITE_NAME,
    type: 'website',
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shop | Gijayi',
    description: 'Premium bridal and statement jewelry with international shipping available.',
    images: [DEFAULT_OG_IMAGE.url],
  },
};

export default async function ShopPage() {
  const { products, categories, storefront } = await getShopData();

  return <ShopPageClient products={products} categories={categories} storefront={storefront} />;
}
