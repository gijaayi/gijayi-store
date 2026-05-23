# Meta Pixel Setup Checklist - Gijayi Jewelry Store

## ✅ Completed Implementation

### Core Files Created

- [x] `src/lib/metaPixel.ts` - Helper functions library
  - Track PageView
  - Track ViewContent (product views)
  - Track AddToCart
  - Track InitiateCheckout
  - Track Purchase (conversions)
  - Track Lead (forms, signups)
  - Track CompleteRegistration
  - Track custom events
  - Utility functions for debugging

- [x] `src/components/MetaPixelTracker.tsx` - Route change tracker
  - Tracks PageView on every route change
  - Handles Next.js SPA navigation properly
  - Development logging
  - Production-ready implementation

- [x] `src/app/layout.tsx` - Updated with Meta Pixel
  - Added MetaPixelTracker component import
  - Integrated Meta Pixel initialization script
  - Uses next/script with strategy="afterInteractive"
  - Prevents duplicate pixel loading
  - Includes noscript fallback
  - No hydration issues

### Documentation

- [x] `META_PIXEL_IMPLEMENTATION.md` - Comprehensive guide
- [x] `src/lib/metaPixel.examples.ts` - Usage examples

### Key Features Implemented

- [x] Global Meta Pixel initialization
- [x] Duplicate pixel loading prevention
- [x] Route change tracking for SPA navigation
- [x] noscript fallback for JavaScript disabled users
- [x] Type-safe event tracking functions
- [x] Error handling and validation
- [x] Development logging support
- [x] Production-ready code

## 🚀 Next Steps: Integration

### Immediate (This Week)

- [ ] **Test on localhost**
  - Run `npm run dev`
  - Check browser console for Meta Pixel logs
  - Verify no errors in Network tab

- [ ] **Add product page tracking**
  - Open `src/app/products/[slug]/page.tsx`
  - Add `import { trackViewContent } from "@/lib/metaPixel"`
  - Wrap tracking in useEffect when product loads
  - See examples in `metaPixel.examples.ts`

- [ ] **Add cart event tracking**
  - Update your cart management code
  - Add `trackAddToCart` when items are added
  - Add `trackInitiateCheckout` when checkout starts

### Short Term (Next 2 Weeks)

- [ ] **Add purchase tracking (CRITICAL)**
  - This is your conversion event
  - Add to order completion API endpoint
  - Use `trackPurchase` function
  - Include transaction ID and item details

- [ ] **Add form tracking**
  - Contact form: Add `trackLead`
  - Newsletter signup: Add `trackLead`
  - User registration: Add `trackCompleteRegistration`

- [ ] **Deploy to Vercel**
  - Push all changes to GitHub
  - Vercel auto-deploys
  - Monitor deployment status

### Medium Term (Testing)

- [ ] **Verify in Meta Events Manager**
  - Go to Meta Business Suite
  - Select Events Manager
  - Select your pixel (828188160054861)
  - Check if events are appearing
  - Wait 15-20 minutes for data propagation

- [ ] **Create test scenarios**
  - Visit homepage → Should see PageView
  - View product → Should see ViewContent
  - Add to cart → Should see AddToCart
  - Start checkout → Should see InitiateCheckout
  - Complete order → Should see Purchase (conversion!)

### Optional Enhancements

- [ ] Set up conversion tracking in Ads Manager
- [ ] Create audiences based on pixel events
- [ ] Configure dynamic ads
- [ ] Set up ROAS optimization for purchases

## 📋 File Structure

```
gijayi-store/
├── src/
│   ├── lib/
│   │   ├── metaPixel.ts .......................... ✅ Helper functions
│   │   ├── metaPixel.examples.ts ............... ✅ Usage examples
│   │   └── (other files...)
│   ├── components/
│   │   ├── MetaPixelTracker.tsx ................. ✅ Route tracker
│   │   └── (other components...)
│   └── app/
│       ├── layout.tsx ........................... ✅ Updated with Pixel
│       └── (other pages...)
├── META_PIXEL_IMPLEMENTATION.md ................ ✅ Full documentation
└── (other files...)
```

## 🔍 How to Verify It's Working

### 1. In Browser Console

```javascript
// Type this in browser DevTools console:
console.log(window.fbq); // Should show function
console.log(window._fbq.loaded); // Should be true
```

### 2. In Network Tab

- Open DevTools → Network
- Look for requests to `facebook.com/tr`
- Should see POST requests with pixel data
- Check payload to confirm events

### 3. In Meta Events Manager

- Go to Meta Business Suite
- Navigate to Events Manager
- Select pixel: 828188160054861
- Check "Test Events" or live events
- Wait 15-20 minutes for data to appear

## 📊 Expected Events

After implementation, you should see:

| Event            | Trigger                    | Frequency              |
| ---------------- | -------------------------- | ---------------------- |
| PageView         | Every page load/navigation | High (every visitor)   |
| ViewContent      | Product page view          | Medium (product pages) |
| AddToCart        | Item added to cart         | Variable               |
| InitiateCheckout | Checkout started           | Variable               |
| Purchase         | Order completed            | Low (conversion)       |
| Lead             | Form submission            | Low                    |

## 🚨 Troubleshooting Quick Links

See `META_PIXEL_IMPLEMENTATION.md` for detailed troubleshooting on:

- Events not appearing in Events Manager
- Duplicate pixel loading
- Route changes not tracked
- TypeScript errors
- Testing on localhost
- Vercel deployment issues

## 💡 Quick Reference

### To Track an Event in Your Code

```typescript
// Import the function
import { trackViewContent } from "@/lib/metaPixel";

// Call it when needed
trackViewContent({
  id: productId,
  title: productName,
  price: productPrice,
  category: "Jewelry",
  currency: "USD",
});
```

### Common Integration Points

1. **Product Pages:** `trackViewContent` ← Product view
2. **Cart Context:** `trackAddToCart` ← Add to cart
3. **Checkout Page:** `trackInitiateCheckout` ← Checkout started
4. **Order API:** `trackPurchase` ← Order completed (IMPORTANT!)
5. **Forms:** `trackLead` ← Contact/Newsletter signup
6. **Registration:** `trackCompleteRegistration` ← User signup

## 📞 Support Resources

- **Implementation Guide:** `META_PIXEL_IMPLEMENTATION.md`
- **Code Examples:** `src/lib/metaPixel.examples.ts`
- **Helper Functions:** `src/lib/metaPixel.ts`
- **Route Tracker:** `src/components/MetaPixelTracker.tsx`

## ⚡ Quick Start Summary

1. ✅ Files created and integrated
2. 🔄 Next: Add tracking to product pages
3. 🛒 Then: Add cart event tracking
4. 💳 Then: Add purchase event tracking
5. 🚀 Then: Deploy to Vercel
6. ✔️ Finally: Verify in Meta Events Manager

---

**Status:** Implementation Complete - Ready for Integration
**Pixel ID:** 828188160054861
**Last Updated:** May 2024

Questions? See `META_PIXEL_IMPLEMENTATION.md` for complete documentation.
