import ShopPageClient from '@/components/ShopPageClient';
import { getShopData } from '@/lib/shopify';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Shop – Gijayi',
  description: 'Browse handcrafted Indian jewellery, bridal sets, earrings, bangles, and heirloom-inspired pieces from Gijayi.',
};

export default async function ShopPage() {
  const { products, categories } = await getShopData();

  return <ShopPageClient products={products} categories={categories} />;
}
