'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { isWishlisted, toggleItem } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group"
    >
      <div className="relative overflow-hidden bg-[#faf8f4] aspect-3/4 product-image-zoom">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        {/* Hover image */}
        {product.images[1] && (
          <Image
            src={product.images[1]}
            alt={`${product.name} alt`}
            fill
            className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.isNew && (
            <span className="bg-[#1a1a1a] text-white text-[10px] tracking-widest uppercase px-2 py-1">
              New
            </span>
          )}
          {product.isBestseller && (
            <span className="bg-[#b8963e] text-white text-[10px] tracking-widest uppercase px-2 py-1">
              Bestseller
            </span>
          )}
          {product.compareAtPrice && (
            <span className="bg-red-500 text-white text-[10px] tracking-widest uppercase px-2 py-1">
              Sale
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={() => toggleItem(product)}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-3 right-3 w-8 h-8 bg-white flex items-center justify-center transition-opacity hover:text-red-500 shadow-sm ${
            wishlisted ? 'opacity-100 text-red-500' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <Heart size={15} fill={wishlisted ? 'currentColor' : 'none'} />
        </button>

        {/* Quick Add */}
        <button
          onClick={() => addItem(product)}
          className="absolute bottom-0 left-0 right-0 bg-[#1a1a1a] text-white text-xs tracking-widest uppercase py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center gap-2"
        >
          <ShoppingBag size={14} />
          Quick Add
        </button>
      </div>

      <div className="mt-4 px-1">
        <p className="text-[10px] tracking-widest uppercase text-[#b8963e] mb-1">{product.category}</p>
        <Link href={`/products/${product.slug}`} className="hover:text-[#b8963e] transition-colors">
          <h3 className="text-sm font-medium leading-snug">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-medium">₹{product.price.toLocaleString('en-IN')}</span>
          {product.compareAtPrice && (
            <span className="text-xs text-gray-400 line-through">
              ₹{product.compareAtPrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
