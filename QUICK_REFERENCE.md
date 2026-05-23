# Meta Pixel - Developer Quick Reference

> Gijayi Jewelry Store | Pixel ID: 828188160054861

## Quick Copy-Paste Examples

### Track Product View

```typescript
import { trackViewContent } from "@/lib/metaPixel";

useEffect(() => {
  trackViewContent({
    id: product.id,
    title: product.name,
    price: product.price,
    category: "Jewelry",
    currency: "USD",
    image: product.imageUrl,
  });
}, [product.id]);
```

### Track Add to Cart

```typescript
import { trackAddToCart } from "@/lib/metaPixel";

trackAddToCart(product, quantity);
```

### Track Purchase (Most Important!)

```typescript
import { trackPurchase } from "@/lib/metaPixel";

trackPurchase({
  value: order.totalAmount,
  currency: "USD",
  transaction_id: order.orderId,
  contents: order.items.map((item) => ({
    id: item.productId,
    quantity: item.quantity,
    title: item.productName,
    price: item.price,
  })),
});
```

### Track Form Submission

```typescript
import { trackLead } from "@/lib/metaPixel";

// Contact form, newsletter signup, etc.
trackLead({
  email: userEmail,
  phone: userPhone,
  first_name: firstName,
  last_name: lastName,
});
```

### Track User Registration

```typescript
import { trackCompleteRegistration } from "@/lib/metaPixel";

trackCompleteRegistration();
```

### Track Checkout Start

```typescript
import { trackInitiateCheckout } from "@/lib/metaPixel";

trackInitiateCheckout({
  value: cartTotal,
  currency: "USD",
  contents: cartItems.map((item) => ({
    id: item.productId,
    quantity: item.quantity,
    title: item.productName,
    price: item.price,
  })),
});
```

### Track Custom Event

```typescript
import { trackCustomEvent } from "@/lib/metaPixel";

trackCustomEvent("ScheduleConsultation", {
  consultationType: "bridal",
  timestamp: new Date().toISOString(),
});

// Or track wishlist action
trackCustomEvent("AddToWishlist", { product_id: "123" });
```

---

## Integration Checklist

Use this checklist to know where to add tracking:

### 🏠 Homepage

- [ ] Add PageView tracking ✅ (auto - MetaPixelTracker)

### 📦 Product Pages

```typescript
// File: src/app/products/[slug]/page.tsx
trackViewContent({ ... })
```

- [ ] Track ViewContent on product page load

### 🛒 Cart

```typescript
// File: src/context/CartContext.tsx or cart management
trackAddToCart({ ... })
```

- [ ] Track AddToCart when user adds items

### 💳 Checkout

```typescript
// File: src/app/checkout/page.tsx
trackInitiateCheckout({ ... })
```

- [ ] Track InitiateCheckout at checkout start

### ✅ Order Completion

```typescript
// File: src/app/api/orders/complete (or equivalent)
trackPurchase({ ... })
```

- [ ] Track Purchase on order success ⭐ (Most Important!)

### 📧 Newsletter/Contact

```typescript
// File: src/app/api/newsletter/subscribe (or contact form)
trackLead({ ... })
```

- [ ] Track Lead on form submission

### 👤 User Registration

```typescript
// File: src/app/register/page.tsx (or registration endpoint)
trackCompleteRegistration();
```

- [ ] Track CompleteRegistration on signup

### 💬 Other Actions

```typescript
trackCustomEvent("EventName", { customData });
```

- [ ] Wishlist actions
- [ ] Consultation scheduling
- [ ] Product reviews
- [ ] Live chat initiations

---

## Common Integration Points

### Product Page Example

```typescript
// src/app/products/[slug]/page.tsx
"use client";

import { useEffect } from "react";
import { trackViewContent } from "@/lib/metaPixel";

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = getProduct(params.slug); // Your data fetching

  useEffect(() => {
    if (product) {
      trackViewContent({
        id: product.id,
        title: product.name,
        price: product.price,
        category: product.collection,
        currency: "USD",
        image: product.mainImage,
      });
    }
  }, [product?.id]);

  return <div>{/* Product content */}</div>;
}
```

### Cart Context Example

```typescript
// src/context/CartContext.tsx
import { trackAddToCart, trackInitiateCheckout } from "@/lib/metaPixel";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const addToCart = (product: ProductData, quantity: number) => {
    // Your existing cart logic...
    setCartItems([...cartItems, { product, quantity }]);

    // Track the event
    trackAddToCart(product, quantity);
  };

  const startCheckout = () => {
    // Your checkout logic...

    // Track checkout initiation
    trackInitiateCheckout({
      value: calculateTotal(cartItems),
      currency: "USD",
      contents: cartItems.map(item => ({
        id: item.product.id,
        quantity: item.quantity,
        title: item.product.name,
        price: item.product.price,
      })),
    });
  };

  return (
    <CartContext.Provider value={{ addToCart, startCheckout, ... }}>
      {children}
    </CartContext.Provider>
  );
}
```

