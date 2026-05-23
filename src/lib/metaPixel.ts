/**
 * Meta Pixel Helper Functions
 * Production-ready implementation for Gijayi Jewelry Store
 * 
 * This module provides utilities for tracking user interactions
 * and ecommerce events through Meta Pixel (Facebook Pixel).
 */

// Meta Pixel ID for Gijayi
const PIXEL_ID = "828188160054861";

/**
 * Type definitions for ecommerce events
 */
export interface ProductData {
  id: string;
  title: string;
  price: number;
  category?: string;
  currency?: string;
  image?: string;
}

export interface CartData {
  value: number;
  currency: string;
  contents?: Array<{
    id: string;
    quantity: number;
    title: string;
    price: number;
  }>;
}

export interface PurchaseData {
  value: number;
  currency: string;
  transaction_id: string;
  contents?: CartData["contents"];
}

/**
 * Check if fbq is available (Meta Pixel loaded)
 * @returns boolean indicating if Meta Pixel is loaded
 */
const isFbqAvailable = (): boolean => {
  if (typeof window === "undefined") return false;
  return typeof (window as any).fbq !== "undefined";
};

/**
 * Track a PageView event
 * Called automatically on page load and route changes
 */
export const trackPageView = (): void => {
  if (!isFbqAvailable()) {
    console.warn("Meta Pixel not loaded yet");
    return;
  }

  try {
    (window as any).fbq("track", "PageView");
  } catch (error) {
    console.error("Error tracking PageView:", error);
  }
};

/**
 * Track ViewContent event (when user views a product)
 * @param product - Product information to track
 */
export const trackViewContent = (product: ProductData): void => {
  if (!isFbqAvailable()) {
    console.warn("Meta Pixel not loaded yet");
    return;
  }

  try {
    (window as any).fbq("track", "ViewContent", {
      content_id: product.id,
      content_name: product.title,
      content_type: "product",
      value: product.price,
      currency: product.currency || "USD",
      category: product.category,
      image: product.image,
    });
  } catch (error) {
    console.error("Error tracking ViewContent:", error);
  }
};

/**
 * Track AddToCart event
 * @param product - Product being added to cart
 * @param quantity - Quantity added
 */
export const trackAddToCart = (product: ProductData, quantity: number = 1): void => {
  if (!isFbqAvailable()) {
    console.warn("Meta Pixel not loaded yet");
    return;
  }

  try {
    (window as any).fbq("track", "AddToCart", {
      content_id: product.id,
      content_name: product.title,
      content_type: "product",
      value: product.price * quantity,
      currency: product.currency || "USD",
      quantity: quantity,
    });
  } catch (error) {
    console.error("Error tracking AddToCart:", error);
  }
};

/**
 * Track InitiateCheckout event
 * @param cartData - Cart information
 */
export const trackInitiateCheckout = (cartData: CartData): void => {
  if (!isFbqAvailable()) {
    console.warn("Meta Pixel not loaded yet");
    return;
  }

  try {
    (window as any).fbq("track", "InitiateCheckout", {
      value: cartData.value,
      currency: cartData.currency || "USD",
      contents: cartData.contents || [],
      num_items: cartData.contents?.length || 0,
    });
  } catch (error) {
    console.error("Error tracking InitiateCheckout:", error);
  }
};

/**
 * Track Purchase event (conversion)
 * @param purchaseData - Purchase information including transaction ID
 */
export const trackPurchase = (purchaseData: PurchaseData): void => {
  if (!isFbqAvailable()) {
    console.warn("Meta Pixel not loaded yet");
    return;
  }

  try {
    (window as any).fbq("track", "Purchase", {
      value: purchaseData.value,
      currency: purchaseData.currency || "USD",
      transaction_id: purchaseData.transaction_id,
      contents: purchaseData.contents || [],
      num_items: purchaseData.contents?.length || 0,
    });
  } catch (error) {
    console.error("Error tracking Purchase:", error);
  }
};

/**
 * Track custom events
 * @param eventName - Name of the custom event
 * @param eventData - Optional event data
 */
export const trackCustomEvent = (eventName: string, eventData?: Record<string, any>): void => {
  if (!isFbqAvailable()) {
    console.warn("Meta Pixel not loaded yet");
    return;
  }

  try {
    (window as any).fbq("track", eventName, eventData || {});
  } catch (error) {
    console.error(`Error tracking custom event "${eventName}":`, error);
  }
};

/**
 * Track Lead event (contact form submission, newsletter signup, etc.)
 * @param leadData - Optional lead information
 */
export const trackLead = (leadData?: Record<string, any>): void => {
  if (!isFbqAvailable()) {
    console.warn("Meta Pixel not loaded yet");
    return;
  }

  try {
    (window as any).fbq("track", "Lead", leadData || {});
  } catch (error) {
    console.error("Error tracking Lead:", error);
  }
};

/**
 * Track CompleteRegistration event
 */
export const trackCompleteRegistration = (): void => {
  if (!isFbqAvailable()) {
    console.warn("Meta Pixel not loaded yet");
    return;
  }

  try {
    (window as any).fbq("track", "CompleteRegistration");
  } catch (error) {
    console.error("Error tracking CompleteRegistration:", error);
  }
};

/**
 * Initialize Meta Pixel manually (should be called by next/script)
 * Use this only if needed for manual initialization
 */
export const initMetaPixel = (): void => {
  if (!isFbqAvailable()) {
    console.warn("Meta Pixel script not loaded");
    return;
  }

  try {
    (window as any).fbq("init", PIXEL_ID);
  } catch (error) {
    console.error("Error initializing Meta Pixel:", error);
  }
};

/**
 * Get Meta Pixel ID (useful for debugging or advanced configurations)
 */
export const getPixelId = (): string => {
  return PIXEL_ID;
};

/**
 * Check if Meta Pixel is properly initialized
 */
export const isMetaPixelReady = (): boolean => {
  if (typeof window === "undefined") return false;
  const fbq = (window as any).fbq;
  return typeof fbq !== "undefined" && fbq.loaded === true;
};
