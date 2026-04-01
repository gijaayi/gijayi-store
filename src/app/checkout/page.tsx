'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle, Shield, Truck, ChevronDown } from 'lucide-react';

type Step = 'shipping' | 'currency' | 'review';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface ExchangeRateResponse {
  currency: string;
  rate: number;
}

export default function CheckoutPage() {
  const { state, totalPrice, clearCart } = useCart();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<Step>('shipping');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderCode, setOrderCode] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState('');

  const [shipping, setShipping] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', state: '', pincode: '', country: 'India',
  });

  const [currency, setCurrency] = useState('INR');
  const [exchangeRate, setExchangeRate] = useState(1);
  const [exchangeLoading, setExchangeLoading] = useState(false);
  const [exchangeError, setExchangeError] = useState('');

  const shippingCost = user && !user.hasPlacedOrder ? 0 : 99;
  const total = totalPrice + shippingCost;
  const displayPrice = (amount: number) => (amount * exchangeRate).toFixed(2);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login?redirect=/checkout');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (currency === 'INR') {
      setExchangeRate(1);
      setExchangeError('');
      return;
    }

    const fetchRate = async () => {
      setExchangeLoading(true);
      setExchangeError('');
      try {
        const response = await fetch(`/api/payment/exchange-rate?currency=${encodeURIComponent(currency)}`);
        const data = (await response.json()) as ExchangeRateResponse & { error?: string };

        if (!response.ok) {
          setExchangeError(data.error || 'Unable to fetch exchange rate.');
          setExchangeRate(1);
          return;
        }

        setExchangeRate(Number(data.rate) || 1);
      } catch {
        setExchangeError('Unable to fetch exchange rate.');
        setExchangeRate(1);
      } finally {
        setExchangeLoading(false);
      }
    };

    fetchRate();
  }, [currency]);

  const handlePlaceOrder = async () => {
    setPlacingOrder(true);
    setError('');

    if (!shipping.firstName || !shipping.email || !shipping.address || !shipping.city || !shipping.pincode) {
      setError('Please complete your shipping information.');
      setPlacingOrder(false);
      return;
    }

    try {
      const totalAmountPaise = Math.round(total * exchangeRate * 100);

      const razorpayOrderResponse = await fetch('/api/payment/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total * exchangeRate,
          currency,
          description: `Gijayi Order - ${state.items.length} items`,
          customerDetails: {
            firstName: shipping.firstName,
            lastName: shipping.lastName,
            email: shipping.email,
            phone: shipping.phone,
          },
        }),
      });

      const razorpayOrder = (await razorpayOrderResponse.json()) as any;

      if (!razorpayOrderResponse.ok) {
        setError(razorpayOrder.error || 'Failed to create payment order.');
        setPlacingOrder(false);
        return;
      }

      if (typeof window === 'undefined') {
        setError('Window object not available.');
        setPlacingOrder(false);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        const options = {
          key: razorpayOrder.keyId,
          amount: totalAmountPaise,
          currency,
          name: 'Gijayi',
          description: `Order for ${state.items.length} items`,
          order_id: razorpayOrder.orderId,
          prefill: {
            name: `${shipping.firstName} ${shipping.lastName}`,
            email: shipping.email,
            contact: shipping.phone,
          },
          handler: async (response: any) => {
            try {
              const verifyResponse = await fetch('/api/payment/razorpay/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });

              const verifyData = (await verifyResponse.json()) as any;

              if (!verifyResponse.ok) {
                setError(verifyData.error || 'Payment verification failed.');
                setPlacingOrder(false);
                return;
              }

              const orderResponse = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  items: state.items.map((item) => ({
                    productId: item.product.id,
                    name: item.product.name,
                    price: item.product.price,
                    quantity: item.quantity,
                    size: item.size,
                    image: item.product.images[0],
                  })),
                  shipping,
                  paymentMethod: 'razorpay',
                  paymentDetails: {
                    razorpayOrderId: response.razorpay_order_id,
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpaySignature: response.razorpay_signature,
                    currency,
                    exchangeRate,
                  },
                }),
              });

              const orderData = (await orderResponse.json()) as any;

              if (!orderResponse.ok) {
                setError(orderData.error || 'Unable to place order.');
                setPlacingOrder(false);
                return;
              }

              setOrderCode(orderData.orderCode || '');
              setEstimatedDelivery(orderData.estimatedDeliveryDate || '');
              setOrderPlaced(true);
              clearCart();
              setPlacingOrder(false);
            } catch (err) {
              setError((err as Error).message || 'Order processing failed.');
              setPlacingOrder(false);
            }
          },
          modal: {
            ondismiss: () => {
              setPlacingOrder(false);
            },
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      };
      document.body.appendChild(script);
    } catch (err) {
      setError((err as Error).message || 'Order processing failed.');
      setPlacingOrder(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-sm text-gray-500">
        Checking your account...
      </div>
    );
  }

  if (orderPlaced) {
    const deliveryDate = estimatedDelivery
      ? new Date(estimatedDelivery).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : 'within 5 business days';

    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 py-20">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
          <CheckCircle size={72} className="text-[#b8963e] mx-auto mb-6" />
          <h2 className="font-serif text-4xl mb-3">Order Placed!</h2>
          <p className="text-sm text-gray-600 max-w-md mb-2">
            Thank you for shopping with Gijayi. Your order has been confirmed and will be dispatched shortly.
          </p>
          {orderCode && <p className="text-xs text-[#b8963e] mb-2 tracking-widest uppercase">Order ID: {orderCode}</p>}
          <p className="text-xs text-gray-500 mb-2">Estimated Delivery: {deliveryDate}</p>
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
          {(['shipping', 'currency', 'review'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-4">
              <div className={`flex items-center gap-2 text-xs tracking-widest uppercase ${step === s ? 'text-[#1a1a1a] font-medium' : step > s ? 'text-[#b8963e]' : 'text-gray-300'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] border ${step === s ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white' : step > s ? 'border-[#b8963e] bg-[#b8963e] text-white' : 'border-gray-200'}`}>
                  {i + 1}
                </div>
                {s === 'currency' ? 'Payment' : s.charAt(0).toUpperCase() + s.slice(1)}
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
                  onClick={() => setStep('currency')}
                  disabled={!shipping.firstName || !shipping.email || !shipping.address || !shipping.city || !shipping.pincode}
                  className="w-full bg-[#1a1a1a] text-white py-4 text-xs tracking-widest uppercase hover:bg-[#b8963e] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continue to Payment
                </button>
              </div>
            </motion.div>
          )}

          {step === 'currency' && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="font-serif text-2xl mb-6">Select Currency</h2>
              <div className="mb-6">
                <label className="block text-xs tracking-widest uppercase mb-3">Currency *</label>
                <div className="relative">
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#b8963e] appearance-none"
                  >
                    <option value="INR">₹ Indian Rupee (INR)</option>
                    <option value="USD">$ US Dollar (USD)</option>
                    <option value="EUR">€ Euro (EUR)</option>
                    <option value="GBP">£ British Pound (GBP)</option>
                    <option value="AED">د.إ UAE Dirham (AED)</option>
                    <option value="AUD">A$ Australian Dollar (AUD)</option>
                    <option value="CAD">C$ Canadian Dollar (CAD)</option>
                    <option value="SGD">S$ Singapore Dollar (SGD)</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600" />
                </div>
                {exchangeLoading && <p className="text-xs text-gray-500 mt-2">Fetching exchange rate...</p>}
                {exchangeError && <p className="text-xs text-red-600 mt-2">{exchangeError}</p>}
                {!exchangeLoading && exchangeRate !== 1 && (
                  <p className="text-xs text-gray-500 mt-2">
                    1 INR = {exchangeRate.toFixed(4)} {currency}
                  </p>
                )}
              </div>

              <div className="flex gap-4">
                <button onClick={() => setStep('shipping')} className="flex-1 border border-gray-200 py-4 text-xs tracking-widest uppercase hover:border-[#b8963e] transition-colors">
                  Back
                </button>
                <button onClick={() => setStep('review')} disabled={exchangeLoading} className="flex-1 bg-[#1a1a1a] text-white py-4 text-xs tracking-widest uppercase hover:bg-[#b8963e] transition-colors disabled:opacity-50">
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
                    <div className="relative w-14 h-16 shrink-0 bg-[#faf8f4]">
                      <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.product.name}</p>
                      {item.size && <p className="text-xs text-gray-400">Size: {item.size}</p>}
                      <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium">{currency} {displayPrice(item.product.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-4">
                <button onClick={() => setStep('currency')} className="flex-1 border border-gray-200 py-4 text-xs tracking-widest uppercase hover:border-[#b8963e] transition-colors">
                  Back
                </button>
                <button onClick={handlePlaceOrder} disabled={placingOrder} className="flex-1 bg-[#b8963e] text-white py-4 text-xs tracking-widest uppercase hover:bg-[#d4af64] transition-colors disabled:opacity-50">
                  {placingOrder ? 'Processing...' : 'Pay Now'}
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
                  <div className="relative w-12 h-14 shrink-0 bg-white">
                    <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#1a1a1a] text-white text-[9px] rounded-full flex items-center justify-center">{item.quantity}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{item.product.name}</p>
                    {item.size && <p className="text-[10px] text-gray-400">{item.size}</p>}
                  </div>
                  <p className="text-xs">{currency} {displayPrice(item.product.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>{currency} {displayPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className={shippingCost === 0 ? 'text-green-600' : ''}>
                  {shippingCost === 0 ? 'Free' : `${currency} ${displayPrice(shippingCost)}`}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between font-medium">
                <span>Total</span>
                <span className="font-serif text-lg">{currency} {displayPrice(total)}</span>
              </div>
            </div>
            <div className="mt-5 space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Shield size={12} /> Secure payment via Razorpay
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Truck size={12} /> {shippingCost === 0 ? 'Free shipping on first order' : 'Shipping: ₹99 for India'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
