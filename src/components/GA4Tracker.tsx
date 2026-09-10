'use client';

/**
 * Fires GA4 page_view on App Router navigations (including back/forward).
 * Initial gtag config uses send_page_view: false to avoid double-counting.
 */

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackGa4PageView } from '@/lib/ga4';

function waitForSettledTitle(timeoutMs = 600): Promise<string> {
  return new Promise((resolve) => {
    const started = Date.now();
    let last = document.title?.trim() || '';

    const tick = () => {
      const current = document.title?.trim() || '';
      if (current && current === last && Date.now() - started >= 80) {
        resolve(current);
        return;
      }
      last = current;
      if (Date.now() - started >= timeoutMs) {
        resolve(current || 'Gijayi');
        return;
      }
      window.setTimeout(tick, 40);
    };

    window.setTimeout(tick, 40);
  });
}

export default function GA4Tracker(): null {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previousUrlRef = useRef<string>('');

  useEffect(() => {
    const search = searchParams?.toString();
    const page_path = search ? `${pathname || ''}?${search}` : pathname || '/';
    const page_location =
      typeof window !== 'undefined'
        ? `${window.location.origin}${page_path}`
        : page_path;
    const page_referrer = previousUrlRef.current || (typeof document !== 'undefined' ? document.referrer : '');

    let cancelled = false;

    void (async () => {
      // Let Next.js update document.title / metadata after the navigation settles.
      const page_title = await waitForSettledTitle();
      if (cancelled) return;

      trackGa4PageView({
        page_path,
        page_location,
        page_title,
        page_referrer: page_referrer || undefined,
      });

      previousUrlRef.current = page_location;
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname, searchParams]);

  return null;
}