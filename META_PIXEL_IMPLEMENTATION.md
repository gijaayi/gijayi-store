# Meta Pixel Implementation Guide - Gijayi Jewelry Store

## Overview

This document outlines the production-ready Meta Pixel (Facebook Pixel) implementation for the Gijayi jewelry store Next.js website. The implementation follows Next.js App Router best practices and is optimized for ecommerce tracking.

**Pixel ID:** `828188160054861`

## Table of Contents

1. [Implementation Files](#implementation-files)
2. [How It Works](#how-it-works)
3. [Features](#features)
4. [Usage Guide](#usage-guide)
5. [Verification & Testing](#verification--testing)
6. [Vercel Deployment](#vercel-deployment)
7. [Troubleshooting](#troubleshooting)

## Implementation Files

### Core Files

1. **`src/lib/metaPixel.ts`** - Helper functions library
   - Centralized tracking functions for all ecommerce events
   - Type-safe event tracking
   - Error handling and validation
   - Development logging

2. **`src/components/MetaPixelTracker.tsx`** - Route change tracker
   - Client-side component
   - Tracks PageView on every route change
   - Handles Next.js SPA navigation
   - Essential for accurate analytics

3. **`src/app/layout.tsx`** - Global Meta Pixel initialization
   - Initializes Meta Pixel on page load
   - Uses `next/script` with `strategy="afterInteractive"`
   - Prevents duplicate pixel loading
   - Includes noscript fallback

4. **`src/lib/metaPixel.examples.ts`** - Usage examples
   - Implementation examples for common use cases
   - Product page tracking
   - Cart and checkout integration
   - Form submissions

## How It Works

### 1. Initial Page Load

When a user first visits your website:

```
1. HTML loads with Meta Pixel script tag (afterInteractive strategy)
2. next/script executes the Meta Pixel library
3. fbq('init', '828188160054861') initializes the pixel
4. fbq('track', 'PageView') tracks the initial pageview
5. MetaPixelTracker component mounts and waits for pathname changes
```

### 2. Route Changes (SPA Navigation)

When a user navigates between pages in your Next.js app:

```
1. usePathname() detects route change
2. useEffect hook triggers
3. trackPageView() sends PageView event to Meta Pixel
4. Event appears in Meta Events Manager within seconds
```

### 3. Custom Event Tracking

When you call ecommerce events:

```
1. trackViewContent() → User views a product
2. trackAddToCart() → User adds to cart
3. trackInitiateCheckout() → User starts checkout
4. trackPurchase() → Order completed (conversion)
```

## Features

### ✅ Production-Ready

- **App Router Compatible** - Works seamlessly with Next.js App Router
- **Zero Hydration Issues** - Proper use of `next/script` and client components
- **Duplicate Prevention** - Checks if fbq already exists before loading
- **Error Handling** - All functions have try-catch blocks
- **Development Logging** - Debug mode for development environment

### ✅ Optimized Performance

- **Lazy Loading** - Script loads with `strategy="afterInteractive"`
- **No Layout Shift** - Pixel loads after interactive content
- **Efficient Route Tracking** - Debounced route change tracking
- **Minimal Bundle Impact** - Helper functions are tree-shakeable

### ✅ SEO-Friendly

- **noscript Fallback** - Tracked even when JavaScript is disabled
- **Metadata Optimization** - Works alongside your existing SEO setup
- **No Render Blocking** - Pixel loading doesn't block page rendering

### ✅ Ecommerce-Ready

- **Complete Event Set** - ViewContent, AddToCart, InitiateCheckout, Purchase
- **Lead Tracking** - For newsletter and contact forms
- **Custom Events** - Flexible tracking for unique business needs
- **Product Data** - Proper product information structure

## Usage Guide

### Basic Event Tracking

#### 1. Track Product View

```typescript
// src/app/products/[slug]/page.tsx
"use client";

import { useEffect } from "react";
import { trackViewContent } from "@/lib/metaPixel";

export default function ProductPage({ product }: { product: ProductData }) {
  useEffect(() => {
    trackViewContent({
      id: product.id,
      title: product.name,
      price: product.price,
      category: "Jewelry",
      currency: "USD",
      image: product.image,
    });
  }, [product.id]);

  return <div>{/* Product content */}</div>;
}
```

#### 2. Track Add to Cart

```typescript
// In your cart management code
import { trackAddToCart } from "@/lib/metaPixel";

function addToCart(product: ProductData, quantity: number) {
  // Your existing cart logic...

  // Track the event
  trackAddToCart(product, quantity);
}
```

#### 3. Track Purchase (Most Important!)

```typescript
// src/app/api/orders/complete
import { trackPurchase } from "@/lib/metaPixel";

export async function POST(req: Request) {
  const orderData = await req.json();

  // Process order...

  // Track purchase (this is your conversion!)
  trackPurchase({
    value: orderData.total,
    currency: "USD",
    transaction_id: orderData.orderId,
    contents: orderData.items.map((item) => ({
      id: item.productId,
      quantity: item.quantity,
      title: item.productName,
      price: item.price,
    })),
  });

  return Response.json({ success: true });
}
```

#### 4. Track Form Submissions

```typescript
// Newsletter signup, contact form, etc.
import { trackLead } from "@/lib/metaPixel";

async function submitContactForm(data: FormData) {
  await fetch("/api/contact", { method: "POST", body: JSON.stringify(data) });

  // Track as lead
  trackLead({
    email: data.email,
    phone: data.phone,
    first_name: data.firstName,
  });
}
```

#### 5. Track User Registration

```typescript
// On successful registration
import { trackCompleteRegistration } from "@/lib/metaPixel";

async function completeRegistration(userData: UserData) {
  // Create user account...

  // Track registration
  trackCompleteRegistration();
}
```

### Advanced Usage

#### Custom Events

```typescript
import { trackCustomEvent } from "@/lib/metaPixel";

// Track any custom event
trackCustomEvent("ScheduleConsultation", {
  consultationType: "bridal",
  timestamp: new Date().toISOString(),
});
```

#### Check if Meta Pixel is Ready

```typescript
import { isMetaPixelReady } from "@/lib/metaPixel";

if (isMetaPixelReady()) {
  // Safe to track events
  trackViewContent(product);
}
```

## Verification & Testing

### 1. Local Testing (with Pixel Test Events)

You can test on localhost using Meta Pixel's test events feature:

1. Go to Meta Events Manager
2. Select your pixel
3. Go to "Test Events" tab
4. Enter your test event token
5. Add this code temporarily:

```typescript
// Add to your tracking function for testing
if (process.env.NODE_ENV === "development") {
  (window as any).fbq("trackSingleCustomEvent", "TEST_EVENT_TOKEN", {
    // your event data
  });
}
```

### 2. Production Verification (Vercel)

After deploying to Vercel:

1. **Meta Events Manager Check:**
   - Navigate to Events Manager
   - Select your pixel (828188160054861)
   - Wait 15-20 minutes for data to appear
   - Check if PageView events are showing

2. **Browser Devtools Check:**

   ```javascript
   // In browser console
   console.log(typeof window.fbq); // Should be "function"
   console.log(window._fbq.loaded); // Should be true
   ```

3. **Network Tab Check:**
   - Open DevTools → Network tab
   - Look for requests to `facebook.com/tr`
   - Should see POST requests with pixel data

### 3. Test Events Checklist

Create test scenarios:

- [ ] Landing on homepage → PageView event
- [ ] Viewing product → ViewContent event
- [ ] Adding to cart → AddToCart event
- [ ] Starting checkout → InitiateCheckout event
- [ ] Completing purchase → Purchase event
- [ ] Submitting contact form → Lead event

## Vercel Deployment

### Prerequisites

- [ ] Meta Pixel ID: `828188160054861` (already in code)
- [ ] No conflicting tracking codes
- [ ] `.env` variables set if needed

### Deployment Steps

```bash
# 1. Push changes to GitHub
git add .
git commit -m "Add Meta Pixel implementation"
git push

# 2. Vercel automatically deploys
# (or manually trigger deployment from Vercel dashboard)

# 3. After deployment, verify:
# - Visit your Vercel URL
# - Check Network tab for Meta Pixel requests
# - Wait 15-20 minutes
# - Check Meta Events Manager for events
```

### Vercel-Specific Considerations

✅ **Works Out of the Box:**

- `next/script` component works perfectly on Vercel
- Environment variables are accessible
- No special configuration needed

⚠️ **Important Notes:**

- Meta Pixel requires your production domain to be added to Meta Settings
- First-time setup may take 24 hours for Meta to recognize your domain
- Pixel uses cookies - ensure cookie consent is appropriate for your region

## Troubleshooting

### Events Not Appearing in Meta Events Manager

**Problem:** No events showing after 20+ minutes

**Solutions:**

1. Check pixel ID is correct: `828188160054861`
2. Verify in browser console: `console.log(window.fbq)`
3. Check Network tab for requests to `facebook.com`
4. Ensure your domain is whitelisted in Meta settings
5. Clear browser cookies and try again
6. Check if ad blockers are interfering

### Duplicate Pixel Loading

**Problem:** Meta Pixel loading multiple times

**Solution:** The code includes duplicate prevention:

```typescript
if (typeof window !== "undefined" && !window.fbq) {
  // Only loads if fbq doesn't already exist
}
```

This is already handled in the implementation.

### Route Changes Not Tracked

**Problem:** PageView events not firing on route changes

**Solutions:**

1. Verify `MetaPixelTracker` is in layout.tsx
2. Check that it's a Client Component (`"use client"`)
3. Check browser console for errors
4. Ensure `usePathname()` is imported correctly
5. Verify there are no conflicts with other route tracking code

### TypeScript Errors

**Problem:** Type errors with `fbq` function

**Solution:** This is expected since Meta Pixel script is loaded dynamically. Use `(window as any).fbq` as shown in examples.

### Testing on Localhost

**Problem:** Events not appearing on localhost

**Note:** This is expected! Meta Pixel doesn't track localhost events in production mode. To test on localhost:

1. Use Meta Pixel Test Events feature
2. Or deploy to Vercel for real testing
3. Or configure a development pixel ID for testing

## Security Considerations

### GDPR & Cookie Consent

Your site should have cookie consent before tracking:

```typescript
// Only track if user has consented
if (window.cookieConsent?.analyticsAccepted) {
  trackViewContent(product);
}
```

### Data Privacy

- All tracking data goes to Meta's servers
- No sensitive data (credit cards, passwords) is sent to Meta Pixel
- Pixel automatically handles user consent signals

## Performance Impact

- **Script Size:** ~15-20 KB gzipped
- **Load Time:** ~200-300ms (non-blocking with `afterInteractive`)
- **Impact:** Negligible on Lighthouse scores due to lazy loading

## Next Steps

### Immediate (Done)

- ✅ Meta Pixel initialized globally
- ✅ Route change tracking enabled
- ✅ Helper functions created

### Short Term (Next)

1. Add product view tracking to product pages
2. Add cart event tracking to cart context
3. Add purchase tracking to order completion
4. Add form tracking to contact/newsletter forms

### Medium Term (Analytics)

1. Create conversion funnel in Meta Ads Manager
2. Set up audiences for retargeting
3. Configure purchase event for ads optimization
4. Monitor ROI from Meta campaigns

### Long Term (Advanced)

1. Implement dynamic product ads
2. Catalog sync with Meta
3. Advanced audience building
4. Custom conversions for specific user actions

## Additional Resources

- [Meta Pixel Documentation](https://developers.facebook.com/docs/facebook-pixel)
- [Next.js Script Component](https://nextjs.org/docs/app/api-reference/components/script)
- [Meta Events Manager Guide](https://www.facebook.com/business/help/898185560232180)
- [Ecommerce Event Tracking](https://developers.facebook.com/docs/facebook-pixel/implementation/ecommerce)

## Support & Debugging

For debugging issues:

1. Check `src/lib/metaPixel.ts` for function implementation
2. Review `src/components/MetaPixelTracker.tsx` for route tracking
3. Inspect `src/app/layout.tsx` for initialization
4. Check browser console (devtools) for errors
5. Verify Meta Events Manager is receiving events

---

**Last Updated:** May 2024
**Pixel ID:** 828188160054861
**Status:** Production Ready ✅
