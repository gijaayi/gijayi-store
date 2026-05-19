'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BadgeCheck, Sparkles, ShieldCheck, Truck, X } from 'lucide-react';

interface EnquiryFormPopupProps {
  onClose?: () => void;
  shouldShow?: boolean;
}

export default function EnquiryFormPopup({ onClose, shouldShow = true }: EnquiryFormPopupProps) {
  const [isOpen, setIsOpen] = useState(shouldShow);
  const highlightItems = [
    { icon: BadgeCheck, label: 'Women led Start-up' },
    { icon: ShieldCheck, label: 'Secure payment' },
    { icon: Sparkles, label: 'Carefully Crafted' },
    { icon: Truck, label: 'Worldwide Shipping' },
  ];

  useEffect(() => {
    setIsOpen(shouldShow);
  }, [shouldShow]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const timer = window.setTimeout(() => {
      handleClose();
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-x-0 bottom-4 z-120 flex justify-center px-3 sm:px-4 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 36, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            className="pointer-events-auto relative w-full max-w-2xl overflow-hidden rounded-2xl border border-[#eadfca] bg-gradient-to-r from-[#fffaf2] via-[#ffffff] to-[#f7f1e6] shadow-[0_20px_60px_rgba(0,0,0,0.18)]"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#b8963e] via-[#d4af7a] to-[#b8963e]" />
            <button
              onClick={handleClose}
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-[#e4d7bf] bg-white/90 text-gray-500 shadow-sm transition-all hover:bg-[#b8963e]/10 hover:text-[#b8963e]"
            >
              <X size={16} />
            </button>

            <div className="flex flex-col gap-4 px-4 py-4 pr-12 sm:flex-row sm:items-center sm:gap-5 sm:px-5 sm:py-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#d4af7a] to-[#b8963e] shadow-md">
                <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2.2, repeat: Infinity }}>
                  <Sparkles size={28} className="text-white" />
                </motion.div>
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#b8963e]">Flash update</p>
                <h2 className="mt-1 text-lg font-serif font-bold leading-tight text-[#1a1a1a] sm:text-xl">
                  Welcome to Gijayi Family
                </h2>
                <p className="mt-1 text-sm text-[#5f5f5f]">
                  Handmade jewellery, trusted checkout, and worldwide delivery built for every celebration.
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {highlightItems.map((item) => {
                    const Icon = item.icon;

                    return (
                      <span
                        key={item.label}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#e5d7bd] bg-white/80 px-3 py-1 text-[11px] font-medium text-[#2d2d2d] shadow-sm"
                      >
                        <Icon size={13} className="text-[#b8963e]" />
                        {item.label}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-stretch">
                <a
                  href="/shop"
                  onClick={handleClose}
                  className="inline-flex items-center justify-center rounded-xl bg-[#1a1a1a] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.22em] text-white shadow-lg transition-all hover:bg-[#b8963e]"
                >
                  Explore
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
