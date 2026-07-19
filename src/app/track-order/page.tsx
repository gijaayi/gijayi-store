"use client";

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PackageCheck, Truck, ShoppingBag, Sparkles } from 'lucide-react';

interface TrackedOrder {
  orderCode: string;
  status: string;
  eta: string;
  timeline: { label: string; time: string }[];
  updatedAt: string;
  items?: Array<{ name: string; quantity: number; price: number; image?: string }>;
  shipment?: {
    shipmentStatus?: string;
    trackingNumber?: string;
    courierName?: string;
    trackingUrl?: string;
    estimatedDelivery?: string;
    currentLocation?: string;
    lastTrackingUpdate?: string;
    shipmentHistory?: Array<{ status: string; location?: string; activity?: string; time: string }>;
  } | null;
}

const CUSTOMER_STEPS = [
  'Order Placed',
  'Confirmed',
  'Packed',
  'Picked Up',
  'In Transit',
  'Out For Delivery',
  'Delivered',
] as const;

function statusStepIndex(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes('deliver')) return CUSTOMER_STEPS.indexOf('Delivered');
  if (normalized.includes('out for delivery')) return CUSTOMER_STEPS.indexOf('Out For Delivery');
  if (normalized.includes('transit') || normalized.includes('shipped')) return CUSTOMER_STEPS.indexOf('In Transit');
  if (normalized.includes('picked')) return CUSTOMER_STEPS.indexOf('Picked Up');
  if (normalized.includes('pack') || normalized.includes('preparing')) return CUSTOMER_STEPS.indexOf('Packed');
  if (normalized.includes('confirm')) return CUSTOMER_STEPS.indexOf('Confirmed');
  return 0;
}

