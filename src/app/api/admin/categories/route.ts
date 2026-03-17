import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/auth';
import { DbCategory, readDatabase, updateDatabase } from '@/lib/server/database';

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
  return NextResponse.json({ categories: db.categories });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === 'Forbidden' ? 403 : 401 });
  }

  try {
    const body = await request.json();
    const name = String(body.name || '').trim();

    if (!name) {
      return NextResponse.json({ error: 'Category name is required.' }, { status: 400 });
    }

    const db = await updateDatabase((state) => {
      const categorySlug = slugify(name);
      if (!categorySlug) {
        throw new Error('INVALID_NAME');
      }

      const exists = state.categories.some((category) => category.slug === categorySlug);
      if (exists) {
        throw new Error('DUPLICATE');
      }

      const category: DbCategory = {
        id: randomUUID(),
        name,
        slug: categorySlug,
        createdAt: new Date().toISOString(),
      };

      state.categories.unshift(category);
    });

    return NextResponse.json({ categories: db.categories });
  } catch (error) {
    if (error instanceof Error && error.message === 'DUPLICATE') {
      return NextResponse.json({ error: 'Category already exists.' }, { status: 409 });
    }

    if (error instanceof Error && error.message === 'INVALID_NAME') {
      return NextResponse.json({ error: 'Invalid category name.' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Unable to create category.' }, { status: 500 });
  }
}
