'use client';

import { useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Clock3,
  Globe,
  Heart,
  Mail,
  PackageCheck,
  RefreshCcw,
  ShieldAlert,
  Sparkles,
  TimerReset,
  Video,
  Wrench,
} from 'lucide-react';

const WEBSITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gijayi.com';

type AccordionSection = {
  id: string;
  title: string;
  icon: typeof BadgeCheck;
  badge: string;
  summary: string;
};

const heroImage = {
  src: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1400&q=90',
  alt: 'Elegant handcrafted jewellery displayed in a luxury setting',
};

const policySections: AccordionSection[] = [
  {
    id: 'introduction',
    title: 'Introduction',
    icon: Sparkles,
    badge: 'Read First',
    summary: 'A short note on the handcrafted nature of every Gijayi piece and why our policy exists.',
  },
  {
    id: 'returns-exchanges',
    title: 'Returns & Exchanges',
    icon: RefreshCcw,
    badge: '48 Hours Only',
    summary: 'Exchange or store credit is available in eligible cases when the product is unused and reported quickly.',
  },
  {
    id: 'non-returnable',
    title: 'Non-Returnable Items',
    icon: ShieldAlert,
    badge: 'Important',
    summary: 'A clear list of items that cannot be returned because of wear, hygiene, customization, or sale status.',
  },
  {
    id: 'approval-conditions',
    title: 'Exchange Approval Conditions',
    icon: BadgeCheck,
    badge: 'Checklist',
    summary: 'Your exchange request must meet specific condition checks before approval can be granted.',
  },
  {
    id: 'store-credit',
    title: 'Store Credit Policy',
    icon: TimerReset,
    badge: '6 Months',
    summary: 'Approved cases may receive a replacement product or store credit valid for six months.',
  },
  {
    id: 'refund-policy',
    title: 'Refund Policy',
    icon: CircleAlert,
    badge: 'Limited Cases',
    summary: 'Refunds are only available when a replacement is not possible or the item is unavailable.',
  },
  {
    id: 'repair-support',
    title: 'Free Repair Support',
    icon: Wrench,
    badge: '6 Months Free',
    summary: 'Complimentary repair support covers minor fixes and basic structural issues for eligible pieces.',
  },
  {
    id: 'cancellation',
    title: 'Cancellation Policy',
    icon: Clock3,
    badge: 'Before Dispatch',
    summary: 'Orders can be cancelled only before shipping has begun.',
  },
];

const notReturnableItems = [
  'Used or worn jewellery',
  'Customized orders',
  'Earrings',
  'Sale products',
  'Improper handling damage',
  'Minor handmade variations',
];

const exchangeCases = [
  {
    title: 'Damaged item',
    icon: ShieldAlert,
    copy: 'If the product arrives damaged, share proof immediately for review.',
  },
  {
    title: 'Wrong product',
    icon: PackageCheck,
    copy: 'We will assess and support the exchange when the item received is not what you ordered.',
  },
  {
    title: 'Manufacturing defect',
    icon: BadgeCheck,
    copy: 'Verified defects qualify for exchange or store credit after inspection.',
  },
  {
    title: 'Unused original condition',
    icon: Heart,
    copy: 'The piece must remain unused, unworn, and in its original packaging.',
  },
];

const exchangeTimeline = [
  {
    step: '01',
    title: 'Record the unboxing',
    text: 'Keep a continuous unboxing video from parcel opening to product inspection.',
  },
  {
    step: '02',
    title: 'Contact support within 48 hours',
    text: 'Share your order number, images, unboxing video, and issue description right away.',
  },
  {
    step: '03',
    title: 'Receive review confirmation',
    text: 'Our team checks eligibility and responds with the next steps for exchange or credit.',
  },
];

const approvalChecklist = [
  'Product unused',
  'Original packaging intact',
  'No stains or scratches',
  'Order reported within the eligible window',
  'Gijayi reserves the right to reject invalid exchanges',
];

const creditHighlights = [
  {
    title: 'Replacement product',
    text: 'Where possible, we prefer replacing the item with the correct or approved alternate piece.',
  },
  {
    title: 'Store credit',
    text: 'If a replacement is not practical, store credit is issued and remains valid for 6 months.',
  },
];

const refundTimeline = [
  'Refunds are considered only if the product is unavailable or exchange is not possible.',
  'Approved refunds are processed back to the original payment method.',
  'The standard refund window is 7–10 business days after approval.',
];

const repairCoverage = [
  'Minor fixing',
  'Loose stones or beads',
  'Hook or chain repair',
  'Basic structural repairs',
];

const repairExclusions = [
  'Severe damage',
  'Intentional damage',
  'Lost pieces',
  'Water or chemical damage',
];

