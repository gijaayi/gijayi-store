import Link from 'next/link';

export const metadata = {
  title: 'FAQ – Gijayi',
  description: 'Frequently asked questions about Gijayi orders, shipping, customisations, jewellery care, and returns.',
};

const faqSections = [
  {
    title: 'Orders and Delivery',
    items: [
      ['How long will my order take?', 'Ready-to-ship pieces are dispatched within 2 to 3 business days. Bridal and made-to-order styles typically take 10 to 21 business days depending on complexity.'],
      ['Do you ship across India?', 'Yes. We offer complimentary domestic shipping on orders above ₹5,000 and insured delivery across India.'],
      ['Can I track my order?', 'Yes. Once your parcel ships, you will receive a tracking link by email and WhatsApp. You can also use our order tracking page.'],
    ],
  },
  {
    title: 'Products and Customisation',
    items: [
      ['Are your products handcrafted?', 'Yes. Every Gijayi piece is handcrafted by artisan partners using traditional Indian jewellery-making techniques.'],
      ['Can I request customisation?', 'Yes. We support selected customisations for bridal orders, gifting, finishes, and some sizing requests. Contact our concierge to discuss options.'],
      ['Will my product look exactly like the pictures?', 'We aim for close accuracy. Because many pieces are handmade, small natural variations in stone placement, polish, or enamel are normal.'],
    ],
  },
  {
    title: 'Returns and Care',
    items: [
      ['What is your return policy?', 'Eligible ready-to-ship items can be returned within 15 days of delivery if unworn and in original packaging. Custom and personalised orders are final sale.'],
      ['How should I store my jewellery?', 'Store each piece separately in a soft pouch, avoid humidity, and keep away from perfume, hair spray, and lotions.'],
      ['Do you offer repairs?', 'Yes. We can assist with polishing, restringing, clasp replacement, and other repairs for eligible pieces. Reach out with your order number and photos.'],
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 md:py-20">
      <div className="text-center mb-14">
        <p className="text-xs tracking-[0.35em] uppercase text-[#b8963e] mb-3">Customer Help</p>
        <h1 className="font-serif text-4xl md:text-5xl">Frequently Asked Questions</h1>
        <p className="max-w-2xl mx-auto mt-5 text-sm text-gray-600 leading-relaxed">
          The quickest answers for ordering, sizing, dispatch timelines, care, and custom requests.
        </p>
      </div>

      <div className="space-y-10">
        {faqSections.map((section) => (
          <section key={section.title} className="border border-[#efe6d7] bg-[#fcfbf8] p-6 md:p-8">
            <h2 className="font-serif text-2xl md:text-3xl mb-6">{section.title}</h2>
            <div className="space-y-5">
              {section.items.map(([question, answer]) => (
                <div key={question} className="border-t border-[#e6dfd2] pt-5 first:border-t-0 first:pt-0">
                  <h3 className="text-sm tracking-wide font-medium mb-2">{question}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{answer}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-12 text-center text-sm text-gray-600">
        Still need help? <Link href="/contact" className="text-[#b8963e] hover:text-[#1a1a1a]">Contact our concierge.</Link>
      </div>
    </div>
  );
}