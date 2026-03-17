import { NextResponse } from 'next/server';
import { readDatabase } from '@/lib/server/database';

interface Context {
  params: Promise<{ slug: string }>;
}

export async function GET(_: Request, context: Context) {
  const { slug } = await context.params;

  const db = await readDatabase();
  const product = db.products.find((item) => item.slug === slug);

  if (!product) {
    return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
  }

  const related = db.products
    .filter((item) => item.id !== product.id && item.category === product.category)
    .slice(0, 4);

  return NextResponse.json({ product, related });
}
