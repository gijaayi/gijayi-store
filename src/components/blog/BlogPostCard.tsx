import Image from 'next/image';
import Link from 'next/link';
import type { BlogPost } from '@/lib/blogTypes';
import { formatBlogDate } from '@/lib/blogFormat';

export default function BlogPostCard({ post, categoryName }: { post: BlogPost; categoryName?: string }) {
  const image = post.thumbnailImage || post.featuredImage;
  return (
    <article className="group border border-[#efe6d7] bg-[#fcfbf8] overflow-hidden flex flex-col h-full">
      <Link href={`/blog/${post.slug}`} className="relative block aspect-[4/3] bg-[#efe6d7]">
        {image ? (
          <Image src={image} alt={post.featuredImageAlt || post.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width:768px) 100vw, 33vw" />
        ) : null}
      </Link>
      <div className="p-5 md:p-6 flex flex-col flex-1">
        <p className="text-[10px] tracking-[0.3em] uppercase text-[#b8963e] mb-2">
          {categoryName || post.categorySlug} · {post.readingTime} min read
        </p>
        <h3 className="font-serif text-2xl mb-2 leading-snug">
          <Link href={`/blog/${post.slug}`} className="hover:text-[#b8963e] transition-colors">
            {post.title}
          </Link>
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-3">{post.excerpt}</p>
        <div className="mt-auto flex items-center justify-between gap-3 text-xs text-gray-500">
          <span>{post.author?.name}</span>
          <span>{formatBlogDate(post.publishedAt)}</span>
        </div>
        <Link href={`/blog/${post.slug}`} className="mt-4 inline-flex text-xs tracking-widest uppercase text-[#1a1a1a] hover:text-[#b8963e]">
          Read More →
        </Link>
      </div>
    </article>
  );
}