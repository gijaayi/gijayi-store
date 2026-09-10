import type { MetadataRoute } from 'next';
import { readDatabase } from '@/lib/server/database';
import { getPublicPosts, isPostPublic } from '@/lib/server/blog';
import { getStorefrontCollections } from '@/lib/shopify';
import { SITE_URL } from '@/lib/siteMetadata';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/shop`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/collections`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: 'daily', priority: 0.85 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/faq`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/shipping`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/care`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/size-guide`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${baseUrl}/track-order`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  ];

  const [db, collections, publicPosts] = await Promise.all([
    readDatabase(),
    getStorefrontCollections(),
    getPublicPosts(),
  ]);

  const productEntries: MetadataRoute.Sitemap = (db.products || [])
    .filter((product) => Boolean(product.slug))
    .map((product) => ({
      url: `${baseUrl}/products/${product.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

  const collectionEntries: MetadataRoute.Sitemap = collections.map((collection) => ({
    url: `${baseUrl}/collections/${collection.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.75,
  }));

  const postEntries: MetadataRoute.Sitemap = publicPosts
    .filter((post) => isPostPublic(post) && !post.seo?.noIndex)
    .map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt || post.publishedAt || post.createdAt),
      changeFrequency: 'weekly' as const,
      priority: post.featured ? 0.8 : 0.7,
    }));

  const categoryEntries: MetadataRoute.Sitemap = (db.blogCategories || [])
    .filter((category) => category.isActive && !category.noIndex)
    .map((category) => ({
      url: `${baseUrl}/blog/category/${category.slug}`,
      lastModified: new Date(category.updatedAt || category.createdAt || now),
      changeFrequency: 'weekly' as const,
      priority: 0.65,
    }));

  return [...staticRoutes, ...productEntries, ...collectionEntries, ...postEntries, ...categoryEntries];
}
