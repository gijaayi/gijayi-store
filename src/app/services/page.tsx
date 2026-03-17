import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, Gem, Gift, MessageCircle } from 'lucide-react';

export const metadata = {
  title: 'Services – Gijayi',
  description: 'Discover Gijayi concierge services: bridal styling, customisation, gifting, and aftercare for timeless jewellery.',
};

const services = [
  {
    icon: Sparkles,
    title: 'Bridal Styling Concierge',
    subtitle: 'Curated to your ceremonies',
    description:
      'From haldi to reception, our stylists build complete jewellery edits that align with your outfits, rituals, and comfort.',
  },
  {
    icon: Gem,
    title: 'Custom Design & Personalisation',
    subtitle: 'One-of-one heirloom stories',
    description:
      'Book a custom consultation to adapt motifs, stones, finishing, and silhouettes for milestone occasions and gifting.',
  },
  {
    icon: Gift,
    title: 'Luxury Gifting Program',
    subtitle: 'For weddings and corporate moments',
    description:
      'Signature gifting with personalised notes, curated assortments, and premium packaging designed to leave a lasting impression.',
  },
  {
    icon: MessageCircle,
    title: 'Care & Restoration',
    subtitle: 'Lifetime support for your pieces',
    description:
      'Polishing, clasp repairs, restringing, and guidance on storage and wear to preserve beauty season after season.',
  },
];

export default function ServicesPage() {
  return (
    <div className="bg-[#fcfbf8]">
      <section className="relative min-h-[68vh] flex items-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1800&q=85"
          alt="Gijayi luxury services"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-24 text-center text-white">
          <p className="text-xs tracking-[0.4em] uppercase text-[#d4af64] mb-4">Beyond Jewellery</p>
          <h1 className="font-serif text-5xl md:text-7xl leading-tight mb-6">Signature Services</h1>
          <p className="max-w-2xl mx-auto text-sm md:text-base text-white/85 leading-relaxed">
            Inspired by couture hospitality, our service experiences are designed to make every celebration feel deeply personal and unmistakably luxurious.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-20">
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {services.map((service) => {
            const Icon = service.icon;

            return (
              <article key={service.title} className="border border-[#e9dfcf] bg-white p-7 md:p-9 shadow-[0_8px_30px_rgba(26,26,26,0.03)]">
                <div className="w-11 h-11 rounded-full bg-[#faf3e2] text-[#b8963e] flex items-center justify-center mb-5">
                  <Icon size={20} />
                </div>
                <p className="text-[11px] tracking-[0.26em] uppercase text-[#b8963e] mb-2">{service.subtitle}</p>
                <h2 className="font-serif text-3xl mb-4">{service.title}</h2>
                <p className="text-sm text-gray-600 leading-relaxed">{service.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20 text-center">
        <div className="border border-[#e9dfcf] bg-white p-8 md:p-12">
          <p className="text-xs tracking-[0.35em] uppercase text-[#b8963e] mb-4">Private Consultation</p>
          <h3 className="font-serif text-4xl md:text-5xl mb-4">Book your luxury consultation</h3>
          <p className="text-sm text-gray-600 mb-8 max-w-2xl mx-auto">
            Share your event date, outfit references, and preferences. Our concierge team will respond with a personalised recommendation plan.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/contact" className="bg-[#1a1a1a] text-white px-8 py-4 text-xs tracking-widest uppercase hover:bg-[#b8963e] transition-colors">
              Contact Concierge
            </Link>
            <Link href="/products" className="border border-[#1a1a1a] px-8 py-4 text-xs tracking-widest uppercase hover:border-[#b8963e] hover:text-[#b8963e] transition-colors">
              Explore Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}