/**
 * Meta Pixel Implementation Examples & Usage Guide
 * For Gijayi Jewelry Store
 * 
 * This file contains code examples for implementing Meta Pixel tracking.
 * These are reference examples - copy and adapt to your actual components.
 */

/*
// ============================================
// PRODUCT PAGE EXAMPLE
// ============================================
// File: src/app/products/[slug]/page.tsx

"use client";

import { useEffect } from "react";
import { trackViewContent } from "@/lib/metaPixel";

export default function ProductPage({ product }: { product: ProductData }) {
  // Track when user views a product
  useEffect(() => {
    trackViewContent({
      id: product.id,
      title: product.name,
      price: product.price,
      category: product.category,
      currency: "USD",
      image: product.image,
    });
  }, [product.id]);

  return (
    <div>
      {// Product details }
    </div>
  );
}
*/

/*
// ============================================
// ADD TO CART EXAMPLE
// ============================================
// File: src/app/cart/page.tsx or in your Cart component

import { trackAddToCart } from "@/lib/metaPixel";

function addProductToCart(product: ProductData, quantity: number) {
  // Your existing cart logic...
  
  // Track the add to cart event
  trackAddToCart(product, quantity);
}
*/

/*
// ============================================
// CHECKOUT INITIATION EXAMPLE
// ============================================
// File: src/app/checkout/page.tsx

import { trackInitiateCheckout } from "@/lib/metaPixel";

function startCheckout(cartItems: CartItem[], totalValue: number) {
  // Track checkout initiation
  trackInitiateCheckout({
    value: totalValue,
    currency: "USD",
    contents: cartItems.map(item => ({
      id: item.productId,
      quantity: item.quantity,
      title: item.productName,
      price: item.price,
    })),
  });

  // Proceed with checkout...
}
*/

/*
// ============================================
// PURCHASE/CONVERSION EXAMPLE
// ============================================
// File: src/app/api/orders/create or your order completion endpoint

import { trackPurchase } from "@/lib/metaPixel";

export async function handleOrderCompletion(order: OrderData) {
  // Your existing order processing...

  // Track purchase conversion
  trackPurchase({
    value: order.totalAmount,
    currency: "USD",
    transaction_id: order.orderId,
    contents: order.items.map(item => ({
      id: item.productId,
      quantity: item.quantity,
      title: item.productName,
      price: item.price,
    })),
  });
}
*/

/*
// ============================================
// LEAD TRACKING EXAMPLE
// ============================================
// File: src/app/api/contact/submit or your contact form handler

import { trackLead } from "@/lib/metaPixel";

export async function handleContactFormSubmit(formData: ContactFormData) {
  // Submit form data...

  // Track lead event
  trackLead({
    phone: formData.phone,
    email: formData.email,
    first_name: formData.firstName,
    last_name: formData.lastName,
  });
}
*/

/*
// ============================================
// NEWSLETTER SIGNUP EXAMPLE
// ============================================
// File: src/components/NewsletterSignup.tsx

import { trackLead } from "@/lib/metaPixel";

async function handleNewsletterSignup(email: string) {
  const response = await fetch("/api/newsletter/subscribe", {
    method: "POST",
    body: JSON.stringify({ email }),
  });

  if (response.ok) {
    // Track newsletter signup as a lead
    trackLead({
      email,
      source: "newsletter",
    });
  }
}
*/

/*
// ============================================
// USER REGISTRATION EXAMPLE
// ============================================
// File: src/app/register/page.tsx

import { trackCompleteRegistration } from "@/lib/metaPixel";

async function handleRegistration(userData: RegistrationData) {
  // Create user account...

  // Track registration completion
  trackCompleteRegistration();
}
*/

/*
// ============================================
// CUSTOM EVENT TRACKING EXAMPLE
// ============================================
// File: any component

import { trackCustomEvent } from "@/lib/metaPixel";

// Track when user clicks "Schedule Consultation"
function scheduleConsultation() {
  trackCustomEvent("ScheduleConsultation", {
    consultationType: "bridal",
  });
}

// Track wishlist action
function addToWishlist(productId: string) {
  trackCustomEvent("AddToWishlist", {
    product_id: productId,
  });
}
*/

/*
// ============================================
// INTEGRATION WITH CART CONTEXT
// ============================================
// File: src/context/CartContext.tsx

import { trackAddToCart, trackInitiateCheckout } from "@/lib/metaPixel";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const addToCart = (product: ProductData, quantity: number) => {
    // Your existing logic...
    
    // Track with Meta Pixel
    trackAddToCart(product, quantity);
  };

  const handleCheckout = () => {
    const cartData = getCartData();
    trackInitiateCheckout({
      value: cartData.total,
      currency: "USD",
      contents: cartData.items,
    });
  };

  return (
    <CartContext.Provider value={{ addToCart, handleCheckout, ... }}>
      {children}
    </CartContext.Provider>
  );
}
*/

/*
// ============================================
// DEBUGGING & VERIFICATION
// ============================================

import { isMetaPixelReady, getPixelId } from "@/lib/metaPixel";

// Use in development to check if Meta Pixel is ready
function debugMetaPixel() {
  if (process.env.NODE_ENV === "development") {
    console.log("Meta Pixel Ready:", isMetaPixelReady());
    console.log("Pixel ID:", getPixelId());
    console.log("fbq available:", typeof window !== "undefined" && typeof (window as any).fbq !== "undefined");
  }
}
*/

/*
// ============================================
// META EVENTS MANAGER VERIFICATION
// ============================================

To verify Meta Pixel is working in Meta Events Manager:

1. Go to Meta Business Suite: https://business.facebook.com/
2. Navigate to Events Manager
3. Select your pixel (828188160054861)
4. Check "Test Events" tab
5. You should see:
   - PageView events on every page navigation
   - ViewContent when viewing products
   - AddToCart when adding items
   - InitiateCheckout during checkout
   - Purchase on order completion

If events don't appear:
- Check browser console for errors
- Verify pixel ID is correct
- Check if website is in production (not localhost)
- Wait 15-20 minutes for Events Manager to update
- Ensure cookies are not blocked
*/

/*
// ============================================
// NEXT STEPS FOR IMPLEMENTATION
// ============================================

1. PRODUCT PAGES:
   - Add trackViewContent to [slug]/page.tsx
   - Track when product details load

2. CART FUNCTIONALITY:
   - Add trackAddToCart to CartContext or cart management
   - Fire when user adds items to cart

3. CHECKOUT PROCESS:
   - Add trackInitiateCheckout when user starts checkout
   - Add trackPurchase on order success

4. FORMS & LEADS:
   - Add trackLead to contact form submissions
   - Add trackLead to newsletter signups

5. USER REGISTRATION:
   - Add trackCompleteRegistration after sign up

6. TESTING:
   - Test in development (use localhost with pixel test events)
   - Deploy to Vercel
   - Verify events in Meta Events Manager
   - Monitor conversion funnel
*/
