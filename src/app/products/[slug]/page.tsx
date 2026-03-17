'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart, Share2, ChevronDown, ArrowLeft, Star } from 'lucide-react';
import { products } from '@/lib/data';
import { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import ProductCard from '@/components/ProductCard';
import { use } from 'react';

interface Props {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: Props) {
  const { slug } = use(params);
  const staticProduct = products.find((item) => item.slug === slug) ?? null;

  const [product, setProduct] = useState<Product | null>(staticProduct);
  const [relatedFromApi, setRelatedFromApi] = useState<Product[]>([]);
  const [isLoadingProduct, setIsLoadingProduct] = useState(!staticProduct);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'details' | 'care'>('description');
  const { addItem } = useCart();
  const { isWishlisted, toggleItem } = useWishlist();

  useEffect(() => {
    let active = true;

    async function loadProduct() {
      if (staticProduct) {
        setIsLoadingProduct(false);
        return;
      }

      try {
        const response = await fetch(`/api/products/${slug}`, { cache: 'no-store' });
        if (!response.ok) {
          if (active) {
            setProduct(null);
            setIsLoadingProduct(false);
          }
          return;
        }

        const data = (await response.json()) as { product: Product; related: Product[] };
        if (active) {
          setProduct(data.product);
          setRelatedFromApi(data.related || []);
          setIsLoadingProduct(false);
        }
      } catch {
        if (active) {
          setProduct(null);
          setIsLoadingProduct(false);
        }
      }
    }

    loadProduct();

    return () => {
      active = false;
    };
  }, [slug, staticProduct]);

  useEffect(() => {
    if (!product) return;
    setSelectedSize(product.sizes?.[0] || '');
  }, [product]);

  if (isLoadingProduct) {
    return <div className="min-h-[60vh] flex items-center justify-center text-sm text-gray-500">Loading product...</div>;
  }

  if (!product) notFound();

  const related = relatedFromApi.length
    ? relatedFromApi
    : products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 4);
  const wishlisted = isWishlisted(product.id);

  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Link href="/" className="hover:text-[#b8963e]">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#b8963e]">Shop</Link>
          <span>/</span>
          <Link href={`/shop?category=${product.category}`} className="hover:text-[#b8963e]">{product.category}</Link>
          <span>/</span>
          <span className="text-[#1a1a1a]">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
          {/* Images */}
          <div className="flex flex-col-reverse md:flex-row gap-4">
            {/* Thumbnails */}
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto md:max-h-150">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative shrink-0 w-16 h-20 md:w-20 md:h-24 overflow-hidden border-2 transition-colors ${
                    selectedImage === i ? 'border-[#b8963e]' : 'border-transparent'
                  }`}
                >
                  <Image src={img} alt={`View ${i + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>

            {/* Main Image */}
            <div className="sticky top-24 flex-1 aspect-3/4 bg-[#faf8f4] overflow-hidden">
              <motion.div
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="relative w-full h-full"
              >
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </motion.div>

              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isNew && <span className="bg-[#1a1a1a] text-white text-[10px] px-2 py-1 tracking-widest uppercase">New</span>}
                {product.isBestseller && <span className="bg-[#b8963e] text-white text-[10px] px-2 py-1 tracking-widest uppercase">Bestseller</span>}
                {discount > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-1 tracking-widest uppercase">{discount}% Off</span>}
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="pt-2">
            <p className="text-xs tracking-[0.3em] uppercase text-[#b8963e] mb-2">{product.collection}</p>
            <h1 className="font-serif text-3xl md:text-4xl mb-4">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} fill="#b8963e" className="text-[#b8963e]" />
                ))}
              </div>
              <span className="text-xs text-gray-500">(24 reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-serif text-3xl">₹{product.price.toLocaleString('en-IN')}</span>
              {product.compareAtPrice && (
                <>
                  <span className="text-lg text-gray-400 line-through">₹{product.compareAtPrice.toLocaleString('en-IN')}</span>
                  <span className="text-sm text-red-500 font-medium">Save {discount}%</span>
                </>
              )}
            </div>

            <div className="w-12 h-px bg-[#b8963e] mb-6" />

            {/* Size */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <p className="text-xs tracking-widest uppercase font-medium mb-3">
                  Size: <span className="text-[#b8963e]">{selectedSize}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`w-12 h-12 text-sm border transition-colors ${
                        selectedSize === s
                          ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white'
                          : 'border-gray-200 hover:border-[#b8963e]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <p className="text-xs tracking-widest uppercase font-medium mb-3">Quantity</p>
              <div className="flex items-center border border-gray-200 w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-[#faf8f4] transition-colors text-lg"
                >
                  −
                </button>
                <span className="w-12 h-10 flex items-center justify-center text-sm border-x border-gray-200">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-[#faf8f4] transition-colors text-lg"
                >
                  +
                </button>
              </div>
              {product.stock <= 5 && (
                <p className="text-xs text-[#b8963e] mt-2">Only {product.stock} left in stock</p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <button
                onClick={() => {
                  for (let i = 0; i < quantity; i++) addItem(product, selectedSize || undefined);
                }}
                className="flex-1 bg-[#1a1a1a] text-white py-4 text-xs tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-[#b8963e] transition-colors duration-300"
              >
                <ShoppingBag size={16} />
                Add to Bag
              </button>
              <button
                type="button"
                onClick={() => toggleItem(product)}
                className="border border-gray-200 py-4 px-4 hover:border-[#b8963e] hover:text-[#b8963e] transition-colors"
                aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} className={wishlisted ? 'text-red-500' : ''} />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (typeof window === 'undefined') return;
                  navigator.clipboard.writeText(window.location.href);
                }}
                className="border border-gray-200 py-4 px-4 hover:border-[#b8963e] hover:text-[#b8963e] transition-colors"
              >
                <Share2 size={18} />
              </button>
            </div>

            {/* Buy Now */}
            <Link
              href="/checkout"
              onClick={() => addItem(product, selectedSize || undefined)}
              className="block w-full text-center border border-[#1a1a1a] py-4 text-xs tracking-widest uppercase hover:bg-[#1a1a1a] hover:text-white transition-colors duration-300 mb-8"
            >
              Buy Now
            </Link>

            {/* Tabs */}
            <div className="border-t border-gray-100">
              {(['description', 'details', 'care'] as const).map((tab) => (
                <div key={tab} className="border-b border-gray-100">
                  <button
                    onClick={() => setActiveTab(activeTab === tab ? 'description' : tab)}
                    className="flex items-center justify-between w-full py-4 text-xs tracking-widest uppercase font-medium"
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${activeTab === tab ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {activeTab === tab && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="pb-4"
                    >
                      {tab === 'description' && (
                        <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
                      )}
                      {tab === 'details' && (
                        <ul className="space-y-2">
                          {product.details.map((d, i) => (
                            <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                              <span className="text-[#b8963e] mt-1">•</span> {d}
                            </li>
                          ))}
                        </ul>
                      )}
                      {tab === 'care' && (
                        <ul className="space-y-2">
                          {['Store in a cool, dry place away from moisture', 'Avoid contact with perfume, lotion, and chemicals', 'Clean gently with a soft, dry cloth', 'Remove before swimming or exercising', 'Store separately to avoid scratching'].map((tip, i) => (
                            <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                              <span className="text-[#b8963e] mt-1">•</span> {tip}
                            </li>
                          ))}
                        </ul>
                      )}
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mt-24">
            <div className="text-center mb-12">
              <p className="text-xs tracking-[0.3em] uppercase text-[#b8963e] mb-2">You May Also Like</p>
              <h2 className="font-serif text-3xl md:text-4xl">Related Pieces</h2>
              <div className="gold-divider mt-4" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}

        <div className="mt-8">
          <Link href="/shop" className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-gray-500 hover:text-[#b8963e] transition-colors">
            <ArrowLeft size={14} /> Back to Shop
          </Link>
        </div>
      </div>
    </div>
  );
}
