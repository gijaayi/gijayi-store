import 'server-only';

import { readDatabase } from '@/lib/server/database';
import type {
  BlogCategory,
  BlogPost,
  BlogRedirect,
  BlogSettings,
  BlogTag,
  BlogTocItem,
} from '@/lib/blogTypes';
import { DEFAULT_BLOG_SETTINGS } from '@/lib/blogSeed';
import type { Product } from '@/lib/types';

const WORDS_PER_MINUTE = 225;

export function slugifyTitle(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function stripHtml(html: string): string {
  return String(html || '')
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function estimateReadingTime(contentHtml: string): number {
  const words = stripHtml(contentHtml).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

export function truncateExcerpt(text: string, max = 160): string {
  const clean = stripHtml(text);
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}

export function isPostPublic(post: BlogPost, now = new Date()): boolean {
  if (post.status === 'archived' || post.status === 'draft') return false;
  if (post.status === 'scheduled') {
    return Boolean(post.publishedAt) && new Date(post.publishedAt).getTime() <= now.getTime();
  }
  if (post.status !== 'published') return false;
  if (!post.publishedAt) return true;
  return new Date(post.publishedAt).getTime() <= now.getTime();
}

export function buildTocFromHtml(html: string): BlogTocItem[] {
  const toc: BlogTocItem[] = [];
  const headingRegex = /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = headingRegex.exec(html)) !== null) {
    const level = Number(match[1]) as 2 | 3;
    const attrs = match[2] || '';
    const text = stripHtml(match[3] || '');
    if (!text) continue;

    const existingId = /id=["']([^"']+)["']/i.exec(attrs)?.[1];
    const id = existingId || `section-${slugifyTitle(text) || index}`;
    toc.push({ id, text, level });
    index += 1;
  }

  return toc;
}

/** Inject ids into H2/H3 for TOC anchors when missing. */
export function ensureHeadingIds(html: string): string {
  let index = 0;
  return html.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi, (full, level, attrs, inner) => {
    const text = stripHtml(inner || '');
    if (/id=["']/i.test(attrs || '')) return full;
    const id = `section-${slugifyTitle(text) || index}`;
    index += 1;
    return `<h${level}${attrs} id="${id}">${inner}</h${level}>`;
  });
}

export async function getBlogSettings(): Promise<BlogSettings> {
  const db = await readDatabase();
  return db.blogSettings || DEFAULT_BLOG_SETTINGS;
}

export async function getActiveBlogCategories(): Promise<BlogCategory[]> {
  const db = await readDatabase();
  return (db.blogCategories || [])
    .filter((category) => category.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getBlogCategoryBySlug(slug: string): Promise<BlogCategory | null> {
  const db = await readDatabase();
  return (db.blogCategories || []).find((category) => category.slug === slug) || null;
}

export async function getBlogTagBySlug(slug: string): Promise<BlogTag | null> {
  const db = await readDatabase();
  return (db.blogTags || []).find((tag) => tag.slug === slug) || null;
}

export async function getPublicPosts(options?: {
  categorySlug?: string;
  tagSlug?: string;
  authorSlug?: string;
  search?: string;
  excludeId?: string;
}): Promise<BlogPost[]> {
  const db = await readDatabase();
  const now = new Date();
  let posts = (db.blogPosts || []).filter((post) => isPostPublic(post, now));

  if (options?.categorySlug) {
    posts = posts.filter((post) => post.categorySlug === options.categorySlug);
  }
  if (options?.tagSlug) {
    posts = posts.filter((post) => post.tags.map((tag) => slugifyTitle(tag)).includes(options.tagSlug!));
  }
  if (options?.authorSlug) {
    posts = posts.filter((post) => post.author?.slug === options.authorSlug);
  }
  if (options?.excludeId) {
    posts = posts.filter((post) => post.id !== options.excludeId);
  }
  if (options?.search) {
    const q = options.search.trim().toLowerCase();
    if (q) {
      posts = posts.filter((post) => {
        const haystack = [
          post.title,
          post.excerpt,
          stripHtml(post.content),
          post.categorySlug,
          ...(post.tags || []),
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(q);
      });
    }
  }

  return posts.sort(
    (a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime(),
  );
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const db = await readDatabase();
  const post = (db.blogPosts || []).find((item) => item.slug === slug);
  if (!post || !isPostPublic(post)) return null;
  return post;
}

export async function getPostBySlugAnyStatus(slug: string): Promise<BlogPost | null> {
  const db = await readDatabase();
  return (db.blogPosts || []).find((item) => item.slug === slug) || null;
}

export async function resolveFeaturedPost(posts?: BlogPost[]): Promise<BlogPost | null> {
  const list = posts || (await getPublicPosts());
  const featured = list
    .filter((post) => post.featured)
    .sort(
      (a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime(),
    );
  return featured[0] || list[0] || null;
}

export async function getRelatedPosts(post: BlogPost, limit = 4): Promise<BlogPost[]> {
  const all = await getPublicPosts({ excludeId: post.id });
  const manual = all.filter((item) => post.relatedArticleIds.includes(item.id));
  const sameCategory = all.filter(
    (item) => item.categorySlug === post.categorySlug && !manual.some((m) => m.id === item.id),
  );
  const sharedTags = all.filter((item) => {
    if (manual.some((m) => m.id === item.id) || sameCategory.some((m) => m.id === item.id)) return false;
    return item.tags.some((tag) => post.tags.includes(tag));
  });

  const merged = [...manual, ...sameCategory, ...sharedTags, ...all];
  const seen = new Set<string>();
  const unique: BlogPost[] = [];
  for (const item of merged) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    unique.push(item);
    if (unique.length >= limit) break;
  }
  return unique;
}

export async function getRelatedProductsForPost(post: BlogPost): Promise<Product[]> {
  if (!post.relatedProductIds?.length) return [];
  const db = await readDatabase();
  const map = new Map(db.products.map((product) => [product.id, product]));
  return post.relatedProductIds.map((id) => map.get(id)).filter(Boolean) as Product[];
}

export async function getAdjacentPosts(post: BlogPost): Promise<{ previous: BlogPost | null; next: BlogPost | null }> {
  const posts = await getPublicPosts();
  const index = posts.findIndex((item) => item.id === post.id);
  if (index < 0) return { previous: null, next: null };
  return {
    previous: posts[index + 1] || null,
    next: posts[index - 1] || null,
  };
}

export async function findBlogRedirect(fromSlug: string): Promise<BlogRedirect | null> {
  const db = await readDatabase();
  return (db.blogRedirects || []).find((redirect) => redirect.fromSlug === fromSlug) || null;
}

export { formatBlogDate } from '@/lib/blogFormat';
