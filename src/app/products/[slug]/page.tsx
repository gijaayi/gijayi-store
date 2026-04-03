'use client';

import { useEffect, useLayoutEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart, Share2, ChevronDown, ArrowLeft, Star, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import ProductCard from '@/components/ProductCard';
export default function ProductDetailPage() {
  const whatsappUrl = 'https://wa.me/911234567890?text=Hi%20Gijayi%2C%20I%20want%20help%20with%20this%20product.';
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const slug = String(params?.slug || '');
  const pid = String(searchParams.get('pid') || '').trim();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedFromApi, setRelatedFromApi] = useState<Product[]>([]);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'details' | 'care'>('description');
  const { addItem } = useCart();
  const { isWishlisted, toggleItem } = useWishlist();
  const { user } = useAuth();

  // Scroll to top synchronously before render (useLayoutEffect runs before paint)
  useLayoutEffect(() => {
    // Temporarily disable smooth scrolling for this navigation
    document.documentElement.classList.add('scroll-instant');
    
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Re-enable smooth scrolling after a short delay
    const timer = setTimeout(() => {
      document.documentElement.classList.remove('scroll-instant');
    }, 100);
    
    return () => clearTimeout(timer);
  }, [slug, pid]);

  const handleAddToCart = () => {
    if (!product) return;
    if (!user) {
      window.location.href = `/login?redirect=/products/${slug}`;
      return;
    }
    addItem(product, selectedSize || undefined);
  };

  const handleToggleWishlist = () => {
    if (!product) return;
    if (!user) {
      window.location.href = `/login?redirect=/products/${slug}`;
      return;
    }
    toggleItem(product);
  };

  const addSelectedItemToCart = () => {
    if (!product) return;
    if (!user) {
      window.location.href = `/login?redirect=/products/${slug}`;
      return;
    }
    for (let index = 0; index < quantity; index++) {
      addItem(product, selectedSize || undefined);
    }
  };

  useEffect(() => {
    let active = true;

    async function loadProduct() {
      setIsLoadingProduct(true);

      try {
        const response = await fetch(`/api/products/${slug}${pid ? `?pid=${encodeURIComponent(pid)}` : ''}`, { cache: 'no-store' });
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
  }, [slug, pid]);

  useEffect(() => {
    if (!product) return;
    setSelectedImage(0);
    setSelectedSize(product.sizes?.[0] || '');
    setQuantity(1);
  }, [product?.id, product?.slug]);

  if (isLoadingProduct) {
    return <div className="min-h-[60vh] flex items-center justify-center text-sm text-gray-500">Loading product...</div>;
  }

  if (!product) notFound();

  const related = relatedFromApi;
  const wishlisted = isWishlisted(product.id);
  const highlights = [
    `Category: ${product.category}`,
    `Collection: ${product.collection}`,
    'Handcrafted finish by Gijayi artisans',
    'Premium gifting-ready packaging included',
  ];

  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images,
    description: product.description,
    sku: product.id,
    category: product.category,
    brand: {
      '@type': 'Brand',
      name: 'Gijayi',
    },
    offers: {
      '@type': 'Offer',
      url: `https://gijayi.com/products/${product.slug}`,
      priceCurrency: 'INR',
      price: product.price,
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://gijayi.com/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Shop',
        item: 'https://gijayi.com/shop',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.category,
        item: `https://gijayi.com/shop?category=${encodeURIComponent(product.category)}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: product.name,
        item: `https://gijayi.com/products/${product.slug}`,
      },
    ],
  };

  return (
    <div>
      {/* Scroll anchor */}
      <div id="product-top" style={{ position: 'absolute', top: 0 }} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Sticky Mobile Add to Cart */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 p-4">
        <button
          onClick={() => addSelectedItemToCart()}
          className="w-full bg-[#1a1a1a] text-white py-3 text-xs tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-[#b8963e] transition-colors duration-300 font-medium"
        >
          <ShoppingBag size={16} />
          Add to Bag
        </button>
      </div>

      {/* Add bottom padding to account for sticky button */}
      <div className="md:hidden h-20" />

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
                  <Image src={img} alt={`View ${i + 1}`} fill className="object-cover" sizes="80px" />
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
                  priority={selectedImage === 0}
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

            <div className="grid sm:grid-cols-3 gap-3 mb-8">
              {[
                { icon: ShieldCheck, label: '100% Authentic' },
                { icon: Truck, label: 'Free Shipping*' },
                { icon: RotateCcw, label: 'Easy Returns' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="border border-[#e9dfcd] bg-[#fcfbf8] px-3 py-3 flex items-center gap-2">
                    <Icon size={14} className="text-[#b8963e]" />
                    <p className="text-[11px] tracking-wider uppercase text-[#3b3b3b]">{item.label}</p>
                  </div>
                );
              })}
            </div>

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
                  addSelectedItemToCart();
                }}
                className="flex-1 bg-[#1a1a1a] text-white py-4 text-xs tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-[#b8963e] transition-colors duration-300"
              >
                <ShoppingBag size={16} />
                Add to Bag
              </button>
              <button
                type="button"
                onClick={() => handleToggleWishlist()}
                className={`border py-4 px-4 transition-all ${
                  wishlisted
                    ? 'bg-[#b8963e] border-[#b8963e] text-white'
                    : 'border-gray-200 hover:border-[#b8963e] hover:text-[#b8963e]'
                }`}
                aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!product) return;
                  if (!user) {
                    window.location.href = `/login?redirect=/products/${slug}`;
                    return;
                  }
                  toggleItem(product);
                }}
                className={`flex-1 border text-sm tracking-widest uppercase font-semibold rounded transition-all py-4 px-4 ${
                  wishlisted
                    ? 'bg-[#b8963e] text-white border-[#b8963e] hover:bg-[#a0824a]'
                    : 'bg-white text-[#1a1a1a] border-[#e5ddcf] hover:border-[#b8963e] hover:text-[#b8963e]'
                }`}
                title={wishlisted ? 'Saved for Later' : 'Save for Later'}
              >
                {wishlisted ? '✓ Saved' : 'Buy Later'}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (typeof window === 'undefined') return;
                  navigator.clipboard.writeText(window.location.href);
                }}
                className="border border-gray-200 py-4 px-4 hover:border-[#b8963e] hover:text-[#b8963e] transition-colors"
                title="Share product"
              >
                <Share2 size={18} />
              </button>
            </div>

            {/* Buy Now */}
            <Link
              href="/checkout"
              onClick={() => handleAddToCart()}
              className="block w-full text-center border border-[#1a1a1a] py-4 text-xs tracking-widest uppercase hover:bg-[#1a1a1a] hover:text-white transition-colors duration-300 mb-8"
            >
              Buy Now
            </Link>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-8 block w-full text-center border border-[#25D366] text-[#25D366] py-4 text-xs tracking-widest uppercase hover:bg-[#25D366] hover:text-white transition-colors duration-300"
            >
              Chat on WhatsApp
            </a>

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
                        <div className="space-y-3">
                          <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            This handcrafted Indian jewelry piece is designed for bridal jewelry online shoppers looking for made in India quality and affordable designer jewelry styling.
                          </p>
                        </div>
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

            <div className="mt-8 border border-[#efe6d7] bg-[#fcfbf8] p-5">
              <h3 className="font-serif text-2xl mb-4">Product Highlights</h3>
              <ul className="space-y-2">
                {highlights.map((item) => (
                  <li key={item} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-[#b8963e] mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5 grid sm:grid-cols-2 gap-3">
              <div className="border border-[#efe6d7] p-4">
                <p className="text-xs tracking-[0.3em] uppercase text-[#b8963e] mb-2">Delivery</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Dispatch within 2-3 business days. Complimentary insured shipping on prepaid orders above ₹5,000.
                </p>
              </div>
              <div className="border border-[#efe6d7] p-4">
                <p className="text-xs tracking-[0.3em] uppercase text-[#b8963e] mb-2">Returns</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Easy return assistance within 7 days for eligible products. Visit policy pages for full terms.
                </p>
              </div>
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

        <section className="mt-10 border border-[#efe6d7] bg-[#fcfbf8] p-6">
          <p className="text-xs tracking-[0.3em] uppercase text-[#b8963e] mb-3">Customer Trust</p>
          <h3 className="font-serif text-2xl mb-4">Proudly trusted by customers across India</h3>
          <div className="grid gap-3 md:grid-cols-3">
            <p className="text-sm text-gray-700">“Beautiful finishing and fast delivery.” — Nisha, Mumbai</p>
            <p className="text-sm text-gray-700">“Exactly what I wanted for bridal styling.” — Aarohi, Hyderabad</p>
            <p className="text-sm text-gray-700">“Great quality at a fair price.” — Sana, Lucknow</p>
          </div>
        </section>

        <div className="mt-8">
          <Link href="/shop" className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-gray-500 hover:text-[#b8963e] transition-colors">
            <ArrowLeft size={14} /> Back to Shop
          </Link>
        </div>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[#e5ddcf] bg-white/95 backdrop-blur px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="min-w-0">
            <p className="text-[10px] tracking-widest uppercase text-gray-500">{selectedSize ? `Size ${selectedSize}` : 'Select Size'}</p>
            <p className="font-serif text-lg leading-none">₹{product.price.toLocaleString('en-IN')}</p>
          </div>
          <button
            type="button"
            onClick={addSelectedItemToCart}
            className="ml-auto bg-[#1a1a1a] text-white px-5 py-3 text-xs tracking-widest uppercase hover:bg-[#b8963e] transition-colors"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
