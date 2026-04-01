import Link from 'next/link';
import { Truck, Package as PackageIcon, RotateCcw, Sparkles, HelpCircle } from 'lucide-react';

export const metadata = {
  title: 'FAQ | Gijayi Jewelry – Shipping, Returns, Care & Customization',
  description: 'Find answers to frequently asked questions about Gijayi jewelry orders, shipping, customizations, care instructions, and returns policy.',
  keywords: 'FAQ, frequently asked questions, jewelry shipping, returns policy, jewelry care, custom orders, jewelry customization',
  openGraph: {
    title: 'Gijayi Jewelry FAQ – Orders, Shipping & Care',
    description: 'Get answers to common questions about ordering, shipping, care, and customization of handcrafted Indian jewelry from Gijayi.',
  },
};

const faqSections = [
  {
    title: 'Orders and Delivery',
    icon: Truck,
    items: [
      ['How long will my order take?', 'Orders are processed after payment confirmation. Since pieces are handmade, processing and delivery timelines may vary based on design complexity, order volume, and location.'],
      ['Do you ship across India?', 'Yes. We ship across India with trusted delivery partners.'],
      ['Can I track my order?', 'Yes. Once your parcel ships, you will receive a tracking link by email and WhatsApp. You can also use our order tracking page.'],
    ],
  },
  {
    title: 'Products and Customisation',
    icon: PackageIcon,
    items: [
      ['Are your products handcrafted?', 'Yes. Every Gijayi piece is handcrafted by artisan partners using traditional Indian jewellery-making techniques.'],
      ['Can I request customisation?', 'Yes. We support selected customisations for bridal orders, gifting, finishes, and some sizing requests. Contact our concierge to discuss options.'],
      ['Will my product look exactly like the pictures?', 'We aim for close accuracy. Because many pieces are handmade, small natural variations in stone placement, polish, or enamel are normal.'],
    ],
  },
  {
    title: 'Returns and Care',
    icon: RotateCcw,
    items: [
      ['What is your return policy?', 'Returns are considered only for wrong product delivery, transit damage, or verified manufacturing defects. Items must be unused, unworn, in original packaging, and reported within 48 hours of delivery.'],
      ['Is parcel opening video required for claims?', 'Yes. A continuous parcel opening video is mandatory for damaged, missing, or incorrect item claims.'],
      ['How should I store my jewellery?', 'Store each piece separately in a soft pouch, avoid humidity, and keep away from perfume, hair spray, and lotions.'],
      ['Do you offer repairs?', 'Yes. We can assist with polishing, restringing, clasp replacement, and other repairs for eligible pieces. Reach out with your order number and photos.'],
    ],
  },
];

const faqHighlights = [
  { label: '24/7 Self-Help', desc: 'Find answers instantly' },
  { label: 'Expert Support', desc: 'Direct assistance available' },
  { label: 'Transparent Policies', desc: 'No hidden terms' },
  { label: 'Satisfaction Guarantee', desc: 'Customer first always' },
];

export default function FaqPage() {
  return (
    <div className="bg-linear-to-b from-[#fcfbf8] to-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-20">
        <div className="text-center mb-14">
          <p className="text-xs tracking-[0.35em] uppercase text-[#b8963e] mb-3 font-semibold">Customer Help</p>
          <h1 className="font-serif text-4xl md:text-5xl text-[#1a1a1a] mb-4">Frequently Asked Questions</h1>
          <p className="max-w-2xl mx-auto mt-5 text-sm text-gray-600 leading-relaxed">
            The quickest answers for ordering, sizing, dispatch timelines, care, and custom requests.
          </p>
        </div>

        {/* FAQ Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {faqHighlights.map(({ label, desc }) => (
            <div key={label} className="border border-[#efe6d7] bg-white p-4 text-center rounded">
              <p className="text-xs uppercase tracking-widest text-[#b8963e] font-semibold mb-1">{label}</p>
              <p className="text-xs text-gray-600">{desc}</p>
            </div>
          ))}
        </div>

        {/* FAQ Sections */}
        <div className="space-y-10 mb-12">
          {faqSections.map((section) => {
            const Icon = section.icon;
            return (
              <section key={section.title} className="border border-[#efe6d7] bg-white p-6 md:p-8 rounded-lg">
                <div className="flex items-center gap-3 mb-6">
                  <Icon className="w-6 h-6 text-[#b8963e] shrink-0" />
                  <h2 className="font-serif text-2xl md:text-3xl text-[#1a1a1a]">{section.title}</h2>
                </div>
                <div className="space-y-6">
                  {section.items.map(([question, answer], idx) => (
                    <div key={question} className={`pb-6 ${idx !== section.items.length - 1 ? 'border-b border-[#efe6d7]' : ''}`}>
                      <div className="flex items-start gap-3 mb-3">
                        <HelpCircle className="w-4 h-4 text-[#b8963e] shrink-0 mt-1" />
                        <h3 className="text-sm font-semibold text-[#1a1a1a]">{question}</h3>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed ml-7">{answer}</p>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* Contact Support */}
        <div className="border border-[#efe6d7] bg-[#fcfbf8] p-8 rounded-lg text-center">
          <p className="text-xs uppercase tracking-widest text-[#b8963e] font-semibold mb-3">📞 Still Need Help?</p>
          <p className="text-gray-700 mb-6">
            Can't find your answer? Our concierge team is here to assist with any questions about orders, customization, or care.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/contact" className="inline-flex items-center justify-center bg-[#b8963e] text-white px-8 py-2 rounded text-sm font-semibold hover:bg-[#a37f35] transition">
              Contact Concierge
            </Link>
            <a href="mailto:gijaayi@gmail.com" className="inline-flex items-center justify-center border border-[#b8963e] text-[#b8963e] px-8 py-2 rounded text-sm font-semibold hover:bg-[#b8963e]/10 transition">
              Email Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}