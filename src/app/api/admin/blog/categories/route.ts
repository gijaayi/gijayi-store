import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/auth';
import { readDatabase, updateDatabase } from '@/lib/server/database';
import { slugifyTitle } from '@/lib/server/blog';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === 'Forbidden' ? 403 : 401 });
  }
  const db = await readDatabase();
  return NextResponse.json({
    categories: [...(db.blogCategories || [])].sort((a, b) => a.sortOrder - b.sortOrder),
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === 'Forbidden' ? 403 : 401 });
  }
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const name = String(body.name || '').trim();
  if (!name) return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
  const slug = slugifyTitle(String(body.slug || name));
  const db = await readDatabase();
  if ((db.blogCategories || []).some((item) => item.slug === slug)) {
    return NextResponse.json({ error: 'Category slug already exists.' }, { status: 400 });
  }
  const now = new Date().toISOString();
  await updateDatabase((state) => {
    state.blogCategories = state.blogCategories || [];
    state.blogCategories.push({
      id: randomUUID(),
      name,
      slug,
      description: String(body.description || '').trim(),
      image: String(body.image || '').trim() || undefined,
      seoTitle: String(body.seoTitle || '').trim() || undefined,
      seoDescription: String(body.seoDescription || '').trim() || undefined,
      noIndex: Boolean(body.noIndex),
      sortOrder: Number(body.sortOrder) || state.blogCategories.length + 1,
      isActive: body.isActive === undefined ? true : Boolean(body.isActive),
      createdAt: now,
      updatedAt: now,
    });
  });
  const refreshed = await readDatabase();
  return NextResponse.json({ ok: true, categories: refreshed.blogCategories });
}