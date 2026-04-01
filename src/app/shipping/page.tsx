import Link from 'next/link';
import { Truck, Package, AlertCircle, MapPin, Clock, CheckCircle, Shield } from 'lucide-react';

export const metadata = {
  title: 'Shipping & Delivery Policy – Gijayi',
  description: 'Read Gijayi shipping and delivery timelines, parcel claim process, delays, and address policy.',
};

const shippingBlocks = [
  {
    title: 'Shipping & Delivery Policy',
    icon: Truck,
    points: [
      'At Gijayi, every order is packed with care and attention to detail.',
      'As our jewellery is handcrafted and delicate, each parcel is prepared thoughtfully to reach you in excellent condition.',
    ],
  },
  {
    title: 'Order Processing',
    icon: Package,
    points: [
      'All orders are processed after payment confirmation.',
      'Since our pieces are handmade, processing time may vary based on design and order volume.',
      'Once confirmed, you receive order status and dispatch updates.',
    ],
  },
  {
    title: 'Shipping Time',
    icon: Clock,
    points: [
      'We aim to dispatch orders as soon as possible after processing.',
      'Delivery timelines vary by location, courier service, and external factors.',
      'Handmade products may occasionally need extra preparation time for quality and finish.',
    ],
  },
  {
    title: 'Delivery',
    icon: CheckCircle,
    points: [
      'We work with trusted delivery partners for safe and secure shipping.',
      'Once dispatched, timelines are handled by the carrier.',
      'Delays caused by weather, holidays, strikes, or unforeseen events are outside our direct control.',
    ],
  },
  {
    title: 'Parcel Condition',
    icon: Shield,
    points: [
      'If your parcel appears damaged, tampered with, or incomplete, refuse acceptance where appropriate and contact us immediately.',
      'A continuous parcel opening video is mandatory for damaged, missing, or incorrect item claims.',
      'Video must show unopened parcel, shipping label, complete unboxing, and item condition after opening.',
    ],
  },
  {
    title: 'Delays',
    icon: AlertCircle,
    points: [
      'Delays may occur due to high order volume, remote delivery locations, public holidays, courier delays, weather, or operational issues.',
      'We appreciate your patience and will always support order tracking.',
    ],
  },
  {
    title: 'Address Accuracy',
    icon: MapPin,
    points: [
      'Please ensure your shipping address, mobile number, and email are correct at checkout.',
      'Gijayi is not responsible for delays or failed delivery caused by incorrect/incomplete address details.',
    ],
  },
];

const shippingPartners = [
  'Trusted National Couriers',
  'Express & Standard Options',
  'Real-time Tracking',
  'Secure Packaging',
];

export default function ShippingPage() {
  return (
    <div className="bg-linear-to-b from-[#fcfbf8] to-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-20">
        <div className="mb-14 text-center">
          <p className="text-xs tracking-[0.35em] uppercase text-[#b8963e] mb-3 font-semibold">Policies</p>
          <h1 className="font-serif text-4xl md:text-5xl mb-4 text-[#1a1a1a]">Shipping & Delivery Policy</h1>
          <p className="max-w-2xl mx-auto text-sm text-gray-600">Fast, reliable, and transparent delivery across India</p>
        </div>

        {/* Shipping Partners Section */}
        <div className="mb-14 grid grid-cols-2 md:grid-cols-4 gap-4">
          {shippingPartners.map((partner) => (
            <div key={partner} className="border border-[#efe6d7] bg-white p-4 text-center rounded">
              <div className="text-[#b8963e] text-2xl mb-2">📦</div>
              <p className="text-sm font-semibold text-[#1a1a1a]">{partner}</p>
            </div>
          ))}
        </div>

        {/* Policy Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
          {shippingBlocks.map((block) => {
            const Icon = block.icon;
            return (
              <section key={block.title} className="border border-[#efe6d7] bg-white p-6 rounded-lg hover:shadow-lg transition">
                <div className="flex items-center gap-3 mb-4">
                  <Icon className="w-6 h-6 text-[#b8963e] shrink-0" />
                  <h2 className="font-serif text-lg text-[#1a1a1a]">{block.title}</h2>
                </div>
                <ul className="space-y-3">
                  {block.points.map((point) => (
                    <li key={point} className="text-sm text-gray-700 leading-relaxed flex gap-2">
                      <span className="text-[#b8963e] text-lg leading-tight">◆</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>

        {/* Trust Banner */}
        <div className="border-l-4 border-[#b8963e] bg-[#fcfbf8] p-6 md:p-8 rounded">
          <div className="flex items-start gap-4">
            <Shield className="w-6 h-6 text-[#b8963e] shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-[#1a1a1a] mb-2">📍 Safe & Secure Shipping</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Every package is carefully inspected, securely packed, and tracked for your peace of mind. We prioritize the safety of your precious jewellery at every stage.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-12 text-center border border-[#efe6d7] bg-white p-8 rounded">
          <p className="text-xs uppercase tracking-widest text-[#b8963e] font-semibold mb-2">Have questions?</p>
          <p className="text-gray-700 mb-4">Contact us for shipping details, tracking, or delivery concerns</p>
          <a href="/contact" className="inline-block bg-[#b8963e] text-white px-8 py-2 rounded text-sm font-semibold hover:bg-[#a37f35] transition">
            Get in Touch
          </a>
        </div>
      </div>
    </div>
  );
}