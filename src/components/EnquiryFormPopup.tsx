'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';

interface EnquiryFormPopupProps {
  onClose?: () => void;
  shouldShow?: boolean;
}

export default function EnquiryFormPopup({ onClose, shouldShow = true }: EnquiryFormPopupProps) {
  const [isOpen, setIsOpen] = useState(shouldShow);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    setIsOpen(shouldShow);
  }, [shouldShow]);

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          source: 'popup',
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', phone: '', message: '' });
        setTimeout(() => {
          handleClose();
          setSubmitStatus('idle');
        }, 2000);
      } else {
        setSubmitStatus('error');
      }
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-120 flex items-center justify-center bg-black/50 p-2 sm:p-3 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
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
            <div className="px-4 py-5 mt-1">
              {submitStatus === 'success' ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-2">✓</div>
                  <p className="text-sm text-green-600 font-medium">Thank you for reaching out!</p>
                  <p className="text-xs text-gray-600 mt-2">We'll be in touch shortly.</p>
                </div>
              ) : submitStatus === 'error' ? (
                <div className="text-center py-4">
                  <p className="text-sm text-red-600 font-medium mb-3">Something went wrong</p>
                  <button
                    type="button"
                    onClick={() => setSubmitStatus('idle')}
                    className="text-xs text-[#b8963e] underline hover:text-[#d4af64]"
                  >
                    Try again
                  </button>
                </div>
              ) : (
                <>
                  {/* Icon and Header */}
                  <div className="text-center mb-4">
                    <motion.div
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="flex justify-center mb-3"
                    >
                      <div className="bg-gradient-to-br from-[#d4af7a] to-[#b8963e] p-2.5 rounded-full">
                        <Sparkles size={30} className="text-white" />
                      </div>
                    </motion.div>
                    <h2 className="text-lg font-serif font-bold mb-1 text-[#1a1a1a] leading-tight">
                      Jewellery that reflects your inner glow
                    </h2>
                    <p className="text-xs text-[#666] font-medium">
                      Join Gijayi & unlock exclusive designs
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-2">
                    <div>
                      <input
                        type="text"
                        name="name"
                        placeholder="Your Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border-1.5 border-[#d4c4b0] rounded-lg focus:outline-none focus:border-[#b8963e] focus:ring-2 focus:ring-[#b8963e]/20 text-xs bg-white/80 backdrop-blur-sm transition-all"
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        name="email"
                        placeholder="Your Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border-1.5 border-[#d4c4b0] rounded-lg focus:outline-none focus:border-[#b8963e] focus:ring-2 focus:ring-[#b8963e]/20 text-xs bg-white/80 backdrop-blur-sm transition-all"
                      />
                    </div>
                    <div>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Your Phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border-1.5 border-[#d4c4b0] rounded-lg focus:outline-none focus:border-[#b8963e] focus:ring-2 focus:ring-[#b8963e]/20 text-xs bg-white/80 backdrop-blur-sm transition-all"
                      />
                    </div>
                    <div>
                      <textarea
                        name="message"
                        placeholder="Tell us what you're looking for..."
                        value={formData.message}
                        onChange={handleChange}
                        rows={1}
                        className="w-full px-3 py-2 border-1.5 border-[#d4c4b0] rounded-lg focus:outline-none focus:border-[#b8963e] focus:ring-2 focus:ring-[#b8963e]/20 text-xs resize-none bg-white/80 backdrop-blur-sm transition-all"
                      />
                    </div>

                    <div className="space-y-2 pt-2.5">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-[#1a1a1a] to-[#333] text-white py-2 text-xs tracking-widest uppercase font-semibold hover:from-[#b8963e] hover:to-[#d4af7a] transition-all duration-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                      >
                        {isSubmitting ? 'Sending...' : '✨ Get Exclusive Designs'}
                      </button>
                      <button
                        type="button"
                        onClick={handleClose}
                        className="w-full border-2 border-[#b8963e] text-[#b8963e] py-1.5 text-xs tracking-widest uppercase font-medium hover:bg-gradient-to-r hover:from-[#b8963e]/10 hover:to-[#d4af7a]/10 transition-all duration-300 rounded-lg hover:border-[#d4af7a]"
                      >
                        Maybe Later
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
