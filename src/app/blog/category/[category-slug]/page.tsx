import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import BlogPostCard from '@/components/blog/BlogPostCard';
import BlogCategoryNav from '@/components/blog/BlogCategoryNav';
import {
  getActiveBlogCategories,
  getBlogCategoryBySlug,
  getPublicPosts,
} from '@/lib/server/blog';
import { SITE_NAME, SITE_URL } from '@/lib/siteMetadata';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ 'category-slug': string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { 'category-slug': categorySlug } = await params;
  const category = await getBlogCategoryBySlug(categorySlug);
  if (!category) return { title: `Category Not Found | ${SITE_NAME}` };
  const title = category.seoTitle || `${category.name} | Gijayi Journal`;
  const description = category.seoDescription || category.description;
  return {
    title,
    description,
    alternates: { canonical: category.canonicalUrl || `${SITE_URL}/blog/category/${category.slug}` },
    robots: { index: !category.noIndex, follow: true },
  };
}

export default async function BlogCategoryPage({ params }: Props) {
  const { 'category-slug': categorySlug } = await params;
  const [category, categories, posts] = await Promise.all([
    getBlogCategoryBySlug(categorySlug),
    getActiveBlogCategories(),
    getPublicPosts({ categorySlug }),
  ]);
  if (!category || !category.isActive) notFound();

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Journal', item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: category.name, item: `${SITE_URL}/blog/category/${category.slug}` },
    ],
  };

  return (
    <div className="bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <section className="bg-[#1a1a1a] text-white py-16 md:py-20 text-center px-4">
        <p className="text-xs tracking-[0.3em] uppercase text-[#d4af64] mb-3">
          <Link href="/blog" className="hover:text-white">Journal</Link> / Category
        </p>
        <h1 className="font-serif text-4xl md:text-5xl mb-4">{category.name}</h1>
        <p className="max-w-2xl mx-auto text-sm text-white/75">{category.description}</p>
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <BlogCategoryNav categories={categories} activeSlug={category.slug} />
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        {posts.length === 0 ? (
          <p className="text-sm text-gray-500">No published articles in this category yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {posts.map((post) => (
              <BlogPostCard key={post.id} post={post} categoryName={category.name} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}