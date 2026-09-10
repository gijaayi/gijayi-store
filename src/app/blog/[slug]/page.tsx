import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import {
  buildTocFromHtml,
  ensureHeadingIds,
  findBlogRedirect,
  formatBlogDate,
  getActiveBlogCategories,
  getAdjacentPosts,
  getBlogSettings,
  getPostBySlug,
  getRelatedPosts,
  getRelatedProductsForPost,
  slugifyTitle,
} from '@/lib/server/blog';
import { SITE_NAME, SITE_URL, DEFAULT_OG_IMAGE } from '@/lib/siteMetadata';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const redirect = await findBlogRedirect(slug);
  if (redirect) {
    permanentRedirect(`/blog/${redirect.toSlug}`);
  }
  const post = await getPostBySlug(slug);
  if (!post) {
    return { title: `Article Not Found | ${SITE_NAME}` };
  }
  const title = post.seo?.metaTitle || `${post.title} | ${SITE_NAME}`;
  const description = post.seo?.metaDescription || post.excerpt;
  const image = post.seo?.ogImage || post.socialImage || post.featuredImage || DEFAULT_OG_IMAGE.url;
  const canonical = post.seo?.canonicalUrl || `${SITE_URL}/blog/${post.slug}`;
  return {
    title,
    description,
    keywords: post.seo?.keywords,
    alternates: { canonical },
    robots: {
      index: !post.seo?.noIndex,
      follow: !post.seo?.noFollow,
    },
    openGraph: {
      title: post.seo?.ogTitle || title,
      description: post.seo?.ogDescription || description,
      url: canonical,
      type: 'article',
      images: [{ url: image, alt: post.featuredImageAlt || post.title }],
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author?.name || SITE_NAME],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seo?.twitterTitle || title,
      description: post.seo?.twitterDescription || description,
      images: [post.seo?.twitterImage || image],
    },
  };
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const redirect = await findBlogRedirect(slug);
  if (redirect) {
    permanentRedirect(`/blog/${redirect.toSlug}`);
  }

  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const [categories, relatedPosts, relatedProducts, adjacent, settings] = await Promise.all([
    getActiveBlogCategories(),
    getRelatedPosts(post, 4),
    getRelatedProductsForPost(post),
    getAdjacentPosts(post),
    getBlogSettings(),
  ]);
  const category = categories.find((item) => item.slug === post.categorySlug);
  const contentHtml = ensureHeadingIds(post.content || '');
  const toc = buildTocFromHtml(contentHtml);
  const shareUrl = `${SITE_URL}/blog/${post.slug}`;
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.featuredImage ? [post.featuredImage] : undefined,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Person',
      name: post.author?.name || settings.defaultAuthorName,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': shareUrl },
  };
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Journal', item: `${SITE_URL}/blog` },
      ...(category
        ? [{ '@type': 'ListItem', position: 3, name: category.name, item: `${SITE_URL}/blog/category/${category.slug}` }]
        : []),
      {
        '@type': 'ListItem',
        position: category ? 4 : 3,
        name: post.title,
        item: shareUrl,
      },
    ],
  };
  const faqSchema =
    post.faqs?.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: post.faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: { '@type': 'Answer', text: faq.answer },
          })),
        }
      : null;

  return (
    <article className="bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}

      <section className="bg-[#1a1a1a] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 md:py-20">
          <p className="text-xs tracking-[0.3em] uppercase text-[#d4af64] mb-4">
            <Link href="/" className="hover:text-white">Home</Link>
            {' / '}
            <Link href="/blog" className="hover:text-white">Journal</Link>
            {category && (
              <>
                {' / '}
                <Link href={`/blog/category/${category.slug}`} className="hover:text-white">{category.name}</Link>
              </>
            )}
          </p>
          {category && (
            <p className="text-[10px] tracking-[0.35em] uppercase text-white/70 mb-3">{category.name}</p>
          )}
          <h1 className="font-serif text-4xl md:text-5xl leading-tight mb-5">{post.title}</h1>
          <p className="text-sm text-white/75 leading-relaxed mb-6 max-w-2xl">{post.excerpt}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/65">
            <Link href={`/blog/author/${post.author.slug}`} className="hover:text-[#d4af64]">
              {post.author.name}
            </Link>
            <span>Published {formatBlogDate(post.publishedAt)}</span>
            {post.updatedAt && post.updatedAt !== post.publishedAt && (
              <span>Updated {formatBlogDate(post.updatedAt)}</span>
            )}
            <span>{post.readingTime} min read</span>
          </div>
        </div>
      </section>

      {post.featuredImage && (
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 -mt-6 md:-mt-10">
          <div className="relative aspect-[16/9] overflow-hidden border border-[#efe6d7] bg-[#efe6d7]">
            <Image
              src={post.featuredImage}
              alt={post.featuredImageAlt || post.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width:1024px) 100vw, 960px"
            />
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16 grid md:grid-cols-[220px_1fr] gap-10">
        {toc.length > 0 && (
          <aside className="md:sticky md:top-28 h-fit border border-[#efe6d7] bg-[#fcfbf8] p-5">
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#b8963e] mb-3">In This Guide</p>
            <ol className="space-y-2 text-sm text-gray-700">
              {toc.map((item) => (
                <li key={item.id} className={item.level === 3 ? 'ml-3' : ''}>
                  <a href={`#${item.id}`} className="hover:text-[#b8963e]">
                    {item.text}
                  </a>
                </li>
              ))}
            </ol>
          </aside>
        )}

        <div className={toc.length ? '' : 'md:col-span-2'}>
          <div
            className="prose prose-neutral max-w-none blog-content text-[15px] leading-7 text-gray-800
              [&_h2]:font-serif [&_h2]:text-3xl [&_h2]:mt-10 [&_h2]:mb-4
              [&_h3]:font-serif [&_h3]:text-2xl [&_h3]:mt-8 [&_h3]:mb-3
              [&_a]:text-[#b8963e] [&_img]:rounded-none [&_img]:my-6
              [&_blockquote]:border-l-2 [&_blockquote]:border-[#b8963e] [&_blockquote]:pl-4 [&_blockquote]:italic"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />

          {post.tags?.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog/tag/${slugifyTitle(tag)}`}
                  className="px-3 py-1 text-[10px] tracking-widest uppercase border border-[#efe6d7] hover:border-[#b8963e]"
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}

          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`${post.title} ${shareUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-[10px] tracking-widest uppercase border border-[#efe6d7] hover:border-[#b8963e]"
            >
              WhatsApp
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-[10px] tracking-widest uppercase border border-[#efe6d7] hover:border-[#b8963e]"
            >
              Facebook
            </a>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-[10px] tracking-widest uppercase border border-[#efe6d7] hover:border-[#b8963e]"
            >
              X
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-[10px] tracking-widest uppercase border border-[#efe6d7] hover:border-[#b8963e]"
            >
              LinkedIn
            </a>
          </div>

          {post.faqs?.length > 0 && (
            <section className="mt-14 border-t border-[#efe6d7] pt-10">
              <h2 className="font-serif text-3xl mb-6">Frequently Asked Questions</h2>
              <div className="space-y-5">
                {post.faqs.map((faq) => (
                  <div key={faq.question}>
                    <h3 className="font-medium text-base mb-2">{faq.question}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section className="border-t border-[#efe6d7] bg-[#fcfbf8] py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="font-serif text-3xl mb-8">Related Jewellery</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {relatedPosts.length > 0 && (
        <section className="py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="font-serif text-3xl mb-8">You May Also Like</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedPosts.map((item) => (
                <Link key={item.id} href={`/blog/${item.slug}`} className="border border-[#efe6d7] p-4 hover:border-[#b8963e] transition-colors">
                  <p className="text-[10px] tracking-[0.25em] uppercase text-[#b8963e] mb-2">{item.readingTime} min read</p>
                  <h3 className="font-serif text-xl mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-3">{item.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="border-t border-[#efe6d7] py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-wrap justify-between gap-4 text-sm">
          {adjacent.previous ? (
            <Link href={`/blog/${adjacent.previous.slug}`} className="hover:text-[#b8963e]">
              ← {adjacent.previous.title}
            </Link>
          ) : (
            <span />
          )}
          {adjacent.next ? (
            <Link href={`/blog/${adjacent.next.slug}`} className="hover:text-[#b8963e] ml-auto">
              {adjacent.next.title} →
            </Link>
          ) : null}
        </div>
      </section>

      <section className="bg-[#1a1a1a] text-white py-14">
        <div className="max-w-xl mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl mb-3">Stay Inspired</h2>
          <p className="text-sm text-white/70 mb-6">Join the Gijayi journal for styling ideas and craft stories.</p>
          <Link href="/contact" className="inline-flex bg-white text-[#1a1a1a] px-6 py-3 text-xs tracking-widest uppercase hover:bg-[#d4af64] hover:text-white transition-colors">
            Get in Touch
          </Link>
        </div>
      </section>
    </article>
  );
}