import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/auth';
import { Product } from '@/lib/types';
import { readDatabase, updateDatabase } from '@/lib/server/database';

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === 'Forbidden' ? 403 : 401 });
  }

  const db = await readDatabase();
  return NextResponse.json({ products: db.products });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === 'Forbidden' ? 403 : 401 });
  }

  try {
    const body = await request.json();

    const name = String(body.name || '').trim();
    const price = Number(body.price || 0);
    const category = String(body.category || '').trim();
    const collection = String(body.collection || '').trim();
    const description = String(body.description || '').trim();
    const stock = Number(body.stock || 0);

    if (!name || !price || !category || !collection || !description) {
      return NextResponse.json({ error: 'Missing required product fields.' }, { status: 400 });
    }

    const images = Array.isArray(body.images) ? body.images.map((item: unknown) => String(item).trim()).filter(Boolean) : [];
    const details = Array.isArray(body.details) ? body.details.map((item: unknown) => String(item).trim()).filter(Boolean) : [];
    const sizes = Array.isArray(body.sizes) ? body.sizes.map((item: unknown) => String(item).trim()).filter(Boolean) : undefined;

    const db = await updateDatabase((state) => {
      const slugBase = slugify(name);
      let slug = slugBase;
      let suffix = 1;
      while (state.products.some((product) => product.slug === slug)) {
        suffix += 1;
        slug = `${slugBase}-${suffix}`;
      }

      const product: Product = {
        id: randomUUID(),
        name,
        slug,
        price,
        compareAtPrice: body.compareAtPrice ? Number(body.compareAtPrice) : undefined,
        images: images.length ? images : ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80'],
        category,
        collection,
        description,
        details: details.length ? details : ['Handcrafted by Gijayi artisans'],
        sizes,
        isNew: Boolean(body.isNew),
        isBestseller: Boolean(body.isBestseller),
        stock,
      };

      state.products.unshift(product);
    });

    return NextResponse.json({ products: db.products });
  } catch {
    return NextResponse.json({ error: 'Unable to create product.' }, { status: 500 });
  }
}
