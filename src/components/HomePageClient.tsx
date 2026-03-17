'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Star, Shield, Truck, RotateCcw, Sparkles } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { Collection, Product } from '@/lib/types';

interface HomePageClientProps {
  products: Product[];
  collections: Collection[];
}

function HeroSection() {
  return (
    <section className="bg-[#ececec]">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 pt-6 pb-8">
        <div className="grid lg:grid-cols-[1fr_1.1fr] min-h-[520px] bg-black overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="flex items-center justify-center px-8 py-14"
          >
            <div className="text-center lg:text-left">
              <p className="text-[11px] tracking-[0.4em] uppercase text-[#d4af64] mb-4">Fresh Arrival</p>
              <h1 className="font-serif text-5xl md:text-6xl text-white mb-6">Begum</h1>
              <Link
                href="/shop?filter=new"
                className="inline-flex items-center gap-2 text-white text-3xl font-serif hover:text-[#d4af64] transition-colors"
              >
                Explore Now
              </Link>
            </div>
          </motion.div>
          <div className="relative min-h-[420px]">
            <Image
              src="https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=1600&q=85"
              alt="Fresh arrival feature"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function SignatureSection() {
  return (
    <section className="py-16 md:py-20 bg-[#1a1a1a] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
        <p className="text-xs tracking-[0.35em] uppercase text-[#d4af64] mb-4">The Gijayi Standard</p>
        <h2 className="font-serif text-4xl md:text-5xl leading-tight mb-5">
          Crafted like couture,
          <br />
          cherished like heirlooms.
        </h2>
        <p className="text-sm text-white/75 max-w-3xl mx-auto leading-relaxed mb-10">
          From gemstone selection to final polish, our atelier process balances opulent aesthetics with comfort, wearability and permanence.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            'Authenticity-certified craftsmanship',
            'Designs rooted in Indian ceremonial heritage',
            'Luxury concierge and aftercare support',
          ].map((item) => (
            <div key={item} className="border border-white/15 px-5 py-6 text-sm text-white/80">
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CollectionsSection({ collections }: { collections: Collection[] }) {
  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-14">
        <p className="text-xs tracking-[0.3em] uppercase text-[#b8963e] mb-3">Curated For You</p>
        <h2 className="font-serif text-4xl md:text-5xl">Our Collections</h2>
        <div className="gold-divider mt-5" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {collections.slice(0, 3).map((col, i) => (
          <motion.div
            key={col.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="group relative overflow-hidden"
            style={{ height: i === 0 ? '500px' : '380px' }}
          >
            <Image src={col.image} alt={col.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 33vw" />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-300" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-6">
              <p className="text-xs tracking-[0.3em] uppercase text-[#d4af64] mb-2">{col.itemCount} pieces</p>
              <h3 className="font-serif text-3xl mb-3">{col.name}</h3>
              <p className="text-sm text-white/80 max-w-xs mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">{col.description}</p>
              <Link href={`/collections/${col.slug}`} className="border border-[#d4af64] text-white px-6 py-2 text-xs tracking-widest uppercase hover:bg-[#b8963e] hover:border-[#b8963e] transition-all duration-300 opacity-0 group-hover:opacity-100">
                Explore
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function BestsellersSection({ products }: { products: Product[] }) {
  const bestsellers = products.filter((p) => p.isBestseller).slice(0, 4);
  return (
    <section className="py-20 bg-[#faf8f4] border-y border-[#efe6d7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-14">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-[#b8963e] mb-3">Most Loved</p>
            <h2 className="font-serif text-4xl md:text-5xl">Bestsellers</h2>
          </div>
          <Link href="/shop?filter=bestsellers" className="hidden md:flex items-center gap-2 text-xs tracking-widest uppercase hover:text-[#b8963e] transition-colors">
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {bestsellers.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  );
}

function BrandStorySection() {
  return (
    <section className="py-20 md:py-0">
      <div className="grid md:grid-cols-2 min-h-[500px]">
        <div className="relative min-h-[350px]">
          <Image src="https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=900&q=80" alt="Gijayi Craftsmanship" fill className="object-cover" sizes="50vw" />
        </div>
        <div className="bg-[#1a1a1a] text-white flex items-center px-10 md:px-20 py-16">
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <p className="text-xs tracking-[0.3em] uppercase text-[#b8963e] mb-4">Our Story</p>
            <h2 className="font-serif text-4xl md:text-5xl leading-tight mb-6">Where Tradition<br />Meets Artistry</h2>
            <div className="w-12 h-px bg-[#b8963e] mb-6" />
            <p className="text-sm text-gray-300 leading-relaxed mb-4">
              Gijayi was born from a deep reverence for India&apos;s jewellery-making heritage. Each piece is handcrafted by master artisans who have inherited their craft through generations.
            </p>
            <p className="text-sm text-gray-300 leading-relaxed mb-8">
              We source only the finest materials – from natural gemstones to 22-karat gold – to ensure every jewel that leaves our atelier is worthy of your most precious moments.
            </p>
            <Link href="/about" className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-[#d4af64] hover:gap-4 transition-all duration-300">
              Discover Our Story <ArrowRight size={14} />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function NewArrivalsSection({ products }: { products: Product[] }) {
  const newArrivals = products.filter((p) => p.isNew).slice(0, 6);
  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="flex items-end justify-between mb-14">
        <div>
          <p className="text-xs tracking-[0.3em] uppercase text-[#b8963e] mb-3">Fresh from the Atelier</p>
          <h2 className="font-serif text-4xl md:text-5xl">New Arrivals</h2>
        </div>
        <Link href="/shop?filter=new" className="hidden md:flex items-center gap-2 text-xs tracking-widest uppercase hover:text-[#b8963e] transition-colors">
          View All <ArrowRight size={14} />
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
        {newArrivals.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
      <div className="mt-10 text-center">
        <Link href="/products" className="inline-flex items-center gap-2 border border-[#1a1a1a] px-7 py-3 text-xs tracking-widest uppercase hover:border-[#b8963e] hover:text-[#b8963e] transition-colors">
          Browse all products <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}

const testimonials = [
  { name: 'Priya Sharma', location: 'Mumbai', text: 'The Kundan necklace I ordered for my wedding was absolutely breathtaking. The craftsmanship was exquisite and arrived beautifully packaged. Will treasure it forever.', rating: 5 },
  { name: 'Ananya Reddy', location: 'Hyderabad', text: 'Gijayi has the most stunning collection I\'ve seen online. The quality is superior – you can feel the difference when you hold the pieces. Worth every rupee.', rating: 5 },
  { name: 'Meera Nair', location: 'Kochi', text: 'Ordered the pearl jhumkas and I receive compliments every single time I wear them. Lightweight, beautiful, and exactly as pictured. Fast delivery too!', rating: 5 },
];

function TestimonialsSection() {
  return (
    <section className="py-20 bg-[#faf8f4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <p className="text-xs tracking-[0.3em] uppercase text-[#b8963e] mb-3">What Our Customers Say</p>
          <h2 className="font-serif text-4xl md:text-5xl">Love Notes</h2>
          <div className="gold-divider mt-5" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }} className="bg-white p-8">
              <div className="flex gap-1 mb-4">{[...Array(t.rating)].map((_, j) => <Star key={j} size={14} fill="#b8963e" className="text-[#b8963e]" />)}</div>
              <p className="text-gray-600 leading-relaxed mb-6 font-serif text-lg italic">&ldquo;{t.text}&rdquo;</p>
              <p className="text-sm font-medium">{t.name}</p>
              <p className="text-xs text-gray-400">{t.location}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const trustSignals = [
  { icon: Shield, title: 'Certified Authentic', desc: 'Every piece comes with a certificate of authenticity and quality assurance.' },
  { icon: Truck, title: 'Free Shipping', desc: 'Complimentary shipping on all orders above ₹5,000 across India.' },
  { icon: RotateCcw, title: 'Easy Returns', desc: 'Hassle-free 15-day returns. Your satisfaction is our priority.' },
  { icon: Sparkles, title: 'Luxury Concierge', desc: 'Personalised support for bridal edits, gifting and custom styling.' },
];

function TrustSection() {
  return (
    <section className="py-16 border-t border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {trustSignals.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }} className="flex flex-col items-center text-center gap-3 p-4">
                <Icon size={28} className="text-[#b8963e]" />
                <h4 className="font-medium text-sm tracking-wide">{item.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function InstagramSection() {
  const instaPics = [
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80',
    'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=400&q=80',
    'https://images.unsplash.com/photo-1652812376524-67a7b9490e0e?w=400&q=80',
    'https://images.unsplash.com/photo-1584811644165-33078f50eb15?w=400&q=80',
    'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=400&q=80',
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=81',
  ];
  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-10">
        <p className="text-xs tracking-[0.3em] uppercase text-[#b8963e] mb-3">Follow the Story</p>
        <h2 className="font-serif text-3xl md:text-4xl">@gijayi.official</h2>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {instaPics.map((src, i) => (
          <a key={i} href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="relative aspect-square overflow-hidden group">
            <Image src={src} alt={`Instagram ${i + 1}`} fill className="object-cover transition-transform duration-500 group-hover:scale-110" sizes="(max-width: 768px) 33vw, 16vw" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
              <span className="text-white opacity-0 group-hover:opacity-100 text-xs tracking-widest uppercase transition-opacity">View</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

export default function HomePageClient({ products, collections }: HomePageClientProps) {
  return (
    <>
      <HeroSection />
      <SignatureSection />
      <CollectionsSection collections={collections} />
      <BestsellersSection products={products} />
      <BrandStorySection />
      <TrustSection />
      <NewArrivalsSection products={products} />
      <TestimonialsSection />
      <InstagramSection />
    </>
  );
}
