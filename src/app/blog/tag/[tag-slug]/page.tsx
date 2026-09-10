import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import BlogPostCard from '@/components/blog/BlogPostCard';
import { getActiveBlogCategories, getBlogTagBySlug, getPublicPosts } from '@/lib/server/blog';
import { SITE_NAME, SITE_URL } from '@/lib/siteMetadata';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ 'tag-slug': string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { 'tag-slug': tagSlug } = await params;
  const tag = await getBlogTagBySlug(tagSlug);
  if (!tag) return { title: `Tag Not Found | ${SITE_NAME}`, robots: { index: false, follow: true } };
  return {
    title: tag.seoTitle || `${tag.name} | Gijayi Journal`,
    description: tag.seoDescription || tag.description || `Articles tagged ${tag.name}`,
    alternates: { canonical: tag.canonicalUrl || `${SITE_URL}/blog/tag/${tag.slug}` },
    robots: { index: !tag.noIndex, follow: true },
  };
}

export default async function BlogTagPage({ params }: Props) {
  const { 'tag-slug': tagSlug } = await params;
  let tag = await getBlogTagBySlug(tagSlug);
  const posts = await getPublicPosts({ tagSlug });
  const categories = await getActiveBlogCategories();
  const categoryMap = new Map(categories.map((c) => [c.slug, c.name]));

  // Allow browsing tags that exist only on posts
  if (!tag && posts.length === 0) notFound();
  if (!tag) {
    tag = {
      id: tagSlug,
      name: tagSlug.replace(/-/g, ' '),
      slug: tagSlug,
      noIndex: true,
      isActive: true,
      createdAt: '',
      updatedAt: '',
    };
  }

  return (
    <div className="bg-white">
      <section className="bg-[#1a1a1a] text-white py-16 text-center px-4">
        <p className="text-xs tracking-[0.3em] uppercase text-[#d4af64] mb-3">
          <Link href="/blog" className="hover:text-white">Journal</Link> / Tag
        </p>
        <h1 className="font-serif text-4xl md:text-5xl mb-3">#{tag.name}</h1>
        {tag.description && <p className="text-sm text-white/75 max-w-xl mx-auto">{tag.description}</p>}
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {posts.map((post) => (
            <BlogPostCard key={post.id} post={post} categoryName={categoryMap.get(post.categorySlug)} />
          ))}
        </div>
      </section>
    </div>
  );
}