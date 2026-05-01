import { NextResponse } from 'next/server';
import { getProductByHandle, getAllProducts } from '@/lib/shopify';
import { readDatabase } from '@/lib/server/database';

export const dynamic = 'force-dynamic';

interface Context {
  params: Promise<{ slug: string }>;
}

export async function GET(_: Request, context: Context) {
  const { slug } = await context.params;
  const requestUrl = new URL(_.url);
  const pid = String(requestUrl.searchParams.get('pid') || '').trim();

  // First, try to get product by handle (optimized path - only fetches if exists in DB)
  let product = await getProductByHandle(slug);
  
  // If not found by handle and pid provided, search by pid
  if (!product && pid) {
    const allProducts = await getAllProducts();
    product = allProducts.find((item) => item.id === pid) || null;
  }

  if (!product) {
    return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
  }

  // Get only products in same category for related items
  const db = await readDatabase();
  const related = (db.products || [])
    .filter((item) => item.id !== product.id && item.category === product.category)
    .slice(0, 4);

  const response = NextResponse.json({ product, related });

  // Product data should reflect admin edits immediately (especially image updates).
  response.headers.set('Cache-Control', 'no-store, max-age=0');

  return response;
}
