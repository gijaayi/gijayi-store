import Link from 'next/link';

export const metadata = {
  title: 'Shipping and Returns – Gijayi',
  description: 'Read Gijayi shipping, dispatch, delivery, and returns information for domestic orders and made-to-order jewellery.',
};

const shippingBlocks = [
  {
    title: 'Dispatch Timelines',
    points: ['Ready-to-ship products leave our studio within 2 to 3 business days.', 'Bridal and made-to-order styles may require 10 to 21 business days.', 'Peak festive and wedding periods can add 2 to 4 business days to handling.'],
  },
  {
    title: 'Delivery',
    points: ['We ship across India using insured delivery partners.', 'Orders above ₹5,000 qualify for complimentary standard shipping.', 'Tracking details are shared by email and WhatsApp once your order is packed.'],
  },
  {
    title: 'Returns',
    points: ['Eligible ready-to-ship items can be returned within 15 days of delivery.', 'Products must be unworn, unused, and sent back in their original packaging.', 'Custom, altered, or personalised pieces cannot be returned unless they arrive damaged or incorrect.'],
  },
];

export default function ShippingPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 md:py-20">
      <div className="mb-14 text-center">
        <p className="text-xs tracking-[0.35em] uppercase text-[#b8963e] mb-3">Policies</p>
        <h1 className="font-serif text-4xl md:text-5xl">Shipping and Returns</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {shippingBlocks.map((block) => (
          <section key={block.title} className="border border-[#efe6d7] p-6 bg-[#fcfbf8]">
            <h2 className="font-serif text-2xl mb-4">{block.title}</h2>
            <ul className="space-y-3">
              {block.points.map((point) => (
                <li key={point} className="text-sm text-gray-600 leading-relaxed">{point}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section className="mt-10 border border-[#efe6d7] p-6 md:p-8">
        <h2 className="font-serif text-3xl mb-4">Need an exchange or return?</h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-6">
          Email hello@gijayi.com with your order number, reason for return, and unboxing photos if applicable. Our team will confirm eligibility and next steps.
        </p>
        <Link href="/contact" className="inline-flex items-center text-xs tracking-widest uppercase text-[#b8963e] hover:text-[#1a1a1a]">
          Start a return request
        </Link>
      </section>
    </div>
  );
}