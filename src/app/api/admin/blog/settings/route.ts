import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/auth';
import { readDatabase, updateDatabase } from '@/lib/server/database';
import { DEFAULT_BLOG_SETTINGS } from '@/lib/blogSeed';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === 'Forbidden' ? 403 : 401 });
  }
  const db = await readDatabase();
  return NextResponse.json({ settings: db.blogSettings || DEFAULT_BLOG_SETTINGS });
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === 'Forbidden' ? 403 : 401 });
  }
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  await updateDatabase((state) => {
    const current = state.blogSettings || DEFAULT_BLOG_SETTINGS;
    state.blogSettings = {
      ...current,
      title: String(body.title ?? current.title).trim() || current.title,
      intro: String(body.intro ?? current.intro).trim() || current.intro,
      defaultAuthorName: String(body.defaultAuthorName ?? current.defaultAuthorName).trim() || current.defaultAuthorName,
      defaultAuthorBio: String(body.defaultAuthorBio ?? current.defaultAuthorBio).trim() || current.defaultAuthorBio,
      defaultAuthorImage: String(body.defaultAuthorImage ?? current.defaultAuthorImage ?? '').trim() || undefined,
      updatedAt: new Date().toISOString(),
    };
  });
  const db = await readDatabase();
  return NextResponse.json({ ok: true, settings: db.blogSettings });
}