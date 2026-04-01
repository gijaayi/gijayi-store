'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function EnquiryFormPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    const hasSeenEnquiry = localStorage.getItem('enquiryFormShown');
    if (!hasSeenEnquiry) {
      const timer = setTimeout(() => setIsOpen(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('enquiryFormShown', 'true');
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
        <div className="fixed inset-0 z-120 flex items-start sm:items-center justify-center bg-black/40 p-4 pt-24 sm:pt-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[calc(100vh-7rem)] sm:max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-serif">Get in Touch</h2>
                <p className="text-xs text-gray-600 mt-1">We'd love to help you find the perfect piece</p>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {submitStatus === 'success' ? (
                <div className="text-center py-8">
                  <div className="text-3xl mb-2">✓</div>
                  <p className="text-sm text-green-600 font-medium">Thank you for reaching out!</p>
                  <p className="text-xs text-gray-600 mt-2">We'll be in touch shortly.</p>
                </div>
              ) : submitStatus === 'error' ? (
                <div className="text-center py-4">
                  <p className="text-sm text-red-600 font-medium mb-3">Something went wrong</p>
                  <button
                    type="button"
                    onClick={() => setSubmitStatus('idle')}
                    className="text-xs text-[#b8963e] underline"
                  >
                    Try again
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs tracking-widest uppercase mb-2 font-medium">Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#b8963e]"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs tracking-widest uppercase mb-2 font-medium">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#b8963e]"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs tracking-widest uppercase mb-2 font-medium">Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#b8963e]"
                      placeholder="+91 9XXXXXXXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-xs tracking-widest uppercase mb-2 font-medium">Message</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#b8963e] resize-none"
                      rows={3}
                      placeholder="Tell us what you're looking for..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#1a1a1a] text-white py-3 text-xs tracking-widest uppercase hover:bg-[#b8963e] transition-colors duration-300 font-medium disabled:opacity-50"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Enquiry'}
                  </button>
                </>
              )}
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
