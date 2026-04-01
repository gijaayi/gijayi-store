import { NextResponse } from 'next/server';
import { getAllProducts } from '@/lib/shopify';

interface Context {
  params: Promise<{ slug: string }>;
}

export async function GET(_: Request, context: Context) {
  const { slug } = await context.params;
  const requestUrl = new URL(_.url);
  const pid = String(requestUrl.searchParams.get('pid') || '').trim();

  const products = await getAllProducts();
  const product = pid
    ? products.find((item) => item.id === pid) ?? products.find((item) => item.slug === slug)
    : products.find((item) => item.slug === slug);

  if (!product) {
    return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
  }

  const related = products
    .filter((item) => item.id !== product.id && item.category === product.category)
    .slice(0, 4);

  return NextResponse.json({ product, related });
}