function TrackOrderPageContent() {
  const searchParams = useSearchParams();
  const [orderCode, setOrderCode] = useState('');
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasLookup, setHasLookup] = useState(false);

  async function handleLookup(code: string) {
    const normalizedCode = code.trim().toUpperCase();
    if (!normalizedCode) return;

    setLoading(true);
    setHasLookup(true);
    setError('');

    const response = await fetch(`/api/track-order/${normalizedCode}`, {
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
  }

  useEffect(() => {
    const code = searchParams?.get('code');
    if (!code) return;

    setOrderCode(code);
    void handleLookup(code);
  }, [searchParams]);

  // Light auto-refresh while viewing an active shipment
  useEffect(() => {
    if (!order?.orderCode) return;
    if (['Delivered', 'Cancelled', 'Returned'].includes(order.status)) return;

    const timer = setInterval(() => {
      void handleLookup(order.orderCode);
    }, 60_000);

    return () => clearInterval(timer);
  }, [order?.orderCode, order?.status]);

  const activeStep = order ? statusStepIndex(order.shipment?.shipmentStatus || order.status) : 0;

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
            await handleLookup(orderCode);
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
          {[
            {
              Icon: ShoppingBag,
              text: 'You can find your order number in your confirmation email or WhatsApp update',
            },
            {
              Icon: Sparkles,
              text: 'Tracking details may take 24–48 hours to appear after dispatch',
            },
            {
              Icon: PackageCheck,
              text: 'For custom or made-to-order pieces, timelines may be slightly longer',
            },
            {
              Icon: Truck,
              text: 'Dispatch within 48 hours',
            },
          ].map(({ Icon, text }, index) => (
            <div key={index} className="border border-[#efe6d7] p-5 text-center">
              <Icon size={20} className="mx-auto text-[#b8963e] mb-3" />
              <p className="text-sm text-gray-600">{text}</p>
            </div>
          ))}
        </div>
      )}

      {!hasLookup && (
        <div className="mt-6 text-sm text-gray-700">
          <p>
            Every Gijayi order moves through careful confirmation, finishing, packaging, and insured delivery. For made-to-order or
            customized jewellery, processing timelines may vary slightly.
          </p>
          <p className="mt-3">
            Need help? <a href="https://wa.me/917310580050?text=Hi%20Gijayi%2C%20I%20need%20help%20with%20my%20order." className="text-[#25D366]">Contact us on WhatsApp</a> or visit our{' '}
            <Link href="/contact" className="underline">Contact page</Link>.
          </p>
        </div>
      )}

      {hasLookup && !order && !loading && (
        <div className="border border-[#efe6d7] p-6 md:p-8 text-center">
          <h2 className="font-serif text-3xl mb-3">We couldn’t find that order</h2>
          <p className="text-sm text-gray-600">{error || 'Please verify the code from your confirmation email or contact our support team.'}</p>
        </div>
      )}

      {order && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-6">
            <section className="border border-[#efe6d7] bg-[#1a1a1a] text-white p-6 md:p-8">
              <p className="text-xs tracking-[0.35em] uppercase text-[#d4af64] mb-3">Current Status</p>
              <h2 className="font-serif text-3xl mb-3">{order.status}</h2>
              <p className="text-sm text-white/75 mb-4">{order.eta}</p>
              {order.shipment?.courierName && (
                <p className="text-sm text-white/80">Courier: {order.shipment.courierName}</p>
              )}
              {order.shipment?.trackingNumber && (
                <p className="text-sm text-white/80 mt-1">Tracking: {order.shipment.trackingNumber}</p>
              )}
              {order.shipment?.currentLocation && (
                <p className="text-sm text-white/80 mt-1">Location: {order.shipment.currentLocation}</p>
              )}
              {order.shipment?.lastTrackingUpdate && (
                <p className="text-xs text-white/50 mt-3">
                  Last updated: {new Date(order.shipment.lastTrackingUpdate).toLocaleString('en-IN')}
                </p>
              )}
              {order.shipment?.trackingUrl && (
                <a
                  href={order.shipment.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-5 text-xs tracking-widest uppercase text-[#d4af64] border border-[#d4af64] px-4 py-2 hover:bg-[#d4af64] hover:text-[#1a1a1a] transition-colors"
                >
                  Open Courier Tracking
                </a>
              )}
            </section>

            <section className="border border-[#efe6d7] bg-[#fcfbf8] p-6 md:p-8">
              <p className="text-xs tracking-[0.35em] uppercase text-[#b8963e] mb-4">Shipping Timeline</p>
              <div className="space-y-4">
                {CUSTOMER_STEPS.map((step, index) => {
                  const done = index <= activeStep;
                  return (
                    <div key={step} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <span
                          className={`w-8 h-8 rounded-full text-xs flex items-center justify-center ${
                            done ? 'bg-[#1a1a1a] text-white' : 'bg-[#e8dfc8] text-[#8a7a5a]'
                          }`}
                        >
                          {index + 1}
                        </span>
                        {index < CUSTOMER_STEPS.length - 1 && (
                          <span className={`w-px flex-1 mt-2 ${done ? 'bg-[#d8c8a1]' : 'bg-[#efe6d7]'}`} />
                        )}
                      </div>
                      <div className="pb-2">
                        <p className={`text-sm font-medium ${done ? 'text-[#1a1a1a]' : 'text-gray-400'}`}>{step}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {!!order.items?.length && (
            <section className="border border-[#efe6d7] bg-white p-6 md:p-8">
              <p className="text-xs tracking-[0.35em] uppercase text-[#b8963e] mb-4">Products</p>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={`${item.name}-${item.quantity}`} className="flex justify-between text-sm text-gray-700">
                    <span>
                      {item.quantity}× {item.name}
                    </span>
                    <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="border border-[#efe6d7] bg-[#fcfbf8] p-6 md:p-8">
            <p className="text-xs tracking-[0.35em] uppercase text-[#b8963e] mb-4">Activity Log</p>
            <div className="space-y-5">
              {(order.shipment?.shipmentHistory?.length
                ? order.shipment.shipmentHistory.map((entry) => ({
                    label: entry.activity || entry.status,
                    time: entry.time,
                    meta: entry.location,
                  }))
                : order.timeline.map((entry) => ({
                    label: entry.label,
                    time: entry.time,
                    meta: undefined as string | undefined,
                  }))
              ).map((entry, index, list) => (
                <div key={`${entry.label}-${entry.time}-${index}`} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className="w-8 h-8 rounded-full bg-[#1a1a1a] text-white text-xs flex items-center justify-center">
                      {index + 1}
                    </span>
                    {index < list.length - 1 && <span className="w-px flex-1 bg-[#d8c8a1] mt-2" />}
                  </div>
                  <div className="pb-3">
                    <p className="text-sm font-medium">{entry.label}</p>
                    {entry.meta && <p className="text-xs text-gray-500 mt-1">{entry.meta}</p>}
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

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center text-sm text-gray-500">Loading order tracking...</div>}>
      <TrackOrderPageContent />
    </Suspense>
  );
}
