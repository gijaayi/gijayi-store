'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Check, Copy, ArrowRight, ShieldCheck } from 'lucide-react';

interface WelcomePopupProps {
  delayMs?: number;
}

export default function WelcomePopup({ delayMs = 5000 }: WelcomePopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const DISCOUNT_CODE = 'WELCOME10';

  const handleClose = useCallback(() => {
    setIsOpen(false);
    try {
      sessionStorage.setItem('gijayi_welcome_popup_dismissed', 'true');
    } catch {
      // Ignore storage errors in restricted iframe/private mode
    }
  }, []);

  useEffect(() => {
    // Check if dismissed in this session or already subscribed previously
    try {
      const isDismissed = sessionStorage.getItem('gijayi_welcome_popup_dismissed');
      const isSubscribed = localStorage.getItem('gijayi_newsletter_subscribed');
      if (isDismissed === 'true' || isSubscribed === 'true') {
        return;
      }
    } catch {
      // Storage access may be blocked; proceed with timer
    }

    const timer = window.setTimeout(() => {
      setIsOpen(true);
    }, delayMs);

    return () => window.clearTimeout(timer);
  }, [delayMs]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });

      const data = await res.json();

      if (res.ok || res.status === 409) {
        // Success or already subscribed: give them the welcome code
        setSubmitted(true);
        try {
          sessionStorage.setItem('gijayi_welcome_popup_dismissed', 'true');
          localStorage.setItem('gijayi_newsletter_subscribed', 'true');
        } catch {
          // ignore
        }
      } else {
        setError(data.error || 'Failed to subscribe. Please try again.');
      }
    } catch {
      setError('Connection error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(DISCOUNT_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="welcome-popup-title"
          className="fixed inset-0 z-120 flex items-center justify-center p-3 sm:p-4 md:p-6"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/65 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-md sm:max-w-2xl md:max-w-3xl overflow-hidden rounded-2xl md:rounded-3xl border border-[#eadfca] bg-[#fffdf9] shadow-[0_25px_70px_rgba(0,0,0,0.35)]"
          >
            {/* Top gold accent line */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#b8963e] via-[#e5d7bd] to-[#b8963e]" />

            {/* Close Button */}
            <button
              onClick={handleClose}
              type="button"
              aria-label="Close welcome popup"
              className="absolute right-3.5 top-3.5 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-[#eadfca] bg-white/90 text-[#1a1a1a] shadow-sm backdrop-blur-sm transition-all hover:bg-[#b8963e] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#b8963e]"
            >
              <X size={16} />
            </button>

            <div className="grid md:grid-cols-12">
              {/* Left Column: Visual Showcase (Hidden or Banner on Mobile) */}
              <div className="relative md:col-span-5 h-36 md:h-auto min-h-[140px] md:min-h-[460px] overflow-hidden bg-[#1b1510]">
                <Image
                  src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=85"
                  alt="Handcrafted luxury jewelry from Gijayi"
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover object-center opacity-85 transition-transform duration-700 hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/75 via-black/40 to-transparent" />

                {/* Brand Overlay Tag */}
                <div className="absolute bottom-3 left-3 md:bottom-6 md:left-6 right-3 text-white">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.25em] text-[#e7d39a] backdrop-blur-md">
                    <Sparkles size={11} className="text-[#b8963e]" />
                    Artisan Heritage
                  </div>
                  <p className="mt-2 hidden md:block font-serif text-lg text-white/90 leading-snug">
                    Handcrafted Luxury Jewellery
                  </p>
                </div>
              </div>

              {/* Right Column: Copy & Interactive Form */}
              <div className="md:col-span-7 flex flex-col justify-center p-6 sm:p-8 md:p-10">
                {!submitted ? (
                  <div>
                    {/* Eyebrow */}
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-px w-6 bg-[#b8963e]" />
                      <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.3em] text-[#8a6f2e]">
                        Welcome Privilege
                      </p>
                    </div>

                    {/* Heading */}
                    <h2
                      id="welcome-popup-title"
                      className="mt-2 font-serif text-2xl sm:text-3xl lg:text-[2rem] font-medium leading-tight text-[#1a1a1a]"
                    >
                      Unlock 10% Off Your First Order
                    </h2>

                    {/* Subheading */}
                    <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-[#5f5f5f]">
                      Join the Gijayi inner circle to receive private access to new handcrafted collections, exclusive festive drops, and 10% off your first purchase.
                    </p>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="mt-5 space-y-3">
                      <div>
                        <label htmlFor="welcome-email-input" className="sr-only">
                          Email address
                        </label>
                        <input
                          id="welcome-email-input"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (error) setError('');
                          }}
                          placeholder="Enter your email address"
                          disabled={loading}
                          className="w-full rounded-xl border border-[#d8c8af] bg-[#fffcf7] px-4 py-3 text-sm text-[#1a1a1a] placeholder-[#9a9184] transition-all focus:border-[#b8963e] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b8963e]/20 disabled:opacity-60"
                        />
                      </div>

                      {error && (
                        <p className="text-xs font-medium text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                          {error}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={loading}
                        className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a1a1a] px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.22em] text-white shadow-md transition-all hover:bg-[#b8963e] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#b8963e] disabled:opacity-60 cursor-pointer"
                      >
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Unlocking...
                          </span>
                        ) : (
                          <>
                            <span>Unlock 10% Off</span>
                            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                          </>
                        )}
                      </button>
                    </form>

                    {/* Dismiss link & trust signal */}
                    <div className="mt-4 flex flex-col items-center gap-2 text-center">
                      <button
                        type="button"
                        onClick={handleClose}
                        className="text-[11px] text-[#7d7568] hover:text-[#1a1a1a] underline underline-offset-2 transition-colors cursor-pointer"
                      >
                        No thanks, I will shop without the offer
                      </button>

                      <div className="flex items-center gap-1.5 text-[10px] text-[#8a8070] mt-1">
                        <ShieldCheck size={12} className="text-[#8a6f2e]" />
                        <span>No spam. Unsubscribe at any time.</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Success State */
                  <div className="text-center py-2">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f4ece0] text-[#8a6f2e] ring-8 ring-[#fcf9f2]">
                      <Sparkles size={26} className="text-[#b8963e]" />
                    </div>

                    <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#8a6f2e]">
                      Welcome to Gijayi
                    </p>
                    <h3 className="mt-1 font-serif text-2xl sm:text-3xl font-medium text-[#1a1a1a]">
                      Your 10% Privilege Is Ready
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-[#5f5f5f] max-w-sm mx-auto">
                      Use your exclusive welcome coupon code during checkout to enjoy 10% off your handcrafted jewellery purchase.
                    </p>

                    {/* Voucher Code Card */}
                    <div className="mt-5 rounded-2xl border border-dashed border-[#b8963e] bg-[#fbf7ed] p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a6f2e]">
                        Coupon Code
                      </p>
                      <div className="mt-2 flex items-center justify-center gap-2">
                        <span className="font-mono text-xl sm:text-2xl font-bold tracking-widest text-[#1a1a1a]">
                          {DISCOUNT_CODE}
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyCode}
                          className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-[#8a6f2e] border border-[#e4d7bf] shadow-sm hover:bg-[#b8963e] hover:text-white transition-all cursor-pointer"
                        >
                          {copied ? (
                            <>
                              <Check size={13} className="text-emerald-600" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy size={13} />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Action button */}
                    <div className="mt-6 flex flex-col gap-2.5">
                      <Link
                        href="/shop"
                        onClick={handleClose}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1a1a1a] px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.22em] text-white shadow-md hover:bg-[#b8963e] transition-all"
                      >
                        <span>Explore Handcrafted Collection</span>
                        <ArrowRight size={14} />
                      </Link>

                      <button
                        type="button"
                        onClick={handleClose}
                        className="text-xs text-[#7d7568] hover:text-[#1a1a1a] transition-colors py-1 cursor-pointer"
                      >
                        Continue Browsing
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
