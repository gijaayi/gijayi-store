import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/auth';
import { updateDatabase } from '@/lib/server/database';

interface Context {
  params: Promise<{ id: string }>;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function PATCH(request: NextRequest, context: Context) {
  const auth = await requireAdmin(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === 'Forbidden' ? 403 : 401 });
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const name = String(body.name || '').trim();

    if (!name) {
      return NextResponse.json({ error: 'Category name is required.' }, { status: 400 });
    }

    const categorySlug = slugify(name);
    if (!categorySlug) {
      return NextResponse.json({ error: 'Invalid category name.' }, { status: 400 });
    }

    const db = await updateDatabase((state) => {
      const index = state.categories.findIndex((category) => category.id === id);
      if (index === -1) {
        throw new Error('NOT_FOUND');
      }

      const duplicate = state.categories.some(
        (category) => category.id !== id && category.slug === categorySlug
      );
      if (duplicate) {
        throw new Error('DUPLICATE');
      }

      const previousName = state.categories[index].name;
      state.categories[index] = {
        ...state.categories[index],
        name,
        slug: categorySlug,
      };

      state.products = state.products.map((product) =>
        product.category === previousName ? { ...product, category: name } : product
      );
    });

    return NextResponse.json({ categories: db.categories });
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Category not found.' }, { status: 404 });
    }

    if (error instanceof Error && error.message === 'DUPLICATE') {
      return NextResponse.json({ error: 'Category already exists.' }, { status: 409 });
    }

    return NextResponse.json({ error: 'Unable to update category.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: Context) {
  const auth = await requireAdmin(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === 'Forbidden' ? 403 : 401 });
  }

  try {
    const { id } = await context.params;

    const db = await updateDatabase((state) => {
      const category = state.categories.find((item) => item.id === id);
      if (!category) {
        throw new Error('NOT_FOUND');
      }

      const inUse = state.products.some((product) => product.category === category.name);
      if (inUse) {
        throw new Error('IN_USE');
      }

      state.categories = state.categories.filter((item) => item.id !== id);
    });

    return NextResponse.json({ categories: db.categories });
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Category not found.' }, { status: 404 });
    }

    if (error instanceof Error && error.message === 'IN_USE') {
      return NextResponse.json({ error: 'Category is in use by products and cannot be deleted.' }, { status: 409 });
    }

    return NextResponse.json({ error: 'Unable to delete category.' }, { status: 500 });
  }
}
