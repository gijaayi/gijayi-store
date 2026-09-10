import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/auth';
import { readDatabase, updateDatabase } from '@/lib/server/database';
import type { BlogPost, BlogPostStatus } from '@/lib/blogTypes';
import { estimateReadingTime, slugifyTitle, truncateExcerpt } from '@/lib/server/blog';

function normalizeStatus(value: unknown): BlogPostStatus {
  const status = String(value || 'draft');
  if (['draft', 'scheduled', 'published', 'archived'].includes(status)) {
    return status as BlogPostStatus;
  }
  return 'draft';
}

function buildAuthor(body: Record<string, unknown>, settingsName: string, settingsBio: string) {
  const name = String(body.authorName || settingsName || 'Gijayi Editorial').trim();
  const slug = slugifyTitle(String(body.authorSlug || name));
  return {
    name,
    slug,
    image: String(body.authorImage || '').trim() || undefined,
    bio: String(body.authorBio || settingsBio || '').trim() || undefined,
  };
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === 'Forbidden' ? 403 : 401 });
  }

  const db = await readDatabase();
  const status = request.nextUrl.searchParams.get('status');
  let posts = [...(db.blogPosts || [])];
  if (status) posts = posts.filter((post) => post.status === status);
  posts.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const all = db.blogPosts || [];
  return NextResponse.json({
    posts,
    stats: {
      total: all.length,
      published: all.filter((p) => p.status === 'published').length,
      drafts: all.filter((p) => p.status === 'draft').length,
      scheduled: all.filter((p) => p.status === 'scheduled').length,
      featured: all.filter((p) => p.featured).length,
      categories: (db.blogCategories || []).length,
      tags: (db.blogTags || []).length,
    },
    categories: db.blogCategories || [],
    tags: db.blogTags || [],
    products: (db.products || []).map((p) => ({ id: p.id, name: p.name, slug: p.slug, image: p.images?.[0], price: p.price })),
    settings: db.blogSettings,
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === 'Forbidden' ? 403 : 401 });
  }

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const title = String(body.title || '').trim();
  if (!title) return NextResponse.json({ error: 'Title is required.' }, { status: 400 });

  const db = await readDatabase();
  const settings = db.blogSettings;
  let slug = slugifyTitle(String(body.slug || title));
  if (!slug) slug = `post-${Date.now()}`;
  if ((db.blogPosts || []).some((post) => post.slug === slug)) {
    return NextResponse.json({ error: 'Slug already exists.' }, { status: 400 });
  }

  const now = new Date().toISOString();
  const content = String(body.content || '');
  const status = normalizeStatus(body.status);
  const publishedAt = String(body.publishedAt || now);
  const post: BlogPost = {
    id: randomUUID(),
    title,
    slug,
    excerpt: truncateExcerpt(String(body.excerpt || content), 170),
    content,
    featuredImage: String(body.featuredImage || '').trim(),
    featuredImageAlt: String(body.featuredImageAlt || title).trim(),
    thumbnailImage: String(body.thumbnailImage || '').trim() || undefined,
    categorySlug: String(body.categorySlug || '').trim(),
    tags: Array.isArray(body.tags) ? body.tags.map((tag) => String(tag).trim()).filter(Boolean) : [],
    author: buildAuthor(body, settings.defaultAuthorName, settings.defaultAuthorBio),
    status,
    featured: Boolean(body.featured),
    publishedAt,
    readingTime: estimateReadingTime(content),
    seo: (body.seo as BlogPost['seo']) || {},
    relatedProductIds: Array.isArray(body.relatedProductIds)
      ? body.relatedProductIds.map(String)
      : [],
    relatedArticleIds: Array.isArray(body.relatedArticleIds)
      ? body.relatedArticleIds.map(String)
      : [],
    faqs: Array.isArray(body.faqs)
      ? body.faqs
          .map((faq) => {
            const item = faq as { question?: string; answer?: string };
            return {
              question: String(item.question || '').trim(),
              answer: String(item.answer || '').trim(),
            };
          })
          .filter((faq) => faq.question && faq.answer)
      : [],
    socialImage: String(body.socialImage || '').trim() || undefined,
    createdAt: now,
    updatedAt: now,
  };

  // Ensure tags exist in blogTags
  await updateDatabase((state) => {
    state.blogPosts = state.blogPosts || [];
    state.blogTags = state.blogTags || [];
    for (const tagName of post.tags) {
      const tagSlug = slugifyTitle(tagName);
      if (!state.blogTags.some((tag) => tag.slug === tagSlug)) {
        state.blogTags.push({
          id: randomUUID(),
          name: tagName,
          slug: tagSlug,
          noIndex: true,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        });
      }
    }
    state.blogPosts.unshift(post);
  });

  return NextResponse.json({ ok: true, post });
}