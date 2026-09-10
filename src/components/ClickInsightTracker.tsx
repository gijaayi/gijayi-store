'use client';

/**
 * Global click insights:
 * - GA4: meaningful link/button/CTA clicks
 * - Microsoft Clarity (NEXT_PUBLIC_CLARITY_PROJECT_ID): heatmaps + session replay
 */

import { useEffect } from 'react';
import { trackCtaClick } from '@/lib/ga4';

const CLARITY_ID = (process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || '').trim();

function cleanText(value: string): string {
  return value.replace(/\s+/g, ' ').trim().slice(0, 120);
}

function findTrackableTarget(start: EventTarget | null): HTMLElement | null {
  if (!(start instanceof Element)) return null;
  return start.closest<HTMLElement>(
    'a[href], button, [role="button"], [data-analytics], input[type="submit"], summary',
  );
}

function classifyClick(el: HTMLElement): { eventName: string; ctaName: string } {
  const analytics = (el.getAttribute('data-analytics') || '').trim();
  if (analytics) {
    return { eventName: 'cta_click', ctaName: analytics };
  }

  const href = el instanceof HTMLAnchorElement ? el.href : el.getAttribute('href') || '';
  const label = cleanText(
    el.getAttribute('aria-label') || el.getAttribute('title') || el.textContent || '',
  ).toLowerCase();

  if (href.includes('wa.me') || href.includes('whatsapp') || label.includes('whatsapp')) {
    return { eventName: 'cta_click', ctaName: 'whatsapp' };
  }
  if (href.includes('instagram.com') || label.includes('instagram')) {
    return { eventName: 'cta_click', ctaName: 'instagram' };
  }
  if (
    href.includes('/checkout') ||
    label.includes('checkout') ||
    label.includes('place order') ||
    label.includes('pay now')
  ) {
    return { eventName: 'cta_click', ctaName: 'checkout' };
  }
  if (href.includes('/cart') || label.includes('cart') || label.includes('bag')) {
    return { eventName: 'cta_click', ctaName: 'cart' };
  }
  if (href.includes('/shop') || label.includes('shop') || label.includes('collection')) {
    return { eventName: 'cta_click', ctaName: 'shop' };
  }
  if (label.includes('add to cart') || label.includes('buy now')) {
    return { eventName: 'cta_click', ctaName: 'add_to_cart_button' };
  }
  if (label.includes('wishlist')) {
    return { eventName: 'cta_click', ctaName: 'wishlist' };
  }
  if (label.includes('search')) {
    return { eventName: 'cta_click', ctaName: 'search' };
  }
  if (label.includes('login') || label.includes('register') || label.includes('sign')) {
    return { eventName: 'cta_click', ctaName: 'auth' };
  }

  if (el instanceof HTMLAnchorElement || el.tagName === 'A') {
    try {
      const url = new URL(href, window.location.origin);
      const outbound = url.origin !== window.location.origin;
      return {
        eventName: outbound ? 'outbound_click' : 'nav_click',
        ctaName: outbound ? 'outbound_link' : 'internal_link',
      };
    } catch {
      return { eventName: 'nav_click', ctaName: 'internal_link' };
    }
  }

  return { eventName: 'cta_click', ctaName: 'button' };
}

function loadClarity(projectId: string) {
  const w = window as Window & { clarity?: (...args: unknown[]) => void };
  if (typeof w.clarity === 'function') return;

  w.clarity = function (...args: unknown[]) {
    const q = ((w.clarity as unknown as { q?: unknown[] }).q =
      (w.clarity as unknown as { q?: unknown[] }).q || []);
    q.push(args);
  };

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${projectId}`;
  document.head.appendChild(script);
}

export default function ClickInsightTracker(): null {
  useEffect(() => {
    if (CLARITY_ID) {
      loadClarity(CLARITY_ID);
    }

    const onClick = (event: MouseEvent) => {
      const el = findTrackableTarget(event.target);
      if (!el) return;

      const path = `${window.location.pathname}${window.location.search}`;
      if (path.startsWith('/admin') || path.startsWith('/admin-login')) return;

      const href =
        el instanceof HTMLAnchorElement ? el.href : el.getAttribute('href') || undefined;

      let outbound = false;
      let linkDomain: string | undefined;
      if (href) {
        try {
          const url = new URL(href, window.location.origin);
          outbound = url.origin !== window.location.origin;
          linkDomain = url.hostname;
        } catch {
          // ignore
        }
      }

      const { eventName, ctaName } = classifyClick(el);
      trackCtaClick(eventName, {
        cta_name: ctaName,
        click_text: cleanText(
          el.getAttribute('aria-label') || el.getAttribute('title') || el.textContent || ctaName,
        ),
        click_url: href,
        click_id: el.id || undefined,
        click_classes: (typeof el.className === 'string' ? el.className : '')
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 6)
          .join(' '),
        link_domain: linkDomain,
        outbound,
        page_path: path,
      });
    };

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  return null;
}