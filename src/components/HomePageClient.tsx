'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Star, Shield, Truck, RotateCcw, Sparkles, Gem, BadgeCheck } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { Collection, Product } from '@/lib/types';

interface HomePageClientProps {
  products: Product[];
  collections: Collection[];
}

const UPDATED_HERITAGE_IMAGE = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=90';

const luxurySignals = [
  { icon: BadgeCheck, label: 'BIS Hallmark-ready Designs' },
  { icon: Gem, label: 'Handpicked Stones & Polki' },
  { icon: Truck, label: 'Insured Pan-India Delivery' },
];

const trustSignals = [
  { icon: Shield, title: 'Certified Authentic', desc: 'Every piece includes authenticity-backed quality checks.' },
  { icon: Truck, title: 'Premium Shipping', desc: 'Safe and trackable delivery with complimentary packaging.' },
  { icon: RotateCcw, title: 'Easy Returns', desc: 'Simple return support with assisted pickup flow.' },
  { icon: Sparkles, title: 'Style Concierge', desc: 'Personal guidance for bridal, gifting, and festive edits.' },
];

const testimonials = [
  {
    name: 'Priya Sharma',
    location: 'Mumbai',
    text: 'The Kundan necklace I ordered for my wedding was absolutely breathtaking. The craftsmanship was exquisite and arrived beautifully packaged.',
    rating: 5,
  },
  {
    name: 'Ananya Reddy',
    location: 'Hyderabad',
    text: 'Gijayi has the most stunning collection I have seen online. The quality is superior and every detail feels premium.',
    rating: 5,
  },
  {
    name: 'Meera Nair',
    location: 'Kochi',
    text: 'Beautiful pieces and great finishing. I receive compliments every time I wear them and delivery was very smooth.',
    rating: 5,
  },
];

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#faf8f4] via-white to-[#f8f6f1]">
      <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(#d6d3d1_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="relative max-w-7xl mx-auto w-full px-4 sm:px-6 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-10 md:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="flex flex-col justify-center"
          >
            <p className="text-[10px] tracking-[0.55em] uppercase text-slate-500 mb-5 font-medium">Modern Indian Fine Jewellery</p>
            <h1 className="font-serif text-5xl md:text-7xl leading-[1.05] text-slate-900 mb-7">
              Legacy Pieces,
              <br />
              Reimagined for
              <br />
              Today.
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed mb-10 max-w-xl">
              Discover heirloom-inspired necklaces, bangles, jhumkas, and statement bridal sets handcrafted by master artisans for contemporary wardrobes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-lg hover:bg-slate-800 transition-colors font-medium tracking-wide uppercase text-sm"
              >
                Shop Bestsellers <ArrowRight size={16} />
              </Link>
              <Link
                href="/collections"
                className="inline-flex items-center justify-center gap-3 border-2 border-slate-900 text-slate-900 px-8 py-4 rounded-lg hover:bg-slate-50 transition-colors font-medium tracking-wide uppercase text-sm"
              >
                View Collections
              </Link>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              {luxurySignals.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-xl border border-slate-200 bg-white/80 backdrop-blur px-4 py-3 flex items-center gap-3">
                    <Icon size={16} className="text-slate-800" />
                    <p className="text-xs text-slate-700 font-medium leading-tight">{item.label}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative"
          >
            <div className="relative h-[520px] md:h-[650px] rounded-[2rem] overflow-hidden shadow-2xl">
              <Image
                src={UPDATED_HERITAGE_IMAGE}
                alt="Luxury jewellery editorial"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
              <div className="absolute left-6 right-6 bottom-6 rounded-2xl border border-white/30 bg-black/35 backdrop-blur-md p-5 text-white">
                <p className="text-[10px] uppercase tracking-[0.35em] text-white/80 mb-2">Featured Drop</p>
                <h3 className="font-serif text-3xl mb-1">Heritage Edit</h3>
                <p className="text-sm text-white/85">18 statement pieces inspired by royal Indian silhouettes.</p>
              </div>
            </div>
            <div className="hidden md:block absolute -bottom-8 -left-8 bg-white border border-slate-200 rounded-2xl p-5 shadow-xl">
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 mb-2">Trusted by brides</p>
              <p className="font-serif text-3xl text-slate-900">4.9/5</p>
              <p className="text-xs text-slate-600">Based on verified customer stories</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function CollectionsSection({ collections }: { collections: Collection[] }) {
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
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
              style={{ height: index === 0 ? '500px' : '390px' }}
            >
              <Image
                src={collection.image}
                alt={collection.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/25 to-black/70" />
              <div className="absolute inset-0 flex flex-col items-start justify-end p-8 text-white">
                <p className="text-xs tracking-[0.4em] uppercase text-slate-100 mb-2">{collection.itemCount} Pieces</p>
                <h3 className="font-serif text-3xl md:text-4xl mb-3">{collection.name}</h3>
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
          ))}
        </div>
      </div>
    </section>
  );
}

