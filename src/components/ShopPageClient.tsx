'use client';

import { useMemo, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { SlidersHorizontal, X, ChevronDown, Search, MessageCircle } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/lib/types';

interface ShopPageClientProps {
  products: Product[];
  categories: string[];
}

function ShopContent({ products, categories }: ShopPageClientProps) {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const collectionParam = searchParams.get('collection');
  const filterParam = searchParams.get('filter');
  const queryParam = searchParams.get('q')?.trim().toLowerCase() ?? '';

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('default');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeCategory = selectedCategory ?? categoryParam ?? 'All';

  const filtered = useMemo(() => {
    let result = [...products];

    if (filterParam === 'new') result = result.filter((p) => p.isNew);
    else if (filterParam === 'bestsellers') result = result.filter((p) => p.isBestseller);

    if (activeCategory !== 'All') {
      result = result.filter((p) => p.category === activeCategory);
    }

    if (collectionParam) {
      result = result.filter((p) => p.collection.toLowerCase() === collectionParam.toLowerCase());
    }

    if (queryParam) {
      result = result.filter((product) => {
        const haystack = [
          product.name,
          product.category,
          product.collection,
          product.description,
          ...product.details,
        ]
          .join(' ')
          .toLowerCase();

        return haystack.includes(queryParam);
      });
    }

    if (sortBy === 'price-asc') result.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') result.sort((a, b) => b.price - a.price);
    else if (sortBy === 'newest') result = result.filter((p) => p.isNew).concat(result.filter((p) => !p.isNew));

    return result;
  }, [activeCategory, collectionParam, sortBy, filterParam, products, queryParam]);

  const featuredCategories = categories.filter((category) => category !== 'All');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="border border-[#ece2d4] bg-[#fcfbf8] p-7 md:p-10 mb-10">
        <p className="text-xs tracking-[0.34em] uppercase text-[#b8963e] mb-3 text-center">
          {filterParam === 'new' ? 'Fresh Arrivals' : filterParam === 'bestsellers' ? 'Most Loved' : 'Discover'}
        </p>
        <h1 className="font-serif text-4xl md:text-5xl text-center">
          {queryParam
            ? 'Search Results'
            : filterParam === 'new'
              ? 'New Arrivals'
              : filterParam === 'bestsellers'
                ? 'Bestsellers'
                : 'All Jewellery'}
        </h1>
        <div className="gold-divider mt-4 mb-6" />
        <p className="text-sm text-gray-600 text-center max-w-2xl mx-auto leading-relaxed">
          Discover handcrafted statement pieces and ceremonial essentials designed to elevate every celebration.
        </p>
        <a
          href="https://wa.me/917310580050?text=Hi%20Gijayi%2C%20I%20need%20help%20choosing%20the%20right%20jewellery."
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 border border-[#25D366] text-[#25D366] px-5 py-3 text-xs tracking-widest uppercase hover:bg-[#25D366] hover:text-white transition-colors duration-300"
        >
          <MessageCircle size={14} /> Need styling help on WhatsApp?
        </a>
        {queryParam && (
          <p className="mt-5 text-sm text-gray-500 text-center">
            Showing results for <span className="text-[#1a1a1a] font-medium">&ldquo;{searchParams.get('q')}&rdquo;</span>
          </p>
        )}
      </div>

      {!queryParam && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs tracking-[0.3em] uppercase text-[#b8963e]">Shop by Category</p>
            <Link href="/services" className="text-xs tracking-widest uppercase hover:text-[#b8963e]">Need Styling Help?</Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {featuredCategories.map((cat) => (
              <Link
                key={cat}
                href={`/shop?category=${encodeURIComponent(cat)}`}
                className="border border-[#dfd3bf] px-4 py-2 text-xs tracking-widest uppercase hover:border-[#b8963e] hover:text-[#b8963e] transition-colors"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="flex items-center gap-2 text-xs tracking-widest uppercase border border-gray-200 px-4 py-2 hover:border-[#b8963e] transition-colors"
          >
            <SlidersHorizontal size={14} /> Filters
          </button>
          {activeCategory !== 'All' && (
            <span className="flex items-center gap-1 text-xs bg-[#1a1a1a] text-white px-3 py-1">
              {activeCategory}
              <button onClick={() => setSelectedCategory('All')}>
                <X size={12} />
              </button>
            </span>
          )}
          {queryParam && (
            <span className="flex items-center gap-1 text-xs bg-[#faf8f4] text-[#1a1a1a] px-3 py-1 border border-[#e6dfd2]">
              <Search size={12} /> {searchParams.get('q')}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{filtered.length} items</span>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none text-xs tracking-widest uppercase border border-gray-200 px-4 py-2 pr-8 focus:outline-none focus:border-[#b8963e] cursor-pointer"
            >
              <option value="default">Sort By</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest First</option>
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {filtersOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-2 pb-6 border-b border-gray-100">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs tracking-widest uppercase px-5 py-2 border transition-colors ${
                  activeCategory === cat
                    ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
                    : 'border-gray-200 hover:border-[#b8963e] hover:text-[#b8963e]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-serif text-2xl text-gray-300 mb-4">No items found</p>
          <div className="flex items-center justify-center gap-5 text-xs tracking-widest uppercase">
            <button onClick={() => { setSelectedCategory('All'); setSortBy('default'); }} className="underline">
              Clear filters
            </button>
            <Link href="/contact" className="text-[#b8963e] underline-offset-4 hover:underline">
              Need help sourcing something?
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ShopPageClient({ products, categories }: ShopPageClientProps) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-sm text-gray-400">Loading...</p></div>}>
      <ShopContent products={products} categories={categories} />
    </Suspense>
  );
}
