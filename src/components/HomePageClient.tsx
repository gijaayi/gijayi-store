'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Star, Shield, Truck, RotateCcw, Sparkles, Gem, BadgeCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { Collection, Product } from '@/lib/types';

interface CarouselBanner {
  id: string;
  image: string;
  headline: string;
  subtitle: string;
}

interface StorefrontCarousel {
  id: string;
  banners: CarouselBanner[];
}

interface StorefrontSettings {
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    primaryCtaLabel: string;
    primaryCtaHref: string;
    secondaryCtaLabel: string;
    secondaryCtaHref: string;
    heroImage: string;
    featureLabel: string;
    featureTitle: string;
    featureSubtitle: string;
    secondaryMedia: {
      enabled: boolean;
      image: string;
      label: string;
      title: string;
      href: string;
    };
  };
  carousel?: StorefrontCarousel;
  luxurySignals: string[];
  trustSection: {
    badge: string;
    title: string;
    subtitle: string;
  };
  trustSignals: Array<{ title: string; desc: string }>;
  testimonialsSection: {
    badge: string;
    title: string;
    subtitle: string;
    testimonials: Array<{
      name: string;
      location: string;
      text: string;
      rating: number;
    }>;
  };
  productCard: {
    quickAddLabel: string;
    quickViewLabel: string;
    newBadgeLabel: string;
    bestsellerBadgeLabel: string;
    saleBadgeSuffix: string;
    ratingValue: string;
    ratingCountLabel: string;
  };
}

interface HomePageClientProps {
  products: Product[];
  collections: Collection[];
  storefront: StorefrontSettings;
}

const luxuryIcons = [BadgeCheck, Gem, Truck];
const trustIcons = [Shield, Truck, RotateCcw, Sparkles];
const defaultSecondaryMedia = {
  enabled: false,
  image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=900&q=90',
  label: 'Craft Spotlight',
  title: 'Atelier Details',
  href: '/about',
};
const defaultProductCardContent = {
  quickAddLabel: 'Quick Add',
  quickViewLabel: 'Quick View',
  newBadgeLabel: 'New',
  bestsellerBadgeLabel: 'Bestseller',
  saleBadgeSuffix: 'Off',
  ratingValue: '4.8',
  ratingCountLabel: '(24 reviews)',
};
const defaultTrustSection = {
  badge: 'Why Gijayi',
  title: 'Confidence at Every Step',
  subtitle: 'From authenticity to delivery, every stage is designed for premium confidence.',
};
const defaultTestimonialsSection = {
  badge: 'Loved By Customers',
  title: 'Trusted Globally',
  subtitle: 'Gijayi customers around the world love our handcrafted jewelry, worldwide shipping, and personalized WhatsApp support for every purchase.',
  testimonials: [
    {
      name: 'Nisha Kapoor',
      location: 'Mumbai',
      text: 'Beautiful handcrafted Indian jewelry and quick delivery. Perfect for my wedding functions.',
      rating: 5,
    },
    {
      name: 'Aarohi Mehta',
      location: 'Hyderabad',
      text: 'Loved the quality materials and finish. Bridal jewelry online that actually looks premium.',
      rating: 5,
    },
    {
      name: 'Sana Rizvi',
      location: 'Lucknow',
      text: 'Affordable designer jewelry with classy packaging. Great support on WhatsApp too.',
      rating: 5,
    },
  ],
};

