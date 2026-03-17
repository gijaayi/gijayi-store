'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { Trash2, ArrowRight, ShoppingBag } from 'lucide-react';

export default function CartPage() {
  const { state, removeItem, updateQty, totalPrice, clearCart } = useCart();

  if (state.items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <ShoppingBag size={64} className="text-gray-200 mb-6" />
        <h2 className="font-serif text-3xl mb-3">Your bag is empty</h2>
        <p className="text-sm text-gray-500 mb-8">Looks like you haven&apos;t added anything yet.</p>
        <Link href="/shop" className="bg-[#1a1a1a] text-white px-10 py-4 text-xs tracking-widest uppercase hover:bg-[#b8963e] transition-colors">
          Continue Shopping
        </Link>
      </div>
    );
  }

  const shipping = totalPrice >= 5000 ? 0 : 250;
  const total = totalPrice + shipping;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center justify-between mb-10">
        <h1 className="font-serif text-4xl">Shopping Bag</h1>
        <button onClick={clearCart} className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1">
          <Trash2 size={13} /> Clear All
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Items */}
        <div className="lg:col-span-2 space-y-6">
          {state.items.map((item, i) => (
            <motion.div
              key={`${item.product.id}-${item.size}-${i}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex gap-5 pb-6 border-b border-gray-100"
            >
              <Link href={`/products/${item.product.slug}`} className="relative w-24 h-28 flex-shrink-0 bg-[#faf8f4] overflow-hidden">
                <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <div>
                    <p className="text-[10px] tracking-widest uppercase text-[#b8963e]">{item.product.collection}</p>
                    <Link href={`/products/${item.product.slug}`} className="font-medium text-sm hover:text-[#b8963e] transition-colors">{item.product.name}</Link>
                    {item.size && <p className="text-xs text-gray-400 mt-1">Size: {item.size}</p>}
                    <p className="text-sm font-medium mt-1">₹{item.product.price.toLocaleString('en-IN')}</p>
                  </div>
                  <button
                    onClick={() => removeItem(item.product.id, item.size)}
                    className="text-gray-300 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-3 border border-gray-200 w-fit">
                  <button
                    onClick={() => updateQty(item.product.id, item.quantity - 1, item.size)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-[#faf8f4]"
                  >−</button>
                  <span className="text-sm w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQty(item.product.id, item.quantity + 1, item.size)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-[#faf8f4]"
                  >+</button>
                </div>
                <p className="text-sm font-serif text-right">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-[#faf8f4] p-8 sticky top-24">
            <h2 className="font-serif text-2xl mb-6">Order Summary</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className={shipping === 0 ? 'text-green-600' : ''}>
                  {shipping === 0 ? 'Free' : `₹${shipping}`}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-[#b8963e]">Add ₹{(5000 - totalPrice).toLocaleString('en-IN')} more for free shipping</p>
              )}
              <div className="border-t border-gray-200 pt-3 flex justify-between font-medium">
                <span>Total</span>
                <span className="font-serif text-xl">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Promo */}
            <div className="mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Promo code"
                  className="flex-1 border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-[#b8963e] transition-colors"
                />
                <button className="border border-gray-200 px-4 py-2 text-xs tracking-widest uppercase hover:border-[#b8963e] transition-colors">
                  Apply
                </button>
              </div>
            </div>

            <Link
              href="/checkout"
              className="block w-full bg-[#1a1a1a] text-white text-center py-4 text-xs tracking-widest uppercase hover:bg-[#b8963e] transition-colors duration-300 flex items-center justify-center gap-2"
            >
              Checkout <ArrowRight size={14} />
            </Link>

            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              <span className="text-[10px] text-gray-400">Secure Checkout</span>
              <span className="text-[10px] text-gray-300">·</span>
              <span className="text-[10px] text-gray-400">UPI · Cards · Net Banking</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
