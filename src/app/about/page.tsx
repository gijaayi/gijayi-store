import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gijayi.com';

export const metadata: Metadata = {
  title: 'About Gijayi – Heritage, Artisans & Handcrafted Jewelry',
  description: "Learn the Gijayi story: preserving India's centuries-old jewelry heritage, supporting artisan communities, and creating heirloom pieces. Founded 2010, now shipping globally.",
  keywords: 'Gijayi brand story, handcrafted jewelry heritage, artisan jewelry, Indian craftsmanship, jewelry maker, sustainable jewelry, fair trade jewelry',
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: `${siteUrl}/about`,
  },
  openGraph: {
    title: 'About Gijayi – Heritage & Artisan Jewelry',
    description: "Discover the story of Gijayi: preserving India's jewelry heritage, supporting artisans, and creating handcrafted heirloom pieces for the world.",
    url: `${siteUrl}/about`,
    siteName: 'Gijayi',
    type: 'website',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1200&q=90',
        width: 1200,
        height: 630,
        alt: 'Gijayi – Handcrafted Jewelry',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Gijayi – Heritage Jewelry Makers',
    description: "The story of preserving India's centuries-old jewelry craftsmanship and supporting artisan communities worldwide.",
  },
};

const standForPoints = [
  'Handmade creations inspired by lifelong creativity.',
  'Designs shaped with love, detail, and intention.',
  'Jewellery that feels personal, expressive, and elegant.',
  'A brand built with family support, passion, and belief in art.',
];

const valuesData = [
  {
    number: '01',
    title: 'Artisanal Excellence',
    description: 'Every piece is handcrafted by master artisans using techniques refined over centuries. We never compromise on craftsmanship.',
  },
  {
    number: '02',
    title: 'Ethical Sourcing',
    description: 'Our gemstones and precious materials are ethically sourced. We pay fair wages and support artisan communities directly.',
  },
  {
    number: '03',
    title: 'Timeless Design',
    description: 'We create designs that transcend trends — jewellery that looks as beautiful in twenty years as it does today.',
  },
];

export default function AboutPage() {
  return (
    <div className="w-full">
      {/* ============ HERO SECTION ============ */}
      <div 
        className="relative w-full h-screen bg-cover bg-center bg-no-repeat flex items-center justify-start"
        style={{
          backgroundImage: 'linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.4) 100%), url("https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1920&h=1080&fit=crop")',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="px-8 md:px-16 lg:px-24 max-w-2xl">
          <p className="text-xs md:text-sm tracking-[0.35em] uppercase text-[#b8963e] mb-6 font-semibold">Est. 2010, Rampur, UP</p>
          <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl text-white leading-tight">
            The Story of<br/>
            <span className="text-[#b8963e]">Gijayi</span>
          </h1>
        </div>
      </div>

      {/* ============ MISSION SECTION ============ */}
      <section className="w-full bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div>
              <p className="text-xs tracking-[0.35em] uppercase text-[#b8963e] mb-4 font-semibold">Our Mission</p>
              <h2 className="font-serif text-4xl md:text-5xl text-[#1a1a1a] mb-6 leading-tight">
                To keep India's jewellery heritage alive
              </h2>
              <p className="text-base text-gray-700 leading-relaxed mb-6">
                Gijayi was born from a passionate belief that India's extraordinary jewellery-making traditions deserve to be celebrated, preserved, and shared with the world. We work with artisan families across Rajasthan, Gujarat, and Bengal — communities where the art of kundan, meenakari, and filigree have been passed down through generations.
              </p>
              <p className="text-base text-gray-700 leading-relaxed">
                Every piece is more than jewellery — it is a wearable heirloom, a connection to centuries of craftsmanship, and a celebration of the artisans who make it possible.
              </p>
            </div>

            {/* Right Image - Taj Mahal */}
            <div className="relative h-96 md:h-96 rounded-lg overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&h=600&fit=crop" 
                alt="Taj Mahal, Agra - Symbol of India's Heritage"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ VALUES SECTION (DARK) ============ */}
      <section className="w-full bg-[#1a1a1a] py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          {/* Header */}
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.35em] uppercase text-[#b8963e] mb-4 font-semibold">What We Stand For</p>
            <h2 className="font-serif text-5xl md:text-6xl text-white mb-6">Our Values</h2>
            <div className="w-12 h-1 bg-[#b8963e] mx-auto"></div>
          </div>

          {/* Values Grid - 3 Columns */}
          <div className="grid md:grid-cols-3 gap-8">
            {valuesData.map((value) => (
              <div key={value.number} className="border border-[#333] p-8 hover:border-[#b8963e] transition ease-in-out duration-300">
                <p className="font-serif text-6xl text-[#b8963e] mb-4 leading-none">{value.number}</p>
                <h3 className="font-serif text-2xl text-white mb-4">{value.title}</h3>
                <p className="text-gray-400 leading-relaxed text-base">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PHILOSOPHY SECTION ============ */}
      <section className="w-full bg-white py-20 md:py-32">
        <div className="max-w-5xl mx-auto px-6 md:px-12 space-y-8">
          <div className="border-l-4 border-[#b8963e] bg-[#fcfbf8] p-8">
            <h2 className="font-serif text-3xl mb-4 text-[#1a1a1a]">Our Philosophy</h2>
            <p className="text-base text-gray-700 leading-relaxed">
              At Gijayi, we believe jewellery should carry feeling. It should reflect individuality, elegance, and the quiet joy of wearing something made with intention. Our creations are inspired by crystals, colour, craft, and the timeless beauty of handmade art.
            </p>
          </div>

          <div className="border-l-4 border-[#b8963e] bg-[#fcfbf8] p-8">
            <h2 className="font-serif text-3xl mb-4 text-[#1a1a1a]">What We Stand For</h2>
            <ul className="space-y-3">
              {standForPoints.map((point) => (
                <li key={point} className="flex items-start gap-3 text-base text-gray-700">
                  <span className="text-[#b8963e] text-xl font-bold mt-0.5 shrink-0">◆</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-l-4 border-[#b8963e] bg-[#fcfbf8] p-8">
            <h2 className="font-serif text-3xl mb-4 text-[#1a1a1a]">Our Promise</h2>
            <p className="text-base text-gray-700 leading-relaxed">
              Gijayi exists to bring a little more beauty into the world, one handcrafted piece at a time. We hope every design you choose feels special, soulful, and made to stay with you as more than just an accessory.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
