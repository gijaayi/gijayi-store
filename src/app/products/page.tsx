import ShopPageClient from '@/components/ShopPageClient';
import { getShopData } from '@/lib/shopify';

export const metadata = {
  title: 'Products – Gijayi',
  description: 'Explore Gijayi products across bridal, heritage and contemporary jewellery categories.',
};

export default async function ProductsPage() {
  const { products, categories } = await getShopData();

  return <ShopPageClient products={products} categories={categories} />;
}