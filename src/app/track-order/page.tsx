'use client';

import { useState } from 'react';
import { PackageCheck, Truck, ShoppingBag, Sparkles } from 'lucide-react';

interface TrackedOrder {
  orderCode: string;
  status: string;
  eta: string;
  timeline: { label: string; time: string }[];
  updatedAt: string;
}

export default function TrackOrderPage() {
  const [orderCode, setOrderCode] = useState('');
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasLookup, setHasLookup] = useState(false);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 md:py-20">
      <div className="text-center mb-12">
        <p className="text-xs tracking-[0.35em] uppercase text-[#b8963e] mb-3">Order Support</p>
        <h1 className="font-serif text-4xl md:text-5xl">Track Your Order</h1>
        <p className="max-w-2xl mx-auto mt-5 text-sm text-gray-600 leading-relaxed">
          Enter your order number to see the latest dispatch and delivery updates.
        </p>
      </div>

      <div className="border border-[#efe6d7] bg-[#fcfbf8] p-6 md:p-8 mb-8">
        <form
          className="grid gap-4 md:grid-cols-[1fr_auto]"
          onSubmit={async (event) => {
            event.preventDefault();
            setLoading(true);
            setHasLookup(true);
            setError('');

            const response = await fetch(`/api/track-order/${orderCode.trim().toUpperCase()}`, {
              cache: 'no-store',
            });

            const data = (await response.json()) as { order?: TrackedOrder; error?: string };

            if (!response.ok || !data.order) {
              setOrder(null);
              setError(data.error || 'Order not found.');
              setLoading(false);
              return;
            }

            setOrder(data.order);
            setLoading(false);
          }}
        >
          <input
            value={orderCode}
            onChange={(event) => setOrderCode(event.target.value)}
            placeholder="Enter order number"
            className="border border-[#e5ddcf] bg-white px-4 py-4 text-sm outline-none focus:border-[#b8963e]"
          />
          <button type="submit" disabled={loading} className="bg-[#1a1a1a] px-8 py-4 text-white text-xs tracking-widest uppercase hover:bg-[#b8963e] transition-colors disabled:opacity-50">
            {loading ? 'Tracking...' : 'Track Order'}
          </button>
        </form>
      </div>

      {!hasLookup && (
        <div className="grid gap-4 md:grid-cols-4">
          {[ShoppingBag, Sparkles, PackageCheck, Truck].map((Icon, index) => (
            <div key={index} className="border border-[#efe6d7] p-5 text-center">
              <Icon size={20} className="mx-auto text-[#b8963e] mb-3" />
              <p className="text-sm text-gray-600">Every order passes through confirmation, finishing, packaging, and insured delivery.</p>
            </div>
          ))}
        </div>
      )}

      {hasLookup && !order && !loading && (
        <div className="border border-[#efe6d7] p-6 md:p-8 text-center">
          <h2 className="font-serif text-3xl mb-3">We couldn’t find that order</h2>
          <p className="text-sm text-gray-600">{error || 'Please verify the code from your confirmation email or contact our support team.'}</p>
        </div>
      )}

      {order && (
        <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-6">
          <section className="border border-[#efe6d7] bg-[#1a1a1a] text-white p-6 md:p-8">
            <p className="text-xs tracking-[0.35em] uppercase text-[#d4af64] mb-3">Current Status</p>
            <h2 className="font-serif text-3xl mb-3">{order.status}</h2>
            <p className="text-sm text-white/75">{order.eta}</p>
          </section>
          <section className="border border-[#efe6d7] bg-[#fcfbf8] p-6 md:p-8">
            <p className="text-xs tracking-[0.35em] uppercase text-[#b8963e] mb-4">Journey</p>
            <div className="space-y-5">
              {order.timeline.map((entry, index) => (
                <div key={`${entry.label}-${entry.time}`} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className="w-8 h-8 rounded-full bg-[#1a1a1a] text-white text-xs flex items-center justify-center">{index + 1}</span>
                    {index < order.timeline.length - 1 && <span className="w-px flex-1 bg-[#d8c8a1] mt-2" />}
                  </div>
                  <div className="pb-3">
                    <p className="text-sm font-medium">{entry.label}</p>
                    <p className="text-sm text-gray-500 mt-1">{entry.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}