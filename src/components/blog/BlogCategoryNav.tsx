import Link from 'next/link';
import type { BlogCategory } from '@/lib/blogTypes';

export default function BlogCategoryNav({
  categories,
  activeSlug,
}: {
  categories: BlogCategory[];
  activeSlug?: string;
}) {
  return (
    <nav className="flex flex-wrap gap-2 justify-center">
      <Link
        href="/blog"
        className={`px-4 py-2 text-[10px] tracking-[0.25em] uppercase border ${
          !activeSlug ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]' : 'border-[#efe6d7] text-gray-700 hover:border-[#b8963e]'
        }`}
      >
        All
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/blog/category/${category.slug}`}
          className={`px-4 py-2 text-[10px] tracking-[0.25em] uppercase border ${
            activeSlug === category.slug
              ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
              : 'border-[#efe6d7] text-gray-700 hover:border-[#b8963e]'
          }`}
        >
          {category.name}
        </Link>
      ))}
    </nav>
  );
}