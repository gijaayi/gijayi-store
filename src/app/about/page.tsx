import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'About Us – Gijayi',
  description: 'The story behind Gijayi – India\'s luxury handcrafted jewellery brand.',
};

const milestones = [
  { year: '2010', title: 'The Beginning', desc: 'Gijayi was founded in Mumbai with a single atelier and three artisan families.' },
  { year: '2014', title: 'First Collection', desc: 'Our inaugural Bridal Collection sold out within days, cementing our reputation.' },
  { year: '2018', title: 'National Recognition', desc: 'Awarded the National Award for Excellence in Handicrafts by the Government of India.' },
  { year: '2022', title: 'Digital Expansion', desc: 'Launched gijayi.com, bringing our jewellery to customers across the country.' },
  { year: '2026', title: 'New Chapter', desc: 'Celebrating 1 million happy customers and launching our most ambitious collection yet.' },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center">
        <Image
          src="https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=1800&q=85"
          alt="Gijayi Artisans at work"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <p className="text-xs tracking-[0.4em] uppercase text-[#d4af64] mb-4">Est. 2010, Mumbai</p>
          <h1 className="font-serif text-5xl md:text-7xl text-white leading-tight max-w-2xl">
            The Story of<br />
            <em className="not-italic text-[#d4af64]">Gijayi</em>
          </h1>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-[#b8963e] mb-4">Our Mission</p>
            <h2 className="font-serif text-4xl md:text-5xl leading-tight mb-6">
              To keep India&apos;s<br />jewellery heritage alive
            </h2>
            <div className="w-12 h-px bg-[#b8963e] mb-6" />
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Gijayi was born from a passionate belief that India&apos;s extraordinary jewellery-making traditions deserve to be celebrated, preserved, and shared with the world. We work with artisan families across Rajasthan, Gujarat, and Bengal — communities where the art of kundan, meenakari, and filigree have been passed down through generations.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed mb-8">
              Each Gijayi piece is more than jewellery — it is a wearable heirloom, crafted with care, designed to be treasured, and meant to be passed on.
            </p>
            <Link href="/shop" className="inline-flex items-center gap-2 text-xs tracking-widest uppercase font-medium hover:text-[#b8963e] transition-colors group">
              Explore Our Jewellery <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="relative h-[480px]">
            <Image
              src="https://images.unsplash.com/photo-1584811644165-33078f50eb15?w=900&q=80"
              alt="Artisan crafting jewellery"
              fill
              className="object-cover"
              sizes="50vw"
            />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-[#1a1a1a] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-xs tracking-[0.3em] uppercase text-[#b8963e] mb-3">What We Stand For</p>
            <h2 className="font-serif text-4xl md:text-5xl">Our Values</h2>
            <div className="w-12 h-px bg-[#b8963e] mx-auto mt-5" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Artisanal Excellence', desc: 'Every piece is handcrafted by master artisans using techniques refined over centuries. We never compromise on craftsmanship.' },
              { title: 'Ethical Sourcing', desc: 'Our gemstones and precious metals are ethically sourced. We pay fair wages and support artisan communities directly.' },
              { title: 'Timeless Design', desc: 'We create designs that transcend trends — jewellery that looks as beautiful in twenty years as it does today.' },
            ].map((v, i) => (
              <div key={i} className="border border-white/10 p-8">
                <div className="text-[#b8963e] font-serif text-5xl mb-4">0{i + 1}</div>
                <h3 className="font-serif text-2xl mb-4">{v.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <p className="text-xs tracking-[0.3em] uppercase text-[#b8963e] mb-3">Our Journey</p>
          <h2 className="font-serif text-4xl md:text-5xl">Milestones</h2>
          <div className="gold-divider mt-5" />
        </div>
        <div className="relative">
          <div className="absolute left-1/2 -translate-x-1/2 h-full w-px bg-gray-100 hidden md:block" />
          <div className="space-y-12">
            {milestones.map((m, i) => (
              <div key={i} className={`grid md:grid-cols-2 gap-6 items-center ${i % 2 === 0 ? '' : 'md:flex-row-reverse'}`}>
                <div className={`${i % 2 === 0 ? 'md:text-right md:pr-12' : 'md:order-2 md:pl-12'}`}>
                  <span className="font-serif text-5xl text-[#b8963e]/30">{m.year}</span>
                  <h3 className="font-serif text-2xl mt-1 mb-2">{m.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{m.desc}</p>
                </div>
                <div className={`${i % 2 === 0 ? 'md:pl-12' : 'md:order-1 md:pr-12 md:text-right'} hidden md:block`}>
                  <div className="w-3 h-3 rounded-full bg-[#b8963e] mx-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-[#faf8f4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-xs tracking-[0.3em] uppercase text-[#b8963e] mb-3">The People Behind the Jewels</p>
            <h2 className="font-serif text-4xl md:text-5xl">Our Artisans</h2>
            <div className="gold-divider mt-5" />
            <p className="text-sm text-gray-500 max-w-xl mx-auto mt-5 leading-relaxed">
              Our artisans are the soul of Gijayi. Many have been creating jewellery for 30+ years, inheriting skills from their parents and grandparents.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Ramesh Soni', role: 'Master Kundan Craftsman', location: 'Jaipur, Rajasthan', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', exp: '32 years' },
              { name: 'Fatima Begum', role: 'Meenakari Artist', location: 'Varanasi, UP', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80', exp: '25 years' },
              { name: 'Kiran Das', role: 'Silver Filigree Specialist', location: 'Cuttack, Odisha', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80', exp: '28 years' },
            ].map((a, i) => (
              <div key={i} className="text-center">
                <div className="relative w-48 h-48 mx-auto mb-5 overflow-hidden rounded-full">
                  <Image src={a.image} alt={a.name} fill className="object-cover" />
                </div>
                <h3 className="font-serif text-xl mb-1">{a.name}</h3>
                <p className="text-[#b8963e] text-xs tracking-widest uppercase mb-1">{a.role}</p>
                <p className="text-xs text-gray-500">{a.location} · {a.exp} experience</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
