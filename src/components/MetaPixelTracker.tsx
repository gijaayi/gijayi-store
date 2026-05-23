"use client";

/**
 * Meta Pixel Route Change Tracker
 * 
 * This component tracks route changes in Next.js App Router
 * and sends PageView events to Meta Pixel for SPA navigation.
 * 
 * Must be a Client Component to use useEffect and usePathname hooks.
 */

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackPageView, isMetaPixelReady } from "@/lib/metaPixel";

/**
 * MetaPixelTracker Component
 * 
 * Monitors route changes and tracks PageView events for Meta Pixel.
 * Ensures Meta Pixel properly tracks navigation in Next.js SPA.
 */
export default function MetaPixelTracker(): null {
  const pathname = usePathname();

  useEffect(() => {
    // Small delay to ensure Meta Pixel is fully loaded
    const timer = setTimeout(() => {
      if (isMetaPixelReady()) {
        trackPageView();
        
        // Debug logging in development
        if (process.env.NODE_ENV === "development") {
          console.log(`[Meta Pixel] PageView tracked for route: ${pathname}`);
        }
      } else {
        // Fallback if fbq is available but not fully initialized
        if (typeof window !== "undefined" && typeof (window as any).fbq !== "undefined") {
          try {
            (window as any).fbq("track", "PageView");
            if (process.env.NODE_ENV === "development") {
              console.log(`[Meta Pixel] PageView tracked (direct fbq call) for route: ${pathname}`);
            }
          } catch (error) {
            console.error("[Meta Pixel] Error tracking route change:", error);
          }
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  // This component doesn't render anything
  return null;
}
