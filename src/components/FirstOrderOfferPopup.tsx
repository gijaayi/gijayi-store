'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift } from 'lucide-react';
import Link from 'next/link';

interface FirstOrderOfferPopupProps {
  hasPlacedOrder: boolean;
  onClose: () => void;
  isAutomatic?: boolean;
}

export default function FirstOrderOfferPopup({ hasPlacedOrder, onClose, isAutomatic = false }: FirstOrderOfferPopupProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isAutomatic) {
      // Show automatically when passed from PopupManager
      setIsOpen(true);
      return;
    }

    // Original logic for manual triggering
    if (!hasPlacedOrder) {
      const hasSeenOffer = sessionStorage.getItem('firstOrderOfferShown');
      if (!hasSeenOffer) {
        setIsOpen(true);
        sessionStorage.setItem('firstOrderOfferShown', 'true');
      }
    }
  }, [hasPlacedOrder, isAutomatic]);

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-120 flex items-center justify-center bg-black/50 p-2 sm:p-3 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="relative bg-gradient-to-b from-[#fffbf5] to-[#faf6f0] rounded-xl shadow-2xl max-w-xs w-full max-h-[95vh] overflow-y-auto border-2 border-[#e9dfcd]"
          >
            {/* Gold accent top stripe */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#b8963e] via-[#d4af7a] to-[#b8963e] rounded-t-xl"></div>

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 bg-white/80 hover:bg-[#b8963e]/20 text-gray-600 hover:text-[#b8963e] z-10 transition-all rounded-full p-1 shadow-sm"
            >
              <X size={20} />
            </button>

            {/* Content */}
            <div className="text-center px-4 py-5 mt-1">
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mb-3 flex justify-center"
              >
                <div className="bg-gradient-to-br from-[#d4af7a] to-[#b8963e] p-2.5 rounded-full">
                  <Gift size={30} className="text-white" />
                </div>
              </motion.div>

              <h2 className="text-lg font-serif font-bold mb-1 text-[#1a1a1a]">Special Offer!</h2>
              <p className="text-xs text-[#666] mb-3 font-medium">Welcome to Gijayi</p>

              <div className="bg-gradient-to-r from-[#b8963e]/15 to-[#d4af7a]/15 border-2 border-[#d4af7a] rounded-lg p-3 mb-3">
                <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#b8963e] to-[#d4af7a] mb-0.5">FREE SHIPPING</div>
                <p className="text-xs text-gray-700 font-medium">On your first order</p>
              </div>

              <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                Enjoy complimentary shipping on your very first purchase. After that, domestic orders ship for just ₹99!
              </p>

              <div className="space-y-2">
                <Link
                  href="/shop"
                  onClick={handleClose}
                  className="block w-full bg-gradient-to-r from-[#1a1a1a] to-[#333] text-white py-2 text-xs tracking-widest uppercase font-semibold hover:from-[#b8963e] hover:to-[#d4af7a] transition-all duration-300 rounded-lg shadow-lg hover:shadow-xl"
                >
                  🛍️ Shop Now
                </Link>
                <button
                  onClick={handleClose}
                  className="w-full border-2 border-[#b8963e] text-[#b8963e] py-1.5 text-xs tracking-widest uppercase font-medium hover:bg-gradient-to-r hover:from-[#b8963e]/10 hover:to-[#d4af7a]/10 transition-all duration-300 rounded-lg hover:border-[#d4af7a]"
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
