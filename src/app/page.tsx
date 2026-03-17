import HomePageClient from '@/components/HomePageClient';
import { getHomeData } from '@/lib/shopify';

export default async function HomePage() {
  const { products, collections } = await getHomeData();

  return <HomePageClient products={products} collections={collections} />;
}

