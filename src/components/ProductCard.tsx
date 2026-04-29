'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Eye, Heart, ShoppingBag, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';

interface ProductCardProps {
  product: Product;
  showRating?: boolean;
  content?: {
    quickAddLabel: string;
    quickViewLabel: string;
    newBadgeLabel: string;
    bestsellerBadgeLabel: string;
    saleBadgeSuffix: string;
    ratingValue: string;
    ratingCountLabel: string;
  };
}

const defaultContent = {
  quickAddLabel: 'Quick Add',
  quickViewLabel: 'Quick View',
  newBadgeLabel: 'New',
  bestsellerBadgeLabel: 'Bestseller',
  saleBadgeSuffix: 'Off',
  ratingValue: '4.8',
  ratingCountLabel: '(24 reviews)',
};

export default function ProductCard({ product, showRating = false, content = defaultContent }: ProductCardProps) {
  const { addItem } = useCart();
  const { isWishlisted, toggleItem } = useWishlist();
  const { user } = useAuth();
  const wishlisted = isWishlisted(product.id);
  const discountPercent = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    if (!user) {
      window.location.href = '/login?redirect=/';
      return;
    }
    addItem(product);
  };

  const handleToggleWishlist = () => {
    if (!user) {
      window.location.href = '/login?redirect=/';
      return;
    }
    toggleItem(product);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group"
    >
      <Link href={`/products/${product.slug}?pid=${encodeURIComponent(product.id)}`} prefetch={true}>
        <div className="relative overflow-hidden bg-[#faf8f4] rounded-lg shadow-sm w-full aspect-square product-image-zoom cursor-pointer">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover rounded-lg"
            sizes="(max-width: 768px) 45vw, 15vw"
          />
        {/* Hover image */}
        {product.images[1] && (
          <Image
            src={product.images[1]}
            alt={`${product.name} alt`}
            fill
            className="object-cover rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            sizes="(max-width: 768px) 45vw, 15vw"
          />
        )}

        {/* Badges - Hidden from card for better image visibility */}
        {/* Badges are shown on product detail page instead */}

        {/* Wishlist */}
        <button
          onClick={handleToggleWishlist}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-2 right-2 w-8 h-8 bg-white flex items-center justify-center transition-all hover:scale-110 shadow-md rounded-full ${
            wishlisted ? 'text-red-500 ring-2 ring-red-300' : 'text-gray-700 hover:text-red-500'
          }`}
          title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={14} fill={wishlisted ? 'currentColor' : 'none'} strokeWidth={wishlisted ? 0 : 2} />
        </button>

        {/* Quick Add */}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-0 left-0 right-0 bg-[#1a1a1a] text-white text-[10px] tracking-widest uppercase py-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center gap-1"
        >
          <ShoppingBag size={12} />
          {content.quickAddLabel}
        </button>

          <div
            className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white/95 text-[#1a1a1a] text-[9px] tracking-widest uppercase px-3 py-1.5 rounded-full flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          >
            <Eye size={11} />
            {content.quickViewLabel}
          </div>
        </div>
      </Link>

      <div className="mt-3 px-1">
        <p className="text-[9px] tracking-widest uppercase text-[#b8963e] mb-1">{product.category}</p>
        <Link href={`/products/${product.slug}?pid=${encodeURIComponent(product.id)}`} prefetch={true} className="hover:text-[#b8963e] transition-colors">
          <h3 className="text-xs font-medium leading-snug">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs font-medium">₹{product.price.toLocaleString('en-IN')}</span>
          {product.compareAtPrice && (
            <span className="text-[10px] text-gray-400 line-through">
              ₹{product.compareAtPrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>
        {showRating && (
          <div className="flex items-center gap-1 mt-2">
            <Star size={12} className="text-[#b8963e]" fill="currentColor" />
            <span className="text-xs text-gray-600">{content.ratingValue}</span>
            <span className="text-xs text-gray-400">{content.ratingCountLabel}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
