import ShopPageClient from '@/components/ShopPageClient';
import { getShopData } from '@/lib/shopify';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Shop Indian Jewellery | Bridal & Designer Pieces – Gijayi',
  description: 'Browse our complete collection of handcrafted Indian jewelry, bridal sets, earrings, necklaces, bangles, and designer pieces. Fast shipping across India.',
  keywords: 'Indian jewelry shop, bridal jewelry, designer jewelry, kundan jewelry, earrings online, necklaces, bangles, handcrafted jewelry',
  openGraph: {
    title: 'Shop Indian Jewellery Online – Gijayi',
    description: 'Authentic handcrafted Indian jewelry and bridal collections with premium quality and free shipping.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=90',
        width: 1200,
        height: 630,
        alt: 'Gijayi Jewelry Collection',
      },
    ],
  },
};

export default async function ShopPage() {
  const { products, categories } = await getShopData();

  return <ShopPageClient products={products} categories={categories} />;
}
