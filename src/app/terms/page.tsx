import { Shield, Package, RefreshCw, Clock, Video, Feather, Ban, Mail, Scale, CheckCircle } from 'lucide-react';

export const metadata = {
  title: 'Shopping Policy – Gijayi',
  description: 'Read Gijayi shopping, return, refund, and hygiene policy details.',
};

const sections = [
  {
    title: 'Shopping Policy',
    icon: Scale,
    content:
      'At Gijayi, every piece is handcrafted with care, intention, and attention to detail. Because our jewellery is delicate and designed to be worn close to the skin, we maintain a clear and thoughtful shopping policy to protect both product quality and customer trust.',
  },
  {
    title: 'Order Processing',
    icon: Package,
    content:
      'All orders are processed after payment confirmation. Since our pieces are handcrafted, processing time may vary depending on design, quantity, and order volume. Once your order is confirmed, you will receive an email or message with order details and shipping updates.',
  },
  {
    title: 'Shipping',
    icon: Clock,
    content:
      'We carefully pack every order to ensure it reaches you in excellent condition. Delivery timelines may vary by location and courier service. Once an order is dispatched, delays caused by shipping partners are outside our direct control.',
  },
  {
    title: 'Parcel Opening Video',
    icon: Video,
    content:
      'For damaged, missing, or incorrect item claims, a continuous parcel opening video is mandatory. The video must clearly show the unopened parcel, shipping label, full unboxing process, and item condition immediately after opening. Claims without this may not be eligible for review.',
  },
  {
    title: 'Hygiene Policy',
    icon: Shield,
    content:
      'For hygiene reasons, we do not accept returns for items that are worn, used, skin-touched, or altered in any way. Once hygiene is compromised, the piece is not eligible for return, exchange, or refund.',
  },
  {
    title: 'Return Eligibility',
    icon: RefreshCw,
    content:
      'Returns are considered only for wrong product delivery, transit damage, or clear manufacturing defects. To be reviewed, items must be unused, unworn, in original packaging with tags/inserts/accessories, and reported within 48 hours of delivery.',
  },
  {
    title: 'Refunds',
    icon: CheckCircle,
    content:
      'Refunds are processed only for approved claims involving wrong item delivery, transit damage, or verified manufacturing defects. After inspection and approval, refunds are issued to the original payment method within 5 to 7 business days.',
  },
  {
    title: 'Non-Returnable Items',
    icon: Ban,
    content:
      'The following are non-returnable: worn or skin-touched jewellery, items damaged due to misuse, custom/personalized pieces, sale items unless damaged/defective, and gift cards (if applicable).',
  },
  {
    title: 'How to Contact Us',
    icon: Mail,
    content:
      'If you receive a damaged, defective, or incorrect item, contact us within 48 hours with your order number, issue details, photos, and parcel opening video. Email: gijaayi@gmail.com. Website: gijayi.com.',
  },
  {
    title: 'Final Note',
    icon: Feather,
    content:
      'Please inspect the parcel carefully before trying jewellery directly against the skin. Once worn or skin-touched, we cannot accept it back due to hygiene standards and product integrity.',
  },
];

const trustElements = [
  { label: 'Secure Payments', desc: 'Razorpay verified' },
  { label: 'Handcrafted Quality', desc: 'Artisan certified' },
  { label: '48-Hour Returns', desc: 'Hassle-free process' },
  { label: 'Customer First', desc: 'Full transparency' },
];

export default function TermsPage() {
  return (
    <div className="bg-linear-to-b from-[#fcfbf8] to-white min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 md:py-20">
        <div className="text-center mb-14">
          <p className="text-xs tracking-[0.35em] uppercase text-[#b8963e] mb-3 font-semibold">Policy</p>
          <h1 className="font-serif text-4xl md:text-5xl mb-4 text-[#1a1a1a]">Shopping Policy</h1>
          <p className="max-w-2xl mx-auto text-sm text-gray-600">Complete transparency in every transaction</p>
        </div>

        {/* Trust Elements */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {trustElements.map(({ label, desc }) => (
            <div key={label} className="border border-[#efe6d7] bg-white p-4 rounded text-center">
              <p className="font-semibold text-xs text-[#b8963e] uppercase tracking-wide">{label}</p>
              <p className="text-xs text-gray-500 mt-1">{desc}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <section key={section.title} className="border border-[#efe6d7] bg-white p-6 md:p-8 hover:shadow-lg transition">
                <div className="flex items-start gap-4 mb-4">
                  <Icon className="w-6 h-6 text-[#b8963e] shrink-0 mt-1" />
                  <h2 className="font-serif text-xl text-[#1a1a1a]">{section.title}</h2>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{section.content}</p>
              </section>
            );
          })}
        </div>

        {/* Compliance Banner */}
        <div className="mt-12 border-l-4 border-[#b8963e] bg-[#fcfbf8] p-6 text-center">
          <p className="text-xs uppercase tracking-widest text-[#b8963e] font-semibold mb-2">✔ Certified Standards</p>
          <p className="text-sm text-gray-700">
            We comply with Indian consumer protection laws and maintain the highest standards of quality and transparency.
          </p>
        </div>
      </div>
    </div>
  );
}