import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/auth';
import { DEFAULT_PRODUCT_CATEGORIES, readDatabase, updateDatabase } from '@/lib/server/database';

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === 'Forbidden' ? 403 : 401 });
  }

  try {
    const currentDb = await readDatabase();
    const existingSlugs = new Set(currentDb.categories.map((cat) => cat.slug));
    
    const categoriesToAdd = DEFAULT_PRODUCT_CATEGORIES.filter((name) => {
      const slug = slugify(name);
      return !existingSlugs.has(slug);
    });

    if (categoriesToAdd.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All categories already exist',
        added: 0,
        total: DEFAULT_PRODUCT_CATEGORIES.length,
      });
    }

    const db = await updateDatabase((state) => {
      for (const name of categoriesToAdd) {
        state.categories.push({
          id: randomUUID(),
          name,
          slug: slugify(name),
          createdAt: new Date().toISOString(),
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: `Successfully added ${categoriesToAdd.length} new categories`,
      added: categoriesToAdd.length,
      total: db.categories.length,
      newCategories: categoriesToAdd,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to sync categories' },
      { status: 500 }
    );
  }
}