function BestsellersSection({ products }: { products: Product[] }) {
  const bestsellers = products.filter((product) => product.isBestseller).slice(0, 4);

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
          {bestsellers.map((product) => <ProductCard key={product.id} product={product} />)}
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
          className="relative min-h-[350px] md:min-h-[620px] order-2 md:order-1"
        >
          <Image
            src="https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=1200&q=90"
            alt="Gijayi craftsmanship"
            fill
            className="object-cover"
            sizes="50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center px-8 md:px-16 py-16 md:py-24 order-1 md:order-2"
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
            <div className="w-12 h-1 bg-gradient-to-r from-slate-200 to-transparent mb-8" />
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

function NewArrivalsSection({ products }: { products: Product[] }) {
  const newArrivals = products.filter((product) => product.isNew).slice(0, 6);

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-14 gap-8">
          <div className="flex-1">
            <p className="text-[10px] tracking-[0.5em] uppercase text-slate-500 mb-4 font-medium">Fresh From The Atelier</p>
            <h2 className="font-serif text-5xl md:text-6xl text-slate-900">New Arrivals</h2>
            <p className="text-slate-600 mt-4 max-w-md">Latest drops designed for wedding season, festive gifting, and elevated daily styling.</p>
          </div>
          <Link href="/shop?filter=new" className="hidden md:flex items-center gap-2 text-sm tracking-widest uppercase text-slate-900 hover:text-slate-600 transition-colors font-medium whitespace-nowrap">
            View All <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {newArrivals.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </div>
    </section>
  );
}

function TrustSection() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-slate-50 to-white border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <p className="text-[10px] tracking-[0.5em] uppercase text-slate-500 mb-4 font-medium">Why Gijayi</p>
          <h2 className="font-serif text-5xl md:text-6xl text-slate-900">Confidence at Every Step</h2>
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

function TestimonialsSection() {
  return (
    <section className="py-20 md:py-28 bg-white border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <p className="text-[10px] tracking-[0.5em] uppercase text-slate-500 mb-4 font-medium">Loved By Customers</p>
          <h2 className="font-serif text-5xl md:text-6xl text-slate-900 mb-6">Customer Stories</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">Real reviews from customers who trust Gijayi for their meaningful moments.</p>
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
  const instaPics = [
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80',
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80',
    'https://images.unsplash.com/photo-1652812376524-67a7b9490e0e?w=400&q=80',
    'https://images.unsplash.com/photo-1584811644165-33078f50eb15?w=400&q=80',
    'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=400&q=80',
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=81',
  ];

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <p className="text-[10px] tracking-[0.5em] uppercase text-slate-500 mb-4 font-medium">Follow The Journey</p>
          <h2 className="font-serif text-5xl md:text-6xl text-slate-900 mb-6">@gijayi.official</h2>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-4">
          {instaPics.map((src, index) => (
            <motion.a
              key={index}
              href="https://instagram.com/gijayi.official"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="relative aspect-square rounded-xl overflow-hidden group shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <Image
                src={src}
                alt={`Instagram ${index + 1}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 33vw, 16vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-medium transition-opacity">View Post</span>
              </div>
            </motion.a>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a
            href="https://instagram.com/gijayi.official"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border-2 border-slate-900 text-slate-900 px-8 py-4 rounded-lg hover:bg-slate-900 hover:text-white transition-colors font-medium tracking-widest uppercase text-sm"
          >
            Follow Us <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}

export default function HomePageClient({ products, collections }: HomePageClientProps) {
  return (
    <>
      <HeroSection />
      <CollectionsSection collections={collections} />
      <BestsellersSection products={products} />
      <EditorialSection />
      <NewArrivalsSection products={products} />
      <TrustSection />
      <TestimonialsSection />
      <InstagramSection />
    </>
  );
}