function HeroDecorations() {
  return (
    <>
      <motion.div
        aria-hidden
        className="absolute -top-8 right-6 hidden md:block text-[#d4af64]/70"
        animate={{ y: [0, -10, 0], rotate: [0, 4, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: [0.42, 0, 0.58, 1] }}
      >
        <Sparkles className="h-8 w-8" />
      </motion.div>
      <motion.div
        aria-hidden
        className="absolute bottom-6 left-6 hidden md:block text-white/70"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: [0.42, 0, 0.58, 1] }}
      >
        <Heart className="h-7 w-7" />
      </motion.div>
    </>
  );
}

function SectionBadge({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#d4af64]/30 bg-[#d4af64]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#8a6f2e]">
      {children}
    </span>
  );
}

function PolicyAccordion({
  item,
  open,
  onToggle,
  children,
}: {
  item: AccordionSection;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  const Icon = item.icon;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.45 }}
      className="overflow-hidden rounded-[1.75rem] border border-[#eadfca] bg-white/85 shadow-[0_16px_40px_rgba(26,26,26,0.06)] backdrop-blur-xl"
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-start justify-between gap-4 px-5 py-5 text-left transition hover:bg-[#fcfbf8] sm:px-6 lg:px-7"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-[#f7edd2] to-[#fff7e1] text-[#8a6f2e] shadow-inner">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <SectionBadge>{item.badge}</SectionBadge>
            <h3 className="mt-3 font-serif text-2xl text-[#1a1a1a]">{item.title}</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">{item.summary}</p>
          </div>
        </div>
        <ChevronDown className={`mt-1 h-5 w-5 text-[#b8963e] transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.42, 0, 0.58, 1] }}
            className="border-t border-[#efe4d1] px-5 pb-6 sm:px-6"
          >
            <div className="pt-6">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

function Timeline({ items }: { items: Array<{ step: string; title: string; text: string }> }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {items.map((item, index) => (
        <div key={item.step} className="relative rounded-3xl border border-[#efe4d1] bg-[#fffaf1] p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1a1a1a] text-xs font-semibold tracking-[0.25em] text-white">
              {item.step}
            </span>
            <div className="h-px flex-1 bg-linear-to-r from-[#d4af64] to-transparent md:hidden" />
          </div>
          <h4 className="mt-4 font-serif text-xl text-[#1a1a1a]">{item.title}</h4>
          <p className="mt-2 text-sm leading-6 text-gray-600">{item.text}</p>
          {index < items.length - 1 && (
            <div className="absolute right-0 top-1/2 hidden h-px w-8 -translate-y-1/2 bg-linear-to-r from-[#d4af64] to-transparent md:block" />
          )}
        </div>
      ))}
    </div>
  );
}

function NoticeBox({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-[#d4af64]/30 bg-linear-to-br from-[#fff9ea] to-[#fffdf8] p-5 shadow-[0_10px_30px_rgba(184,150,62,0.10)]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#8a6f2e]">{title}</p>
      <p className="mt-3 text-sm leading-6 text-gray-700">{text}</p>
    </div>
  );
}

export default function ReturnExchangeRepairPolicyPage() {
  const [openSection, setOpenSection] = useState('introduction');

  return (
    <main className="relative overflow-hidden bg-linear-to-b from-[#f8f5ef] via-white to-[#fbfaf7] text-[#1a1a1a]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-16 h-64 w-64 rounded-full bg-[#d4af64]/10 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-[#b8963e]/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-[#eadfca]/35 blur-3xl" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-[#b8963e]">Gijayi Policy</p>
            <h1 className="font-serif text-lg text-[#1a1a1a] sm:text-xl">Return, Exchange & Repair Policy</h1>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full border border-[#1a1a1a]/10 bg-[#1a1a1a] px-4 py-2 text-xs font-medium tracking-widest text-white transition hover:bg-[#2a2a2a]"
          >
            Contact Support <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <section className="relative w-full px-0 pb-8 pt-0 sm:pb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="relative min-h-svh overflow-hidden rounded-none border-0 bg-[#1b1510] shadow-[0_30px_80px_rgba(26,26,26,0.20)] sm:min-h-[92svh]"
        >
          <Image
            src={heroImage.src}
            alt={heroImage.alt}
            fill
            priority
            className="object-cover opacity-60"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-linear-to-r from-black/72 via-black/50 to-black/22" />
          <HeroDecorations />
          <div className="relative z-10 flex min-h-svh items-end px-4 py-10 sm:px-6 sm:py-14 lg:items-center lg:px-10">
            <div className="max-w-4xl">
              <SectionBadge>Crafted with Love & Care</SectionBadge>
              <h2 className="mt-5 font-serif text-4xl leading-tight text-white sm:text-5xl lg:text-6xl">
                Return, Exchange & Repair Policy
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base lg:text-lg">
                Every Gijayi piece is handcrafted with love and care. Because our jewellery is delicate and made with artisan detail,
                we request you to read the policy carefully before placing an order.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full bg-[#d4af64] px-5 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#1a1a1a] transition hover:bg-[#e6c978]"
                >
                  Contact Support <ArrowRight className="h-4 w-4" />
                </Link>
                <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-3 text-xs font-medium uppercase tracking-[0.2em] text-white/85 backdrop-blur-md">
                  Premium Handcrafted Jewellery
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6 lg:px-8">
        {/* Policy overview sticky header removed per request */}

        <div className="space-y-5">
          {policySections.map((section) => (
            <PolicyAccordion
              key={section.id}
              item={section}
              open={openSection === section.id}
              onToggle={() => setOpenSection((current) => (current === section.id ? '' : section.id))}
            >
              {section.id === 'introduction' && (
                <div className="space-y-5">
                  <p className="max-w-3xl text-sm leading-7 text-gray-700 sm:text-base">
                    Welcome to Gijayi. Each piece of our jewellery is handcrafted with love and care. Due to the delicate and handmade
                    nature of our products, we request customers to carefully read our return, exchange, and repair policy before
                    placing an order.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <NoticeBox title="48 Hours Only" text="All eligible claims must be raised within 48 hours of delivery." />
                    <NoticeBox title="Unboxing Video Mandatory" text="A continuous unboxing video is required for damage, missing, or wrong item claims." />
                  </div>
                </div>
              )}

              {section.id === 'returns-exchanges' && (
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {exchangeCases.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.title} className="rounded-[1.35rem] border border-[#efe4d1] bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fcf7ea] text-[#8a6f2e]">
                            <Icon className="h-5 w-5" />
                          </div>
                          <h4 className="mt-4 font-serif text-xl text-[#1a1a1a]">{item.title}</h4>
                          <p className="mt-2 text-sm leading-6 text-gray-600">{item.copy}</p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="rounded-3xl border border-[#d4af64]/30 bg-linear-to-br from-[#fff7e8] to-[#fffdf9] p-5 sm:p-6">
                    <div className="flex items-center gap-3">
                      <Video className="h-5 w-5 text-[#b8963e]" />
                      <h4 className="font-serif text-2xl text-[#1a1a1a]">Unboxing Video Mandatory</h4>
                    </div>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-700">
                      A continuous unboxing video is mandatory for damaged item, wrong product, or manufacturing defect claims.
                      Please ensure the parcel, label, and full opening process are visible without cuts or edits.
                    </p>
                  </div>

                  <Timeline items={exchangeTimeline} />
                </div>
              )}

              {section.id === 'non-returnable' && (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {notReturnableItems.map((item) => (
                    <div key={item} className="rounded-[1.35rem] border border-[#efe4d1] bg-[#fffaf4] p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1a1a1a] text-white">
                          <CircleAlert className="h-4 w-4" />
                        </div>
                        <p className="font-serif text-xl text-[#1a1a1a]">{item}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {section.id === 'approval-conditions' && (
                <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
                  <div className="space-y-3">
                    {approvalChecklist.map((item) => (
                      <div key={item} className="flex items-start gap-3 rounded-[1.25rem] border border-[#efe4d1] bg-white px-4 py-4 shadow-sm">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#b8963e]" />
                        <p className="text-sm leading-6 text-gray-700">{item}</p>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-3xl border border-[#efe4d1] bg-[#fcfbf8] p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#8a6f2e]">Important condition</p>
                    <p className="mt-3 text-sm leading-7 text-gray-700">
                      Gijayi may reject exchanges that do not meet the above conditions, including cases where the item has been
                      used, handled incorrectly, or reported without required proof.
                    </p>
                  </div>
                </div>
              )}

              {section.id === 'store-credit' && (
                <div className="grid gap-4 md:grid-cols-2">
                  {creditHighlights.map((item) => (
                    <div key={item.title} className="rounded-[1.4rem] border border-[#efe4d1] bg-white p-5 shadow-sm">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#8a6f2e]">{item.title}</p>
                      <p className="mt-3 text-sm leading-7 text-gray-700">{item.text}</p>
                    </div>
                  ))}
                  <div className="rounded-[1.4rem] border border-[#d4af64]/25 bg-linear-to-br from-[#1a1a1a] to-[#2e2417] p-5 text-white md:col-span-2">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#e9d49d]">Store credit validity</p>
                    <p className="mt-3 text-sm leading-7 text-white/85">
                      Store credit remains valid for 6 months from the issue date and can be used against future purchases at Gijayi.
                    </p>
                  </div>
                </div>
              )}

              {section.id === 'refund-policy' && (
                <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
                  <div className="space-y-4">
                    {refundTimeline.map((item) => (
                      <div key={item} className="flex items-start gap-3 rounded-[1.25rem] border border-[#efe4d1] bg-white p-4 shadow-sm">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#fcf7ea] text-[#8a6f2e]">
                          <Globe className="h-4 w-4" />
                        </div>
                        <p className="text-sm leading-7 text-gray-700">{item}</p>
                      </div>
                    ))}
                  </div>
                  <NoticeBox
                    title="Refund timeline"
                    text="When approved, refunds are usually processed within 7–10 business days after verification and confirmation from the support team."
                  />
                </div>
              )}

              {section.id === 'repair-support' && (
                <div className="space-y-6">
                  <div className="rounded-3xl border border-[#d4af64]/30 bg-linear-to-br from-[#fff7e8] to-[#fffdf9] p-5 sm:p-6">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#8a6f2e]">6 Months Complimentary Repair Support</p>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-700">
                      We offer complimentary repair support for eligible pieces within six months. This support is intended for minor
                      repairs and common wear-related issues that do not involve severe damage or misuse.
                    </p>
                  </div>

                  <Timeline
                    items={[
                      { step: '01', title: 'Customer ships item', text: 'Pack the jewellery securely and send it to the support team with your order details.' },
                      { step: '02', title: 'Repair within 10 business days', text: 'We assess and complete the repair within the stated support window whenever possible.' },
                      { step: '03', title: 'Product shipped back', text: 'After completion, the repaired piece is shipped back to you with care.' },
                    ]}
                  />

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="rounded-3xl border border-[#cde4cd] bg-[#f6fbf6] p-5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#43734a]">Covered</p>
                      <ul className="mt-4 space-y-3 text-sm text-gray-700">
                        {repairCoverage.map((item) => (
                          <li key={item} className="flex items-center gap-3">
                            <CheckCircle2 className="h-4 w-4 text-[#43734a]" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-3xl border border-[#f1d5d5] bg-[#fff8f8] p-5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#9b4d4d]">Not Covered</p>
                      <ul className="mt-4 space-y-3 text-sm text-gray-700">
                        {repairExclusions.map((item) => (
                          <li key={item} className="flex items-center gap-3">
                            <CircleAlert className="h-4 w-4 text-[#9b4d4d]" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {section.id === 'cancellation' && (
                <div className="space-y-6">
                  <NoticeBox
                    title="Cancellation by Gijayi"
                    text={
                      'At Gijayi, we craft and deliver premium handcrafted jewelry with care. Occasionally we may need to decline or cancel an order. This can happen if an item is out of stock, we detect a pricing or product-detail error, there’s a potential fraud or security concern, or for any other reason that prevents us from fulfilling your order. In some cases we may ask for additional information before accepting an order. If we cancel your order—fully or partially—or require more details, we’ll notify you promptly and explain the next steps. Any payments for cancelled items will be refunded as per our refunds policy.'
                    }
                  />
                </div>
              )}
            </PolicyAccordion>
          ))}
        </div>

        <motion.section
          id="contact"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-8 overflow-hidden rounded-4xl border border-[#1a1a1a]/10 bg-linear-to-br from-[#1a1a1a] via-[#2a2118] to-[#1a1a1a] p-6 text-white shadow-[0_24px_70px_rgba(26,26,26,0.20)] sm:p-8"
        >
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#e7d39a]">Contact Gijayi</p>
              <h2 className="mt-4 font-serif text-3xl sm:text-4xl">Need help with an order?</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/80">
                Share your order number, product images, unboxing video, and a short issue description so our support team can
                review your request quickly.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="mailto:support@gijayi.com" className="inline-flex items-center gap-2 rounded-full bg-[#d4af64] px-5 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#1a1a1a] transition hover:bg-[#e6c978]">
                  <Mail className="h-4 w-4" /> Email Support
                </Link>
                <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-white/15">
                  <Globe className="h-4 w-4" /> Visit Website
                </Link>
              </div>
            </div>

            <div className="grid gap-3 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
              {[
                'Order number',
                'Product images',
                'Unboxing video',
                'Issue description',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/10 px-4 py-3">
                  <CheckCircle2 className="h-4 w-4 text-[#e7d39a]" />
                  <span className="text-sm text-white/85">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        <footer className="px-2 py-10 text-center">
          <div className="gold-divider mb-4" />
          <p className="text-sm text-gray-600">
            By placing an order with Gijayi, you agree to the terms mentioned above.
          </p>
        </footer>
      </section>
    </main>
  );
}