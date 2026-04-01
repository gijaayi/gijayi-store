import { Box, Droplet, Wind, Watch, Sparkles, Clock } from 'lucide-react';

export const metadata = {
  title: 'Jewellery Care – Gijayi',
  description: 'Learn how to store, clean, and preserve your Gijayi jewellery so each piece remains beautiful for years.',
};

const careTips = [
  {
    icon: Box,
    title: 'Store Individually',
    desc: 'Store each piece individually in a soft pouch or lined box to avoid scratches and tangling.',
  },
  {
    icon: Droplet,
    title: 'Avoid Moisture',
    desc: 'Avoid direct contact with perfume, makeup, hair spray, lotion, sanitiser, or water.',
  },
  {
    icon: Wind,
    title: 'Gentle Cleaning',
    desc: 'Wipe gently with a dry microfiber cloth after wear to remove oils and residue.',
  },
  {
    icon: Watch,
    title: 'Remove Before',
    desc: 'Remove jewellery before sleeping, exercising, bathing, or swimming.',
  },
  {
    icon: Sparkles,
    title: 'Protect Special Styles',
    desc: 'Keep kundan, polki, meenakari, and pearl styles away from moisture and harsh cleaners.',
  },
  {
    icon: Clock,
    title: 'Professional Care',
    desc: 'Schedule periodic professional cleaning or polishing for heirloom and bridal sets.',
  },
];

const trustBadges = [
  '🛡️ Lifetime Support',
  '✨ Expert Advice',
  '🎁 Repair Services',
  '📦 Free Guidance',
];

export default function CarePage() {
  return (
    <div className="bg-linear-to-b from-[#fcfbf8] to-white min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 md:py-20">
        <div className="text-center mb-14">
          <p className="text-xs tracking-[0.35em] uppercase text-[#b8963e] mb-3 font-semibold">Preserve the Craft</p>
          <h1 className="font-serif text-4xl md:text-5xl text-[#1a1a1a] mb-4">Jewellery Care Guide</h1>
          <p className="max-w-2xl mx-auto text-sm text-gray-600">
            Each Gijayi piece is handcrafted with care. With proper maintenance, your jewellery will retain its beauty and sparkle for years to come.
          </p>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {trustBadges.map((badge) => (
            <div key={badge} className="border border-[#efe6d7] bg-white p-4 text-center rounded">
              <p className="text-sm font-semibold text-[#1a1a1a]">{badge}</p>
            </div>
          ))}
        </div>

        {/* Care Tips Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {careTips.map(({ icon: Icon, title, desc }, index) => (
            <div
              key={title}
              className="border border-[#efe6d7] bg-white p-6 rounded-lg hover:shadow-lg transition"
            >
              <div className="flex items-start gap-4">
                <Icon className="w-8 h-8 text-[#b8963e] shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-serif text-lg text-[#1a1a1a] mb-2">{title}</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">{desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Do's & Don'ts */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="border-l-4 border-green-500 bg-green-50 p-6 rounded">
            <h3 className="font-serif text-xl text-[#1a1a1a] mb-4">✅ Do's</h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">→</span>
                <span>Store in a cool, dry place away from direct sunlight</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">→</span>
                <span>Use a soft microfiber cloth for gentle cleaning</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">→</span>
                <span>Remove jewellery before activities or exposure to chemicals</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">→</span>
                <span>Get professional cleaning annually for precious pieces</span>
              </li>
            </ul>
          </div>

          <div className="border-l-4 border-red-500 bg-red-50 p-6 rounded">
            <h3 className="font-serif text-xl text-[#1a1a1a] mb-4">❌ Don'ts</h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✗</span>
                <span>Don't expose to perfume, lotions, or harsh chemicals</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✗</span>
                <span>Don't store jewellery in humid or damp areas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✗</span>
                <span>Don't wear during exercise, bathing, or swimming</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✗</span>
                <span>Don't use abrasive cleaners or rough materials</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Support Banner */}
        <div className="border border-[#efe6d7] bg-[#fcfbf8] p-8 rounded-lg text-center">
          <p className="text-xs uppercase tracking-widest text-[#b8963e] font-semibold mb-3">Expert Support</p>
          <h3 className="font-serif text-2xl text-[#1a1a1a] mb-3">Need Care Advice?</h3>
          <p className="text-sm text-gray-700 mb-6">
            Our team is here to help. Reach out with questions about cleaning, storage, repairs, or customization of your Gijayi pieces.
          </p>
          <a href="/contact" className="inline-block bg-[#b8963e] text-white px-8 py-2 rounded text-sm font-semibold hover:bg-[#a37f35] transition">
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}