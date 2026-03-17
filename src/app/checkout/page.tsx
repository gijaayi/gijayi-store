'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle, Shield, Truck } from 'lucide-react';

type Step = 'shipping' | 'payment' | 'review';

export default function CheckoutPage() {
  const { state, totalPrice, clearCart } = useCart();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<Step>('shipping');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderCode, setOrderCode] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState('');

  const [shipping, setShipping] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', state: '', pincode: '', country: 'India',
  });

  const [payment, setPayment] = useState({ method: 'upi', upiId: '', cardNumber: '', cardExpiry: '', cardCvv: '' });

  const shippingCost = totalPrice >= 5000 ? 0 : 250;
  const total = totalPrice + shippingCost;

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login?redirect=/checkout');
    }
  }, [loading, user, router]);

  const handlePlaceOrder = async () => {
    setPlacingOrder(true);
    setError('');

    const payload = {
      items: state.items.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        size: item.size,
        image: item.product.images[0],
      })),
      shipping,
      paymentMethod: payment.method,
    };

    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as { error?: string; orderCode?: string };
    if (!response.ok) {
      setError(data.error || 'Unable to place order.');
      setPlacingOrder(false);
      return;
    }

    setOrderCode(data.orderCode || '');
    setOrderPlaced(true);
    clearCart();
    setPlacingOrder(false);
  };

  if (loading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-sm text-gray-500">
        Checking your account...
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 py-20">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
          <CheckCircle size={72} className="text-[#b8963e] mx-auto mb-6" />
          <h2 className="font-serif text-4xl mb-3">Order Placed!</h2>
          <p className="text-sm text-gray-600 max-w-md mb-2">
            Thank you for shopping with Gijayi. Your order has been confirmed and will be dispatched within 2–3 business days.
          </p>
          {orderCode && <p className="text-xs text-[#b8963e] mb-2 tracking-widest uppercase">Order ID: {orderCode}</p>}
          <p className="text-xs text-gray-400 mb-10">A confirmation email has been sent to {shipping.email}</p>
          <Link href="/shop" className="bg-[#1a1a1a] text-white px-10 py-4 text-xs tracking-widest uppercase hover:bg-[#b8963e] transition-colors">
            Continue Shopping
          </Link>
        </motion.div>
      </div>
    );
  }

  if (state.items.length === 0) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-6">
        <h2 className="font-serif text-3xl mb-4">Nothing to checkout</h2>
        <Link href="/shop" className="text-[#b8963e] text-xs tracking-widest uppercase underline">Go to Shop</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="font-serif text-4xl">Checkout</h1>
        {/* Steps */}
        <div className="flex items-center justify-center gap-4 mt-6">
          {(['shipping', 'payment', 'review'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-4">
              <div className={`flex items-center gap-2 text-xs tracking-widest uppercase ${step === s ? 'text-[#1a1a1a] font-medium' : step > s ? 'text-[#b8963e]' : 'text-gray-300'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] border ${step === s ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white' : step > s ? 'border-[#b8963e] bg-[#b8963e] text-white' : 'border-gray-200'}`}>
                  {i + 1}
                </div>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </div>
              {i < 2 && <div className="w-8 h-px bg-gray-200" />}
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Form */}
        <div className="lg:col-span-2">
          {step === 'shipping' && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="font-serif text-2xl mb-6">Shipping Information</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {(['firstName', 'lastName'] as const).map((f) => (
                    <div key={f}>
                      <label className="block text-xs tracking-widest uppercase mb-1.5">{f === 'firstName' ? 'First Name' : 'Last Name'} *</label>
                      <input required value={shipping[f]} onChange={(e) => setShipping({ ...shipping, [f]: e.target.value })} className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#b8963e]" />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs tracking-widest uppercase mb-1.5">Email *</label>
                    <input required type="email" value={shipping.email} onChange={(e) => setShipping({ ...shipping, email: e.target.value })} className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#b8963e]" />
                  </div>
                  <div>
                    <label className="block text-xs tracking-widest uppercase mb-1.5">Phone *</label>
                    <input required type="tel" value={shipping.phone} onChange={(e) => setShipping({ ...shipping, phone: e.target.value })} className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#b8963e]" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase mb-1.5">Address *</label>
                  <input required value={shipping.address} onChange={(e) => setShipping({ ...shipping, address: e.target.value })} className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#b8963e]" placeholder="Street address, apartment, suite" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs tracking-widest uppercase mb-1.5">City *</label>
                    <input required value={shipping.city} onChange={(e) => setShipping({ ...shipping, city: e.target.value })} className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#b8963e]" />
                  </div>
                  <div>
                    <label className="block text-xs tracking-widest uppercase mb-1.5">State *</label>
                    <input required value={shipping.state} onChange={(e) => setShipping({ ...shipping, state: e.target.value })} className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#b8963e]" />
                  </div>
                  <div>
                    <label className="block text-xs tracking-widest uppercase mb-1.5">Pincode *</label>
                    <input required value={shipping.pincode} onChange={(e) => setShipping({ ...shipping, pincode: e.target.value })} className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#b8963e]" maxLength={6} />
                  </div>
                </div>
                <button
                  onClick={() => setStep('payment')}
                  disabled={!shipping.firstName || !shipping.email || !shipping.address || !shipping.city || !shipping.pincode}
                  className="w-full bg-[#1a1a1a] text-white py-4 text-xs tracking-widest uppercase hover:bg-[#b8963e] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continue to Payment
                </button>
              </div>
            </motion.div>
          )}

          {step === 'payment' && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="font-serif text-2xl mb-6">Payment Method</h2>
              <div className="space-y-3 mb-6">
                {[
                  { id: 'upi', label: 'UPI / Google Pay / PhonePe' },
                  { id: 'card', label: 'Credit / Debit Card' },
                  { id: 'netbanking', label: 'Net Banking' },
                  { id: 'cod', label: 'Cash on Delivery' },
                ].map((m) => (
                  <label key={m.id} className={`flex items-center gap-4 p-4 border cursor-pointer transition-colors ${payment.method === m.id ? 'border-[#b8963e] bg-[#faf8f4]' : 'border-gray-200'}`}>
                    <input type="radio" name="payment" value={m.id} checked={payment.method === m.id} onChange={() => setPayment({ ...payment, method: m.id })} className="accent-[#b8963e]" />
                    <span className="text-sm">{m.label}</span>
                  </label>
                ))}
              </div>

              {payment.method === 'upi' && (
                <div className="mb-6">
                  <label className="block text-xs tracking-widest uppercase mb-1.5">UPI ID</label>
                  <input value={payment.upiId} onChange={(e) => setPayment({ ...payment, upiId: e.target.value })} placeholder="yourname@upi" className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#b8963e]" />
                </div>
              )}

              {payment.method === 'card' && (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-xs tracking-widest uppercase mb-1.5">Card Number</label>
                    <input value={payment.cardNumber} onChange={(e) => setPayment({ ...payment, cardNumber: e.target.value })} placeholder="0000 0000 0000 0000" maxLength={19} className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#b8963e]" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs tracking-widest uppercase mb-1.5">Expiry</label>
                      <input value={payment.cardExpiry} onChange={(e) => setPayment({ ...payment, cardExpiry: e.target.value })} placeholder="MM/YY" maxLength={5} className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#b8963e]" />
                    </div>
                    <div>
                      <label className="block text-xs tracking-widest uppercase mb-1.5">CVV</label>
                      <input type="password" value={payment.cardCvv} onChange={(e) => setPayment({ ...payment, cardCvv: e.target.value })} placeholder="•••" maxLength={4} className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#b8963e]" />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button onClick={() => setStep('shipping')} className="flex-1 border border-gray-200 py-4 text-xs tracking-widest uppercase hover:border-[#b8963e] transition-colors">
                  Back
                </button>
                <button onClick={() => setStep('review')} className="flex-1 bg-[#1a1a1a] text-white py-4 text-xs tracking-widest uppercase hover:bg-[#b8963e] transition-colors">
                  Review Order
                </button>
              </div>
            </motion.div>
          )}

          {step === 'review' && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="font-serif text-2xl mb-6">Review Your Order</h2>
              <div className="bg-[#faf8f4] p-6 mb-6">
                <h3 className="text-xs tracking-widest uppercase font-medium mb-4">Shipping to</h3>
                <p className="text-sm text-gray-600">{shipping.firstName} {shipping.lastName}</p>
                <p className="text-sm text-gray-600">{shipping.address}</p>
                <p className="text-sm text-gray-600">{shipping.city}, {shipping.state} – {shipping.pincode}</p>
                <p className="text-sm text-gray-600">{shipping.phone} · {shipping.email}</p>
              </div>
              <div className="space-y-4 mb-8">
                {state.items.map((item, i) => (
                  <div key={i} className="flex gap-4 items-center">
                    <div className="relative w-14 h-16 flex-shrink-0 bg-[#faf8f4]">
                      <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.product.name}</p>
                      {item.size && <p className="text-xs text-gray-400">Size: {item.size}</p>}
                      <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-4">
                <button onClick={() => setStep('payment')} className="flex-1 border border-gray-200 py-4 text-xs tracking-widest uppercase hover:border-[#b8963e] transition-colors">
                  Back
                </button>
                <button onClick={handlePlaceOrder} disabled={placingOrder} className="flex-1 bg-[#b8963e] text-white py-4 text-xs tracking-widest uppercase hover:bg-[#d4af64] transition-colors disabled:opacity-50">
                  {placingOrder ? 'Placing...' : 'Place Order'}
                </button>
              </div>
              {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
            </motion.div>
          )}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-[#faf8f4] p-6 sticky top-24">
            <h2 className="font-serif text-xl mb-5">Order Summary</h2>
            <div className="space-y-3 mb-5 max-h-64 overflow-y-auto pr-1">
              {state.items.map((item, i) => (
                <div key={i} className="flex gap-3">
                  <div className="relative w-12 h-14 flex-shrink-0 bg-white">
                    <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#1a1a1a] text-white text-[9px] rounded-full flex items-center justify-center">{item.quantity}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{item.product.name}</p>
                    {item.size && <p className="text-[10px] text-gray-400">{item.size}</p>}
                  </div>
                  <p className="text-xs">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className={shippingCost === 0 ? 'text-green-600' : ''}>
                  {shippingCost === 0 ? 'Free' : `₹${shippingCost}`}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between font-medium">
                <span>Total</span>
                <span className="font-serif text-lg">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div className="mt-5 space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Shield size={12} /> Secure & encrypted checkout
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Truck size={12} /> {shippingCost === 0 ? 'Free shipping applied' : `Free shipping over ₹5,000`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