### Order Completion API Example

```typescript
// src/app/api/orders/complete (or your order endpoint)
import { trackPurchase } from "@/lib/metaPixel";

export async function POST(req: Request) {
  const orderData = await req.json();

  // Process and save order...
  const savedOrder = await saveOrder(orderData);

  // ⭐ IMPORTANT: Track purchase conversion
  trackPurchase({
    value: savedOrder.totalAmount,
    currency: "USD",
    transaction_id: savedOrder.orderId,
    contents: savedOrder.items.map((item) => ({
      id: item.productId,
      quantity: item.quantity,
      title: item.productName,
      price: item.unitPrice,
    })),
  });

  return Response.json({ success: true, orderId: savedOrder.orderId });
}
```

---

## Debugging

### Check if Meta Pixel is Loaded

```typescript
import { isMetaPixelReady, getPixelId } from "@/lib/metaPixel";

if (isMetaPixelReady()) {
  console.log("✅ Meta Pixel ready!");
  console.log("Pixel ID:", getPixelId());
} else {
  console.log("⚠️ Meta Pixel not ready yet");
}
```

### Manual Test in Console

```javascript
// In browser DevTools console:

// Check if loaded
console.log(window.fbq);

// Manually track event (for testing)
window.fbq("track", "ViewContent", {
  content_id: "test-123",
  content_name: "Test Product",
  value: 99.99,
  currency: "USD",
});
```

### Check Network Requests

1. Open DevTools → Network tab
2. Filter: `facebook`
3. Look for `tr` requests (these are your pixel events)
4. Click on one to see the payload
5. Should contain event data like `event=ViewContent`

---

## Import Reference

```typescript
// All available functions:
import {
  trackPageView, // Tracks page view (auto-tracked)
  trackViewContent, // Product view
  trackAddToCart, // Add to cart
  trackInitiateCheckout, // Checkout started
  trackPurchase, // Order completed (conversion!)
  trackLead, // Form/signup
  trackCompleteRegistration, // User registration
  trackCustomEvent, // Any custom event
  isMetaPixelReady, // Check if ready
  getPixelId, // Get pixel ID (for debugging)
} from "@/lib/metaPixel";
```

---

## Data Requirements

### Product Data

```typescript
{
  id: string;              // Unique product ID
  title: string;           // Product name
  price: number;           // Product price
  category?: string;       // Product category (optional)
  currency?: string;       // Currency code (default: USD)
  image?: string;          // Product image URL (optional)
}
```

### Cart Data

```typescript
{
  value: number;           // Total cart value
  currency: string;        // Currency code
  contents?: [
    {
      id: string;          // Product ID
      quantity: number;    // Quantity
      title: string;       // Product name
      price: number;       // Unit price
    }
  ]
}
```

### Purchase Data

```typescript
{
  value: number;           // Total purchase amount
  currency: string;        // Currency code
  transaction_id: string;  // Order ID (REQUIRED for tracking!)
  contents?: [
    {
      id: string;          // Product ID
      quantity: number;    // Quantity
      title: string;       // Product name
      price: number;       // Unit price
    }
  ]
}
```

---

## Best Practices

✅ **DO:**

- Always include transaction_id in purchase events
- Track purchase events on order success endpoint
- Include currency code (USD, INR, etc.)
- Test locally before deploying
- Check Events Manager within 15-20 minutes of deployment

❌ **DON'T:**

- Track on localhost (test data won't show)
- Send sensitive data (credit cards, passwords)
- Duplicate tracking calls
- Track events before checking if fbq is available
- Forget to include product IDs

---

## Testing Checklist

Before going live:

- [ ] Test on localhost (check console for errors)
- [ ] Add product page tracking
- [ ] Test add to cart tracking
- [ ] Test purchase tracking
- [ ] Deploy to Vercel
- [ ] Wait 20 minutes
- [ ] Check Meta Events Manager for events
- [ ] Verify all event types are appearing

---

## Where to Find Things

| Need             | Location                              |
| ---------------- | ------------------------------------- |
| Helper functions | `src/lib/metaPixel.ts`                |
| Usage examples   | `src/lib/metaPixel.examples.ts`       |
| Route tracker    | `src/components/MetaPixelTracker.tsx` |
| Initialization   | `src/app/layout.tsx`                  |
| Full docs        | `META_PIXEL_IMPLEMENTATION.md`        |
| Checklist        | `SETUP_CHECKLIST.md`                  |

---

**Pixel ID:** 828188160054861
**Brand:** Gijayi Jewelry Store
**Status:** ✅ Ready for Integration

For questions, see the full documentation in `META_PIXEL_IMPLEMENTATION.md`