function HeroSection({ storefront }: { storefront: StorefrontSettings }) {
  const heroSlides = storefront.carousel?.banners || [
    {
      id: 'banner-1',
      image: storefront.hero.heroImage,
      headline: 'Handcrafted Bridal Luxury',
      subtitle: 'Statement jewelry designed for grand wedding celebrations.',
    },
    {
      id: 'banner-2',
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1400&q=90',
      headline: 'Timeless Kundan & Polki',
      subtitle: 'Classic Indian artistry with modern, wearable elegance.',
    },
    {
      id: 'banner-3',
      image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1400&q=90',
      headline: 'Made in India Craftsmanship',
      subtitle: 'Every detail is handcrafted with premium materials.',
    },
    {
      id: 'banner-4',
      image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=1400&q=90',
      headline: 'Affordable Designer Jewelry',
      subtitle: 'Luxury-inspired looks at fair prices.',
    },
  ].filter((slide) => slide.image);

  // Filter out empty slides (where image, headline, or subtitle is empty)
  const activeSlides = heroSlides.filter((slide) => slide.image && slide.headline && slide.subtitle).length > 0
    ? heroSlides.filter((slide) => slide.image && slide.headline && slide.subtitle)
    : heroSlides;

  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % activeSlides.length);
    }, 3500);

    return () => {
      window.clearInterval(timer);
    };
  }, [activeSlides.length]);

  const goPrev = () => setActiveSlide((current) => (current - 1 + activeSlides.length) % activeSlides.length);
  const goNext = () => setActiveSlide((current) => (current + 1) % activeSlides.length);

  return (
    <section className="relative h-[88vh] min-h-140 w-full overflow-hidden">
      {activeSlides.map((slide, index) => (
        <Image
          key={`carousel-${index}`}
          src={slide.image}
          alt={slide.headline}
          fill
          className={`object-cover transition-opacity duration-700 ${index === activeSlide ? 'opacity-100' : 'opacity-0'}`}
          priority={index === 0}
          sizes="100vw"
        />
      ))}

      <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/40 to-black/25" />

      <motion.div
        key={`content-${activeSlide}`}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="absolute inset-0 z-10 flex items-end md:items-center"
      >
        <div className="w-full px-5 pb-20 sm:px-8 md:pb-0 lg:px-12">
          <div className="max-w-3xl text-white">
            <p className="mb-3 text-[10px] tracking-[0.35em] uppercase text-white/85">{storefront.hero.badge}</p>
            <h1 className="font-serif text-4xl leading-tight sm:text-5xl md:text-6xl">
              {storefront.hero.title || 'Handcrafted Bridal & Statement Jewelry'}
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-white/90 sm:text-base">
              {storefront.hero.subtitle || 'Unique designs, fair prices, made in India.'}
            </p>
            {activeSlides[activeSlide] && (
              <p className="mt-4 text-xs tracking-[0.25em] uppercase text-white/80">{activeSlides[activeSlide].headline}</p>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href={storefront.hero.primaryCtaHref}
                className="inline-flex items-center justify-center gap-3 rounded-lg bg-white px-6 py-3 text-xs font-medium tracking-widest uppercase text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Explore Collection <ArrowRight size={15} />
              </Link>
              <Link
                href={storefront.hero.secondaryCtaHref}
                className="inline-flex items-center justify-center rounded-lg border border-white/70 px-6 py-3 text-xs font-medium tracking-widest uppercase text-white hover:bg-white/15 transition-colors"
              >
                {storefront.hero.secondaryCtaLabel}
              </Link>
            </div>
          </div>
        </div>
      </motion.div>


      <button
        type="button"
        onClick={goPrev}
        className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/60 bg-white/70 p-2 text-black hover:bg-white/90 transition-colors shadow"
        aria-label="Previous slide"
      >
        <ChevronLeft size={20} />
      </button>

      <button
        type="button"
        onClick={goNext}
        className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/60 bg-white/70 p-2 text-black hover:bg-white/90 transition-colors shadow"
        aria-label="Next slide"
      >
        <ChevronRight size={20} />
      </button>

      {activeSlides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
          {activeSlides.map((slide, index) => (
            <button
              key={`dot-${index}`}
              type="button"
              onClick={() => setActiveSlide(index)}
              className="min-h-0! min-w-0! bg-transparent p-0"
              aria-label={`Show hero slide ${index + 1}`}
              aria-current={index === activeSlide}
            >
              <span
                className={`block h-2 rounded-full transition-all ${index === activeSlide ? 'w-8 bg-white' : 'w-2 bg-white/60'}`}
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

function CollectionsSection({ collections }: { collections: Collection[] }) {
  const [fallbackImages, setFallbackImages] = useState<Record<string, string>>({});

  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-slate-50 to-white border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-[10px] tracking-[0.5em] uppercase text-slate-500 mb-4 font-medium">Curated Stories</p>
          <h2 className="font-serif text-5xl md:text-6xl text-slate-900 mb-6">Shop by Collection</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            From bridal opulence to modern minimal edits, discover the right collection for every celebration.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {collections.slice(0, 3).map((collection, index) => (
            (() => {
              const displayCollectionName = collection.name === 'Bridal Collection'
                ? 'Bridal Luxe'
                : collection.name === 'Everyday Luxe'
                  ? 'Everyday Minimal'
                  : collection.name;

              return (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="group relative h-97.5 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
            >
              <Image
                src={fallbackImages[collection.id] || collection.image}
                alt={collection.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, 33vw"
                onError={() => {
                  setFallbackImages((current) => {
                    if (current[collection.id]) return current;
                    return {
                      ...current,
                      [collection.id]: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=80',
                    };
                  });
                }}
              />
              <div className="absolute inset-0 bg-linear-to-b from-black/5 via-black/25 to-black/70" />
              <div className="absolute inset-0 flex flex-col items-start justify-end p-8 text-white">
                <p className="text-xs tracking-[0.4em] uppercase text-slate-100 mb-2">{collection.itemCount} Pieces</p>
                <h3 className="font-serif text-3xl md:text-4xl mb-3">{displayCollectionName}</h3>
                <p className="text-sm text-white/90 max-w-xs mb-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 line-clamp-2">
                  {collection.description}
                </p>
                <Link
                  href={`/collections/${collection.slug}`}
                  className="inline-flex items-center gap-2 border-2 border-white text-white px-6 py-2 text-xs tracking-widest uppercase hover:bg-white hover:text-slate-900 transition-all duration-300 opacity-0 group-hover:opacity-100 rounded-lg font-medium"
                >
                  View Collection <ArrowRight size={14} />
                </Link>
              </div>
            </motion.div>
              );
            })()
          ))}
        </div>
      </div>
    </section>
  );
}

function BestsellersSection({ products, storefront }: { products: Product[]; storefront: StorefrontSettings }) {
  const productCardContent = storefront.productCard || defaultProductCardContent;
  const mostWantedProducts = products.filter((product) => product.mostWanted).slice(0, 4);
  const bestsellers = mostWantedProducts.length > 0 ? mostWantedProducts : products.filter((product) => product.isBestseller).slice(0, 4);

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-14 gap-8">
          <div className="flex-1">
            <p className="text-[10px] tracking-[0.5em] uppercase text-slate-500 mb-4 font-medium">Customer Favorites</p>
            <h2 className="font-serif text-5xl md:text-6xl text-slate-900">Most Wanted</h2>
            <p className="text-slate-600 mt-4 max-w-md">Signature pieces chosen for style versatility, craftsmanship, and gifting appeal.</p>
          </div>
          <Link href="/shop?filter=bestsellers" className="hidden md:flex items-center gap-2 text-sm tracking-widest uppercase text-slate-900 hover:text-slate-600 transition-colors font-medium whitespace-nowrap">
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {bestsellers.map((product) => <ProductCard key={product.id} product={product} content={productCardContent} />)}
        </div>
      </div>
    </section>
  );
}

function BridalLuxeSection({ products, storefront }: { products: Product[]; storefront: StorefrontSettings }) {
  const productCardContent = storefront.productCard || defaultProductCardContent;
  const bridalProducts = products.filter((product) => product.bridalLuxe).slice(0, 4);

  if (bridalProducts.length === 0) return null;

  return (
    <section className="py-20 md:py-28 bg-linear-to-br from-rose-50 to-white border-y border-rose-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-14 gap-8">
          <div className="flex-1">
            <p className="text-[10px] tracking-[0.5em] uppercase text-rose-600 mb-4 font-medium">Wedding Collection</p>
            <h2 className="font-serif text-5xl md:text-6xl text-slate-900">Bridal Luxe</h2>
            <p className="text-slate-600 mt-4 max-w-md">Opulent jewellery crafted for your most cherished moments. Every piece tells a story.</p>
          </div>
          <Link href="/collections/bridal-collection" className="hidden md:flex items-center gap-2 text-sm tracking-widest uppercase text-slate-900 hover:text-slate-600 transition-colors font-medium whitespace-nowrap">
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {bridalProducts.map((product) => <ProductCard key={product.id} product={product} content={productCardContent} />)}
        </div>
      </div>
    </section>
  );
}

function HeritageSection({ products, storefront }: { products: Product[]; storefront: StorefrontSettings }) {
  const productCardContent = storefront.productCard || defaultProductCardContent;
  const heritageProducts = products.filter((product) => product.heritage).slice(0, 4);

  if (heritageProducts.length === 0) return null;

  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-slate-50 to-white border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-14 gap-8">
          <div className="flex-1">
            <p className="text-[10px] tracking-[0.5em] uppercase text-slate-500 mb-4 font-medium">Timeless Artistry</p>
            <h2 className="font-serif text-5xl md:text-6xl text-slate-900">Heritage</h2>
            <p className="text-slate-600 mt-4 max-w-md">Classic Indian artistry with modern, wearable elegance. Pieces that transcend generations.</p>
          </div>
          <Link href="/collections/heritage-collection" className="hidden md:flex items-center gap-2 text-sm tracking-widest uppercase text-slate-900 hover:text-slate-600 transition-colors font-medium whitespace-nowrap">
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {heritageProducts.map((product) => <ProductCard key={product.id} product={product} content={productCardContent} />)}
        </div>
      </div>
    </section>
  );
}

function EverydayMinimalSection({ products, storefront }: { products: Product[]; storefront: StorefrontSettings }) {
  const productCardContent = storefront.productCard || defaultProductCardContent;
  const minimalProducts = products.filter((product) => product.everydayMinimal).slice(0, 4);

  if (minimalProducts.length === 0) return null;

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-14 gap-8">
          <div className="flex-1">
            <p className="text-[10px] tracking-[0.5em] uppercase text-slate-500 mb-4 font-medium">Daily Elegance</p>
            <h2 className="font-serif text-5xl md:text-6xl text-slate-900">Everyday Minimal</h2>
            <p className="text-slate-600 mt-4 max-w-md">Modern minimal designs that complement any occasion from casual to professional.</p>
          </div>
          <Link href="/collections/everyday-luxe" className="hidden md:flex items-center gap-2 text-sm tracking-widest uppercase text-slate-900 hover:text-slate-600 transition-colors font-medium whitespace-nowrap">
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {minimalProducts.map((product) => <ProductCard key={product.id} product={product} content={productCardContent} />)}
        </div>
      </div>
    </section>
  );
}

function EditorialSection() {
  return (
    <section className="py-0 border-y border-slate-200">
      <div className="grid md:grid-cols-2 min-h-screen md:min-h-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative min-h-87.5 md:min-h-155 order-2 md:order-1"
        >
          <Image
            src="https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=1200&q=90"
            alt="Gijayi craftsmanship"
            fill
            className="object-cover"
            sizes="50vw"
          />
          <div className="absolute inset-0 bg-linear-to-r from-white/30 to-transparent" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-linear-to-br from-slate-900 to-slate-800 text-white flex items-center px-8 md:px-16 py-16 md:py-24 order-1 md:order-2"
        >
          <div>
            <p className="text-[10px] tracking-[0.5em] uppercase text-slate-300 mb-6 font-medium">Our House Story</p>
            <h2 className="font-serif text-5xl md:text-6xl leading-tight mb-8">
              Jewellery That
              <br />
              Feels Personal,
              <br />
              Looks Iconic
            </h2>
            <div className="w-12 h-1 bg-linear-to-r from-slate-200 to-transparent mb-8" />
            <div className="space-y-6 mb-10">
              <p className="text-base text-slate-200 leading-relaxed">
                Inspired by the timeless language of Indian adornment, Gijayi transforms ceremonial design cues into pieces that remain wearable, versatile, and deeply expressive.
              </p>
              <p className="text-base text-slate-200 leading-relaxed">
                Our design teams collaborate with karigars to balance heritage, comfort, and quality from gemstone selection to clasp engineering and finishing.
              </p>
            </div>
            <Link href="/about" className="inline-flex items-center gap-3 text-xs tracking-[0.4em] uppercase text-slate-100 hover:text-white transition-colors font-medium group">
              Read Our Story <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function NewArrivalsSection({ products, storefront }: { products: Product[]; storefront: StorefrontSettings }) {
  const productCardContent = storefront.productCard || defaultProductCardContent;
  const newArrivals = products.filter((product) => product.isNew).slice(0, 6);

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-14 gap-8">
          <div className="flex-1">
            <p className="text-[10px] tracking-[0.5em] uppercase text-slate-500 mb-4 font-medium">Fresh From The Atelier</p>
            <h2 className="font-serif text-5xl md:text-6xl text-slate-900">New Arrivals</h2>
            <p className="text-slate-600 mt-4 max-w-md">Fresh designs, Crafted for your moments.</p>
          </div>
          <Link href="/shop?filter=new" className="hidden md:flex items-center gap-2 text-sm tracking-widest uppercase text-slate-900 hover:text-slate-600 transition-colors font-medium whitespace-nowrap">
            View All <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {newArrivals.map((product) => <ProductCard key={product.id} product={product} content={productCardContent} />)}
        </div>
      </div>
    </section>
  );
}

function TrustSection({ storefront }: { storefront: StorefrontSettings }) {
  const trustSection = storefront.trustSection || defaultTrustSection;
  const trustSignals = storefront.trustSignals.slice(0, 4).map((item, index) => ({
    ...item,
    icon: trustIcons[index] || Shield,
  }));

  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-slate-50 to-white border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <p className="text-[10px] tracking-[0.5em] uppercase text-slate-500 mb-4 font-medium">{trustSection.badge}</p>
          <h2 className="font-serif text-5xl md:text-6xl text-slate-900">{trustSection.title}</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mt-4">{trustSection.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {trustSignals.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="group bg-white rounded-xl p-8 border border-slate-200 hover:shadow-xl transition-all duration-300"
              >
                <div className="bg-slate-100 rounded-lg w-fit p-4 mb-6 group-hover:bg-slate-900 transition-colors">
                  <Icon size={28} className="text-slate-900 group-hover:text-slate-100 transition-colors" />
                </div>
                <h4 className="font-medium text-lg text-slate-900 mb-3">{item.title}</h4>
                <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection({ storefront }: { storefront: StorefrontSettings }) {
  const testimonialsSection = storefront.testimonialsSection || defaultTestimonialsSection;
  const testimonials = testimonialsSection.testimonials || [];

  return (
    <section className="py-20 md:py-28 bg-white border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <p className="text-[10px] tracking-[0.5em] uppercase text-slate-500 mb-4 font-medium">{testimonialsSection.badge}</p>
          <h2 className="font-serif text-5xl md:text-6xl text-slate-900 mb-6">{testimonialsSection.title}</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">{testimonialsSection.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="bg-white rounded-xl p-8 border border-slate-200 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={18} fill="#d97706" className="text-amber-500" />
                ))}
              </div>
              <p className="text-slate-700 leading-relaxed mb-6 italic text-lg">&quot;{testimonial.text}&quot;</p>
              <div className="pt-6 border-t border-slate-200">
                <p className="font-semibold text-slate-900">{testimonial.name}</p>
                <p className="text-sm text-slate-500">{testimonial.location}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function InstagramSection() {
  const [imageData, setImageData] = useState<{ handle: string; profileUrl: string; images: Array<{ id: string; url: string }> } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchGallery() {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/instagram-gallery');
        if (res.ok) {
          const data = await res.json();
          if (data.instagramGallery) {
            setImageData({
              handle: data.instagramGallery.handle || 'begijayi',
              profileUrl: data.instagramGallery.profileUrl || 'https://instagram.com/begijayi',
              images: Array.isArray(data.instagramGallery.images) ? data.instagramGallery.images : [],
            });
          }
        }
      } catch (err) {
        console.error('Failed to fetch Instagram gallery:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchGallery();
  }, []);

  if (loading || error || !imageData || imageData.images.length === 0) {
    return null;
  }

  const { handle, profileUrl, images } = imageData;

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <p className="text-[10px] tracking-[0.5em] uppercase text-slate-500 mb-4 font-medium">Follow The Journey</p>
          <motion.a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            className="inline-block"
          >
            <h2 className="font-serif text-5xl md:text-6xl text-slate-900 mb-6 hover:text-[#b8963e] transition-colors cursor-pointer">@{handle}</h2>
          </motion.a>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-4">
          {images.map((pic, index) => (
            <motion.a
              key={pic.id}
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="relative aspect-square rounded-xl overflow-hidden group shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <Image
                src={pic.url}
                alt={`Instagram post ${index + 1}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 33vw, 16vw"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300?text=Image';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-4">
                <span className="text-white text-sm font-medium flex items-center gap-2">
                  <span>View Post</span>
                  <ArrowRight size={14} />
                </span>
              </div>
            </motion.a>
          ))}
        </div>

        <div className="mt-12 text-center">
          <motion.a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 border-2 border-slate-900 text-slate-900 px-8 py-4 rounded-lg hover:bg-slate-900 hover:text-white transition-all duration-300 font-medium tracking-widest uppercase text-sm shadow-lg hover:shadow-xl"
          >
            Follow Us <ArrowRight size={14} />
          </motion.a>
        </div>
      </div>
    </section>
  );
}

function IndiaCraftBannerSection() {
  return (
    <section className="bg-white pb-14 md:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl min-h-105 md:min-h-130">
          <Image
            src="https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1800&q=85"
            alt="India craftsmanship inspiration"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 1200px"
          />
          <div className="absolute inset-0 bg-black/35" />

          <div className="absolute inset-0 z-10 flex items-center justify-center p-6">
            <div className="text-center text-white max-w-3xl">
              <p className="text-xs tracking-[0.35em] uppercase text-white/85 mb-3">Inspired by India</p>
              <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl leading-tight mb-4">Crafted With Indian Heritage</h2>
              <p className="text-sm sm:text-base text-white/90 max-w-2xl mx-auto mb-8">
                Handcrafted Bridal &amp; Statement Jewelry rooted in timeless Indian artistry.
              </p>
              <Link
                href="/collections"
                className="inline-flex items-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-lg text-xs tracking-widest uppercase font-medium hover:bg-slate-100 transition-colors"
              >
                Explore Collection <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomePageClient({ products, collections, storefront }: HomePageClientProps) {
  return (
    <>
      <HeroSection storefront={storefront} />
      <CollectionsSection collections={collections} />
      <BestsellersSection products={products} storefront={storefront} />
      <BridalLuxeSection products={products} storefront={storefront} />
      <HeritageSection products={products} storefront={storefront} />
      <EverydayMinimalSection products={products} storefront={storefront} />
      <EditorialSection />
      <NewArrivalsSection products={products} storefront={storefront} />
      <TrustSection storefront={storefront} />
      <TestimonialsSection storefront={storefront} />
      <InstagramSection />
      <IndiaCraftBannerSection />
    </>
  );
}
