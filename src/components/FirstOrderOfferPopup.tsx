'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift } from 'lucide-react';
import Link from 'next/link';

interface FirstOrderOfferPopupProps {
  hasPlacedOrder: boolean;
  onClose: () => void;
}

export default function FirstOrderOfferPopup({ hasPlacedOrder, onClose }: FirstOrderOfferPopupProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!hasPlacedOrder) {
      const hasSeenOffer = sessionStorage.getItem('firstOrderOfferShown');
      if (!hasSeenOffer) {
        setIsOpen(true);
        sessionStorage.setItem('firstOrderOfferShown', 'true');
      }
    }
  }, [hasPlacedOrder]);

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-120 flex items-start sm:items-center justify-center bg-black/50 p-4 pt-24 sm:pt-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="relative bg-linear-to-br from-[#faf8f4] to-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10 transition-colors"
            >
              <X size={24} />
            </button>

            {/* Content */}
            <div className="text-center px-6 py-12">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mb-4 flex justify-center"
              >
                <Gift size={50} className="text-[#b8963e]" />
              </motion.div>

              <h2 className="text-3xl font-serif mb-3 text-[#1a1a1a]">Special Offer!</h2>
              <p className="text-gray-600 mb-6">Welcome to Gijayi</p>

              <div className="bg-[#b8963e]/10 border-2 border-[#b8963e] rounded-lg p-6 mb-8">
                <div className="text-4xl font-bold text-[#b8963e] mb-2">FREE SHIPPING</div>
                <p className="text-sm text-gray-700">On your first order</p>
              </div>

              <p className="text-xs text-gray-600 mb-8">
                Enjoy complimentary shipping on your very first purchase. After that, domestic orders ship for just ₹99!
              </p>

              <div className="space-y-3">
                <Link
                  href="/shop"
                  onClick={handleClose}
                  className="block w-full bg-[#1a1a1a] text-white py-3 text-xs tracking-widest uppercase font-medium hover:bg-[#b8963e] transition-colors duration-300 rounded"
                >
                  Shop Now
                </Link>
                <button
                  onClick={handleClose}
                  className="w-full border-2 border-[#b8963e] text-[#b8963e] py-3 text-xs tracking-widest uppercase font-medium hover:bg-[#b8963e]/5 transition-colors duration-300 rounded"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
