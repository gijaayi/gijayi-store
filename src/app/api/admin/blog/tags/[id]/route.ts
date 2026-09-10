import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/auth';
import { readDatabase, updateDatabase } from '@/lib/server/database';
import { slugifyTitle } from '@/lib/server/blog';

interface Context { params: Promise<{ id: string }> }

export async function PUT(request: NextRequest, context: Context) {
  const auth = await requireAdmin(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === 'Forbidden' ? 403 : 401 });
  }
  const { id } = await context.params;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const db = await readDatabase();
  const existing = (db.blogTags || []).find((item) => item.id === id);
  if (!existing) return NextResponse.json({ error: 'Tag not found.' }, { status: 404 });
  const slug = slugifyTitle(String(body.slug ?? existing.slug));
  if ((db.blogTags || []).some((item) => item.slug === slug && item.id !== id)) {
    return NextResponse.json({ error: 'Tag slug already exists.' }, { status: 400 });
  }
  await updateDatabase((state) => {
    const index = (state.blogTags || []).findIndex((item) => item.id === id);
    if (index < 0) return;
    state.blogTags[index] = {
      ...state.blogTags[index],
      name: String(body.name ?? existing.name).trim(),
      slug,
      description: String(body.description ?? existing.description ?? '').trim() || undefined,
      seoTitle: String(body.seoTitle ?? existing.seoTitle ?? '').trim() || undefined,
      seoDescription: String(body.seoDescription ?? existing.seoDescription ?? '').trim() || undefined,
      noIndex: body.noIndex !== undefined ? Boolean(body.noIndex) : existing.noIndex,
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : existing.isActive,
      updatedAt: new Date().toISOString(),
    };
  });
  const refreshed = await readDatabase();
  return NextResponse.json({ ok: true, tags: refreshed.blogTags });
}

export async function DELETE(request: NextRequest, context: Context) {
  const auth = await requireAdmin(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === 'Forbidden' ? 403 : 401 });
  }
  const { id } = await context.params;
  await updateDatabase((state) => {
    state.blogTags = (state.blogTags || []).filter((item) => item.id !== id);
  });
  return NextResponse.json({ ok: true });
}