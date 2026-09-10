/**
 * Google Analytics 4 helpers for Gijayi (Next.js App Router).
 * Centralizes gtag calls so page views and ecommerce events stay consistent.
 */

export const GA_MEASUREMENT_ID =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) ||
  'G-0F8X38P7XQ';

export type Ga4Item = {
  item_id: string;
  item_name: string;
  item_brand?: string;
  item_category?: string;
  item_variant?: string;
  price: number;
  quantity: number;
  currency?: string;
};

export type Ga4EcommercePayload = {
  currency: string;
  value: number;
  items: Ga4Item[];
  transaction_id?: string;
  shipping?: number;
  tax?: number;
  coupon?: string;
  affiliation?: string;
};

type GtagFunction = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: GtagFunction;
  }
}

const PURCHASE_DEDUP_KEY = 'gijayi_ga4_purchase_ids';
let lastPageViewKey = '';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function isGtagReady(): boolean {
  return isBrowser() && typeof window.gtag === 'function';
}

function gtag(...args: unknown[]) {
  if (!isGtagReady()) return;
  window.gtag!(...args);
}

/** Round money to 2 decimals for GA4 value/price fields. */
function money(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100) / 100;
}

export function toGa4Item(input: {
  id: string;
  name: string;
  price: number;
  quantity?: number;
  category?: string;
  variant?: string;
  currency?: string;
}): Ga4Item {
  return {
    item_id: String(input.id),
    item_name: String(input.name),
    item_brand: 'Gijayi',
    item_category: input.category || undefined,
    item_variant: input.variant || undefined,
    price: money(input.price),
    quantity: Math.max(1, Number(input.quantity) || 1),
    currency: input.currency || 'INR',
  };
}

/**
 * Manual page_view for App Router SPA navigations.
 * send_page_view is disabled in gtag config to avoid duplicates with this helper.
 */
export function trackGa4PageView(options?: {
  page_path?: string;
  page_location?: string;
  page_title?: string;
  page_referrer?: string;
}): void {
  if (!isBrowser()) return;

  const page_path = options?.page_path || `${window.location.pathname}${window.location.search}`;
  const page_location = options?.page_location || window.location.href;
  const page_title = (options?.page_title || document.title || 'Gijayi').trim();
  const page_referrer = options?.page_referrer || document.referrer || undefined;

  const dedupeKey = `${page_path}|${page_title}|${page_location}`;
  if (dedupeKey === lastPageViewKey) return;
  lastPageViewKey = dedupeKey;

  if (!isGtagReady()) {
    // Retry briefly while gtag.js finishes loading on first paint.
    window.setTimeout(() => {
      if (!isGtagReady()) return;
      if (dedupeKey !== lastPageViewKey) return;
      gtag('event', 'page_view', {
        page_path,
        page_location,
        page_title,
        page_referrer,
        send_to: GA_MEASUREMENT_ID,
      });
    }, 400);
    return;
  }

  gtag('event', 'page_view', {
    page_path,
    page_location,
    page_title,
    page_referrer,
    send_to: GA_MEASUREMENT_ID,
  });

  if (process.env.NODE_ENV === 'development') {
    console.log('[GA4] page_view', { page_path, page_title, page_location });
  }
}

function pushEcommerceEvent(eventName: string, payload: Ga4EcommercePayload): void {
  if (!isGtagReady()) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[GA4] gtag not ready for ${eventName}`);
    }
    return;
  }

  // Clear previous ecommerce object to prevent item bleed between events.
  gtag('event', eventName, {
    send_to: GA_MEASUREMENT_ID,
    currency: payload.currency || 'INR',
    value: money(payload.value),
    items: payload.items,
    ...(payload.transaction_id ? { transaction_id: payload.transaction_id } : {}),
    ...(typeof payload.shipping === 'number' ? { shipping: money(payload.shipping) } : {}),
    ...(typeof payload.tax === 'number' ? { tax: money(payload.tax) } : {}),
    ...(payload.coupon ? { coupon: payload.coupon } : {}),
    ...(payload.affiliation ? { affiliation: payload.affiliation } : {}),
  });

  if (process.env.NODE_ENV === 'development') {
    console.log(`[GA4] ${eventName}`, payload);
  }
}

export function trackViewItem(item: Ga4Item, currency = 'INR'): void {
  pushEcommerceEvent('view_item', {
    currency,
    value: money(item.price * (item.quantity || 1)),
    items: [item],
  });
}

export function trackAddToCart(item: Ga4Item, currency = 'INR'): void {
  pushEcommerceEvent('add_to_cart', {
    currency,
    value: money(item.price * (item.quantity || 1)),
    items: [item],
  });
}

export function trackBeginCheckout(payload: Ga4EcommercePayload): void {
  pushEcommerceEvent('begin_checkout', {
    ...payload,
    affiliation: payload.affiliation || 'Gijayi Store',
  });
}

function hasTrackedPurchase(transactionId: string): boolean {
  if (!isBrowser() || !transactionId) return false;
  try {
    const raw = sessionStorage.getItem(PURCHASE_DEDUP_KEY);
    const ids = raw ? (JSON.parse(raw) as string[]) : [];
    return ids.includes(transactionId);
  } catch {
    return false;
  }
}

function markPurchaseTracked(transactionId: string): void {
  if (!isBrowser() || !transactionId) return;
  try {
    const raw = sessionStorage.getItem(PURCHASE_DEDUP_KEY);
    const ids = raw ? (JSON.parse(raw) as string[]) : [];
    if (!ids.includes(transactionId)) {
      ids.push(transactionId);
      sessionStorage.setItem(PURCHASE_DEDUP_KEY, JSON.stringify(ids.slice(-50)));
    }
  } catch {
    // ignore storage failures
  }
}

export function trackPurchase(payload: Ga4EcommercePayload & { transaction_id: string }): void {
  const transactionId = String(payload.transaction_id || '').trim();
  if (!transactionId) return;
  if (hasTrackedPurchase(transactionId)) return;

  markPurchaseTracked(transactionId);
  pushEcommerceEvent('purchase', {
    ...payload,
    transaction_id: transactionId,
    affiliation: payload.affiliation || 'Gijayi Store',
  });
}

export type Ga4ClickPayload = {
  click_text?: string;
  click_url?: string;
  click_id?: string;
  click_classes?: string;
  link_domain?: string;
  outbound?: boolean;
  cta_name?: string;
  page_path?: string;
};

/**
 * Named CTA / navigation click for GA4 reports.
 * Use for important interactions; heatmaps come from Microsoft Clarity.
 */
export function trackCtaClick(eventName: string, payload: Ga4ClickPayload = {}): void {
  if (!isGtagReady()) return;

  gtag('event', eventName, {
    send_to: GA_MEASUREMENT_ID,
    click_text: payload.click_text || undefined,
    click_url: payload.click_url || undefined,
    click_id: payload.click_id || undefined,
    click_classes: payload.click_classes || undefined,
    link_domain: payload.link_domain || undefined,
    outbound: typeof payload.outbound === 'boolean' ? payload.outbound : undefined,
    cta_name: payload.cta_name || undefined,
    page_path: payload.page_path || (isBrowser() ? `${window.location.pathname}${window.location.search}` : undefined),
  });

  if (process.env.NODE_ENV === 'development') {
    console.log(`[GA4] ${eventName}`, payload);
  }
}