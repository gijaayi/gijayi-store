import HomePageClient from '@/components/HomePageClient';
import { getHomeData } from '@/lib/shopify';
import { readDatabase } from '@/lib/server/database';

export default async function HomePage() {
  const { products, collections } = await getHomeData();
  const db = await readDatabase();

  return <HomePageClient products={products} collections={collections} storefront={db.storefront} />;
}

