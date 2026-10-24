import type { Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import Script from "next/script";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { WishlistProvider } from "@/context/WishlistContext";
import StoreChrome from "@/components/StoreChrome";
import PopupManager from "@/components/PopupManager";
import MetaPixelTracker from "@/components/MetaPixelTracker";
import GA4Tracker from "@/components/GA4Tracker";
import ClickInsightTracker from "@/components/ClickInsightTracker";
import { defaultMetadata, SITE_URL } from "@/lib/siteMetadata";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
  viewportFit: "cover",
};

export const metadata = defaultMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Gijayi",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    image: `${SITE_URL}/og-image.jpg`,
    description: "Handcrafted Indian jewellery and bridal collections",
    sameAs: [
      "https://www.facebook.com/gijayi",
      "https://www.instagram.com/gijayi",
      "https://www.youtube.com/@gijayi",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Support",
      email: "support@gijayi.com",
    },
  };

  return (
    <html lang="en">
      <head>
        {/* Google Analytics 4 — page_view is sent manually via GA4Tracker for App Router SPA navigations */}
        <Script id="ga4-src" strategy="afterInteractive" src="https://www.googletagmanager.com/gtag/js?id=G-0F8X38P7XQ" />
        <Script
          id="ga4-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-0F8X38P7XQ', {
                send_page_view: false,
                anonymize_ip: true
              });
            `,
          }}
        />

        {/* Meta Pixel - Facebook Pixel */}
        {/* Prevent duplicate pixel loading with typeof fbq check */}
        <Script
          id="meta-pixel-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Prevent duplicate pixel initialization
              if (typeof window !== 'undefined' && !window.fbq) {
                !function(f,b,e,v,n,t,s){
                  if(f.fbq)return;
                  n=f.fbq=function(){
                    n.callMethod ? n.callMethod.apply(n,arguments) : n.queue.push(arguments)
                  };
                  if(!f._fbq)f._fbq=n;
                  n.push=n;
                  n.loaded=!0;
                  n.version='2.0';
                  n.queue=[];
                  t=b.createElement(e);
                  t.async=!0;
                  t.src=v;
                  s=b.getElementsByTagName(e)[0];
                  s.parentNode.insertBefore(t,s)
                }(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
                
                // Initialize Meta Pixel with Gijayi Pixel ID
                fbq('init', '828188160054861');
                
                // Track initial PageView
                fbq('track', 'PageView');
              }
            `,
          }}
        />

        {/* Meta Pixel noscript fallback */}
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=828188160054861&ev=PageView&noscript=1"
            alt="Meta Pixel"
          />
        </noscript>

        <meta name="theme-color" content="#b8963e" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        {/* Google Fonts: Inter & Playfair Display loaded reliably without build-time network failures */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
      </head>
      <body className="font-sans antialiased">
        <CartProvider>
          <AuthProvider>
            <WishlistProvider>
              {/* Track route changes for Meta Pixel + GA4 */}
              <MetaPixelTracker />
              <Suspense fallback={null}>
                <GA4Tracker />
              </Suspense>
              <ClickInsightTracker />
              <PopupManager />
              <StoreChrome>{children}</StoreChrome>
            </WishlistProvider>
          </AuthProvider>
        </CartProvider>
      </body>
    </html>
  );
}
