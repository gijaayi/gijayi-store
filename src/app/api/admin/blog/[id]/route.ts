import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/auth';
import { readDatabase, updateDatabase } from '@/lib/server/database';
import type { BlogPost, BlogPostStatus } from '@/lib/blogTypes';
import { estimateReadingTime, slugifyTitle, truncateExcerpt } from '@/lib/server/blog';

interface Context {
  params: Promise<{ id: string }>;
}

function normalizeStatus(value: unknown): BlogPostStatus {
  const status = String(value || 'draft');
  if (['draft', 'scheduled', 'published', 'archived'].includes(status)) {
    return status as BlogPostStatus;
  }
  return 'draft';
}

export async function GET(request: NextRequest, context: Context) {
  const auth = await requireAdmin(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === 'Forbidden' ? 403 : 401 });
  }
  const { id } = await context.params;
  const db = await readDatabase();
  const post = (db.blogPosts || []).find((item) => item.id === id);
  if (!post) return NextResponse.json({ error: 'Post not found.' }, { status: 404 });
  return NextResponse.json({
    post,
    categories: db.blogCategories || [],
    tags: db.blogTags || [],
    products: (db.products || []).map((p) => ({ id: p.id, name: p.name, slug: p.slug, image: p.images?.[0], price: p.price })),
    posts: (db.blogPosts || []).map((p) => ({ id: p.id, title: p.title, slug: p.slug })),
    settings: db.blogSettings,
  });
}

export async function PUT(request: NextRequest, context: Context) {
  const auth = await requireAdmin(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === 'Forbidden' ? 403 : 401 });
  }

  const { id } = await context.params;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const db = await readDatabase();
  const existing = (db.blogPosts || []).find((item) => item.id === id);
  if (!existing) return NextResponse.json({ error: 'Post not found.' }, { status: 404 });

  const title = String(body.title ?? existing.title).trim();
  let slug = slugifyTitle(String(body.slug ?? existing.slug));
  if (!slug) slug = existing.slug;
  if ((db.blogPosts || []).some((post) => post.slug === slug && post.id !== id)) {
    return NextResponse.json({ error: 'Slug already exists.' }, { status: 400 });
  }

  const content = String(body.content ?? existing.content);
  const now = new Date().toISOString();
  const status = normalizeStatus(body.status ?? existing.status);
  const slugChanged = slug !== existing.slug;

  await updateDatabase((state) => {
    const index = (state.blogPosts || []).findIndex((item) => item.id === id);
    if (index < 0) return;

    const updated: BlogPost = {
      ...existing,
      ...state.blogPosts[index],
      title,
      slug,
      excerpt: truncateExcerpt(String(body.excerpt ?? existing.excerpt ?? content), 170),
      content,
      featuredImage: String(body.featuredImage ?? existing.featuredImage ?? '').trim(),
      featuredImageAlt: String(body.featuredImageAlt ?? existing.featuredImageAlt ?? title).trim(),
      thumbnailImage: String(body.thumbnailImage ?? existing.thumbnailImage ?? '').trim() || undefined,
      categorySlug: String(body.categorySlug ?? existing.categorySlug ?? '').trim(),
      tags: Array.isArray(body.tags)
        ? body.tags.map((tag) => String(tag).trim()).filter(Boolean)
        : existing.tags,
      author: {
        name: String(body.authorName ?? existing.author.name).trim(),
        slug: slugifyTitle(String(body.authorSlug ?? existing.author.slug ?? existing.author.name)),
        image: String(body.authorImage ?? existing.author.image ?? '').trim() || undefined,
        bio: String(body.authorBio ?? existing.author.bio ?? '').trim() || undefined,
      },
      status,
      featured: body.featured !== undefined ? Boolean(body.featured) : existing.featured,
      publishedAt: String(body.publishedAt ?? existing.publishedAt),
      readingTime: estimateReadingTime(content),
      seo: (body.seo as BlogPost['seo']) || existing.seo || {},
      relatedProductIds: Array.isArray(body.relatedProductIds)
        ? body.relatedProductIds.map(String)
        : existing.relatedProductIds,
      relatedArticleIds: Array.isArray(body.relatedArticleIds)
        ? body.relatedArticleIds.map(String)
        : existing.relatedArticleIds,
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
        : existing.faqs || [],
      socialImage: String(body.socialImage ?? existing.socialImage ?? '').trim() || undefined,
      previousSlug: slugChanged ? existing.slug : existing.previousSlug,
      updatedAt: now,
    };

    state.blogPosts[index] = updated;

    if (slugChanged && (existing.status === 'published' || status === 'published')) {
      state.blogRedirects = state.blogRedirects || [];
      state.blogRedirects = state.blogRedirects.filter((redirect) => redirect.fromSlug !== existing.slug);
      state.blogRedirects.push({
        id: randomUUID(),
        fromSlug: existing.slug,
        toSlug: slug,
        createdAt: now,
      });
    }

    state.blogTags = state.blogTags || [];
    for (const tagName of updated.tags) {
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
  });

  const refreshed = await readDatabase();
  const post = (refreshed.blogPosts || []).find((item) => item.id === id);
  return NextResponse.json({ ok: true, post });
}

export async function DELETE(request: NextRequest, context: Context) {
  const auth = await requireAdmin(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === 'Forbidden' ? 403 : 401 });
  }
  const { id } = await context.params;
  await updateDatabase((state) => {
    state.blogPosts = (state.blogPosts || []).filter((item) => item.id !== id);
  });
  return NextResponse.json({ ok: true });
}