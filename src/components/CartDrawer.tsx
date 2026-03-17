'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';

export default function CartDrawer() {
  const { state, closeCart, removeItem, updateQty, totalPrice } = useCart();

  return (
    <AnimatePresence>
      {state.isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50"
            onClick={closeCart}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.35 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} />
                <span className="font-serif text-xl">Your Bag</span>
                {state.items.length > 0 && (
                  <span className="text-xs text-gray-500 ml-1">({state.items.length} {state.items.length === 1 ? 'item' : 'items'})</span>
                )}
              </div>
              <button onClick={closeCart} className="p-1 hover:text-[#b8963e] transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {state.items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center gap-4">
                  <ShoppingBag size={48} className="text-gray-200" />
                  <p className="font-serif text-xl text-gray-400">Your bag is empty</p>
                  <p className="text-sm text-gray-400">Discover our curated collections</p>
                  <Link
                    href="/shop"
                    onClick={closeCart}
                    className="mt-4 bg-[#1a1a1a] text-white px-8 py-3 text-xs tracking-widest uppercase hover:bg-[#b8963e] transition-colors"
                  >
                    Shop Now
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {state.items.map((item, i) => (
                    <div key={`${item.product.id}-${item.size}-${i}`} className="flex gap-4">
                      <div className="relative w-20 h-24 flex-shrink-0 overflow-hidden bg-[#faf8f4]">
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-sm font-medium leading-tight">{item.product.name}</h4>
                            {item.size && (
                              <p className="text-xs text-gray-500 mt-0.5">Size: {item.size}</p>
                            )}
                            <p className="text-sm font-medium text-[#b8963e] mt-1">
                              ₹{item.product.price.toLocaleString('en-IN')}
                            </p>
                          </div>
                          <button
                            onClick={() => removeItem(item.product.id, item.size)}
                            className="text-gray-400 hover:text-red-500 transition-colors ml-2"
                          >
                            <X size={14} />
                          </button>
                        </div>
                        {/* Quantity */}
                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() => updateQty(item.product.id, item.quantity - 1, item.size)}
                            className="w-7 h-7 border border-gray-200 flex items-center justify-center hover:border-[#b8963e] transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-sm w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQty(item.product.id, item.quantity + 1, item.size)}
                            className="w-7 h-7 border border-gray-200 flex items-center justify-center hover:border-[#b8963e] transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {state.items.length > 0 && (
              <div className="border-t px-6 py-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Subtotal</span>
                  <span className="font-serif text-xl">₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
                <p className="text-xs text-gray-400">Shipping calculated at checkout</p>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="block w-full bg-[#1a1a1a] text-white text-center py-4 text-xs tracking-widest uppercase hover:bg-[#b8963e] transition-colors duration-300"
                >
                  Proceed to Checkout
                </Link>
                <button
                  onClick={closeCart}
                  className="block w-full text-center text-xs tracking-widest uppercase underline text-gray-500 hover:text-[#b8963e] transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
