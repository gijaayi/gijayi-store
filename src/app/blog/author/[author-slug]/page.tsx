import type { Metadata } from 'next';
import Link from 'next/link';
import BlogPostCard from '@/components/blog/BlogPostCard';
import { getActiveBlogCategories, getPublicPosts } from '@/lib/server/blog';
import { SITE_NAME, SITE_URL } from '@/lib/siteMetadata';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ 'author-slug': string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { 'author-slug': authorSlug } = await params;
  const posts = await getPublicPosts({ authorSlug });
  const authorName = posts[0]?.author?.name || authorSlug.replace(/-/g, ' ');
  return {
    title: `${authorName} | Gijayi Journal`,
    description: posts[0]?.author?.bio || `Articles by ${authorName} on the Gijayi Journal.`,
    alternates: { canonical: `${SITE_URL}/blog/author/${authorSlug}` },
  };
}

export default async function BlogAuthorPage({ params }: Props) {
  const { 'author-slug': authorSlug } = await params;
  const [posts, categories] = await Promise.all([
    getPublicPosts({ authorSlug }),
    getActiveBlogCategories(),
  ]);
  const author = posts[0]?.author;
  const categoryMap = new Map(categories.map((c) => [c.slug, c.name]));

  return (
    <div className="bg-white">
      <section className="bg-[#1a1a1a] text-white py-16 text-center px-4">
        <p className="text-xs tracking-[0.3em] uppercase text-[#d4af64] mb-3">
          <Link href="/blog" className="hover:text-white">Journal</Link> / Author
        </p>
        <h1 className="font-serif text-4xl md:text-5xl mb-3">{author?.name || authorSlug}</h1>
        {author?.bio && <p className="text-sm text-white/75 max-w-xl mx-auto">{author.bio}</p>}
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        {posts.length === 0 ? (
          <p className="text-sm text-gray-500">No articles by this author yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {posts.map((post) => (
              <BlogPostCard key={post.id} post={post} categoryName={categoryMap.get(post.categorySlug)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}