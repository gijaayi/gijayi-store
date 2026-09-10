import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import BlogPostCard from '@/components/blog/BlogPostCard';
import BlogCategoryNav from '@/components/blog/BlogCategoryNav';
import {
  formatBlogDate,
  getActiveBlogCategories,
  getBlogSettings,
  getPublicPosts,
  resolveFeaturedPost,
} from '@/lib/server/blog';
import { SITE_NAME, SITE_URL } from '@/lib/siteMetadata';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{ search?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const settings = await getBlogSettings();
  const hasSearch = Boolean(params.search?.trim());
  return {
    title: `${settings.title} | ${SITE_NAME}`,
    description: settings.intro,
    alternates: { canonical: `${SITE_URL}/blog` },
    robots: hasSearch ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      title: `${settings.title} | ${SITE_NAME}`,
      description: settings.intro,
      url: `${SITE_URL}/blog`,
      siteName: SITE_NAME,
      type: 'website',
    },
  };
}

export default async function BlogHomePage({ searchParams }: Props) {
  const params = await searchParams;
  const search = params.search?.trim() || '';
  const [settings, categories, posts] = await Promise.all([
    getBlogSettings(),
    getActiveBlogCategories(),
    getPublicPosts({ search: search || undefined }),
  ]);
  const featured = search ? null : await resolveFeaturedPost(posts);
  const gridPosts = featured ? posts.filter((post) => post.id !== featured.id) : posts;
  const categoryMap = new Map(categories.map((category) => [category.slug, category.name]));

  return (
    <div className="bg-white">
      <section className="relative overflow-hidden bg-[#1a1a1a] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,100,0.28),transparent_40%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24 text-center">
          <p className="text-xs tracking-[0.35em] uppercase text-[#d4af64] mb-3">
            <Link href="/" className="hover:text-white">Home</Link> / Journal
          </p>
          <h1 className="font-serif text-4xl md:text-6xl mb-4">{settings.title}</h1>
          <p className="max-w-2xl mx-auto text-sm md:text-base text-white/75 leading-relaxed mb-8">{settings.intro}</p>
          <form action="/blog" method="get" className="max-w-xl mx-auto flex gap-2">
            <input
              name="search"
              defaultValue={search}
              placeholder="Search articles..."
              className="flex-1 bg-white/10 border border-white/20 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-[#d4af64]"
            />
            <button type="submit" className="bg-white text-[#1a1a1a] px-5 py-3 text-xs tracking-widest uppercase hover:bg-[#d4af64] hover:text-white transition-colors">
              Search
            </button>
          </form>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <BlogCategoryNav categories={categories} />
      </section>

      {search && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-6">
          <p className="text-sm text-gray-600">
            {posts.length} result{posts.length === 1 ? '' : 's'} for “{search}”
          </p>
        </section>
      )}

      {featured && !search && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-14">
          <div className="grid md:grid-cols-[1.2fr_1fr] border border-[#efe6d7] overflow-hidden bg-[#fcfbf8]">
            <div className="relative min-h-80 md:min-h-[420px]">
              {featured.featuredImage ? (
                <Image src={featured.featuredImage} alt={featured.featuredImageAlt || featured.title} fill className="object-cover" priority sizes="(max-width:768px) 100vw, 60vw" />
              ) : (
                <div className="absolute inset-0 bg-[#efe6d7]" />
              )}
            </div>
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <p className="text-[10px] tracking-[0.35em] uppercase text-[#b8963e] mb-3">Featured · {categoryMap.get(featured.categorySlug) || featured.categorySlug}</p>
              <h2 className="font-serif text-3xl md:text-4xl mb-4 leading-tight">{featured.title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">{featured.excerpt}</p>
              <p className="text-xs text-gray-500 mb-8">
                {featured.author?.name} · {formatBlogDate(featured.publishedAt)} · {featured.readingTime} min read
              </p>
              <Link href={`/blog/${featured.slug}`} className="inline-flex w-fit bg-[#1a1a1a] text-white px-6 py-3 text-xs tracking-widest uppercase hover:bg-[#b8963e] transition-colors">
                Read Article
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <h2 className="font-serif text-3xl mb-8">{search ? 'Search Results' : 'Latest Articles'}</h2>
        {gridPosts.length === 0 ? (
          <p className="text-sm text-gray-500">No articles found yet. Check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {gridPosts.map((post) => (
              <BlogPostCard key={post.id} post={post} categoryName={categoryMap.get(post.categorySlug)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}