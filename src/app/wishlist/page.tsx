'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { useWishlist } from '@/context/WishlistContext';

export default function WishlistPage() {
  const { items, clearWishlist } = useWishlist();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-20">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
        <div>
          <p className="text-xs tracking-[0.35em] uppercase text-[#b8963e] mb-3">Saved Pieces</p>
          <h1 className="font-serif text-4xl md:text-5xl">Wishlist</h1>
        </div>
        {items.length > 0 && (
          <button onClick={clearWishlist} className="text-xs tracking-widest uppercase text-gray-500 hover:text-[#b8963e]">
            Clear Wishlist
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center text-center border border-dashed border-[#d8c8a1] bg-[#fcfbf8] px-6">
          <Heart size={42} className="text-[#b8963e] mb-4" />
          <h2 className="font-serif text-3xl mb-3">Your wishlist is empty</h2>
          <p className="text-sm text-gray-600 mb-8 max-w-md">
            Save the pieces you love so you can come back to them when the moment is right.
          </p>
          <Link href="/shop" className="bg-[#1a1a1a] text-white px-8 py-4 text-xs tracking-widest uppercase hover:bg-[#b8963e] transition-colors">
            Explore the shop
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}