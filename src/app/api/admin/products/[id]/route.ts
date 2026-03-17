import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/auth';
import { updateDatabase } from '@/lib/server/database';

interface Context {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, context: Context) {
  const auth = await requireAdmin(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === 'Forbidden' ? 403 : 401 });
  }

  try {
    const { id } = await context.params;
    const body = await request.json();

    const db = await updateDatabase((state) => {
      const index = state.products.findIndex((product) => product.id === id);
      if (index === -1) {
        throw new Error('NOT_FOUND');
      }

      const current = state.products[index];
      state.products[index] = {
        ...current,
        name: body.name ?? current.name,
        price: body.price !== undefined ? Number(body.price) : current.price,
        compareAtPrice: body.compareAtPrice !== undefined ? Number(body.compareAtPrice) : current.compareAtPrice,
        images: Array.isArray(body.images) ? body.images : current.images,
        category: body.category ?? current.category,
        collection: body.collection ?? current.collection,
        description: body.description ?? current.description,
        details: Array.isArray(body.details) ? body.details : current.details,
        sizes: Array.isArray(body.sizes) ? body.sizes : current.sizes,
        isNew: body.isNew !== undefined ? Boolean(body.isNew) : current.isNew,
        isBestseller: body.isBestseller !== undefined ? Boolean(body.isBestseller) : current.isBestseller,
        stock: body.stock !== undefined ? Number(body.stock) : current.stock,
      };
    });

    return NextResponse.json({ products: db.products });
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    return NextResponse.json({ error: 'Unable to update product.' }, { status: 500 });
  }
}
