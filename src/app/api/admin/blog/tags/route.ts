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
  return NextResponse.json({ tags: db.blogTags || [] });
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
  if ((db.blogTags || []).some((item) => item.slug === slug)) {
    return NextResponse.json({ error: 'Tag slug already exists.' }, { status: 400 });
  }
  const now = new Date().toISOString();
  await updateDatabase((state) => {
    state.blogTags = state.blogTags || [];
    state.blogTags.push({
      id: randomUUID(),
      name,
      slug,
      description: String(body.description || '').trim() || undefined,
      seoTitle: String(body.seoTitle || '').trim() || undefined,
      seoDescription: String(body.seoDescription || '').trim() || undefined,
      noIndex: body.noIndex === undefined ? true : Boolean(body.noIndex),
      isActive: body.isActive === undefined ? true : Boolean(body.isActive),
      createdAt: now,
      updatedAt: now,
    });
  });
  const refreshed = await readDatabase();
  return NextResponse.json({ ok: true, tags: refreshed.blogTags });
}