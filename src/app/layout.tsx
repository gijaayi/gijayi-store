import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { WishlistProvider } from "@/context/WishlistContext";
import StoreChrome from "@/components/StoreChrome";
import PopupManager from "@/components/PopupManager";
import MetaPixelTracker from "@/components/MetaPixelTracker";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "Gijayi | Handcrafted Luxury Jewelry",
  description: "Gijayi offers bespoke Indian jewelry and bridal heirloom designs. Shop artisan crafted pieces with global shipping and premium service.",
  keywords: "bespoke jewelry, handcrafted jewelry, bridal jewelry, luxury jewelry, Indian jewelry, artisan jewelry, Gijayi, premium jewelry online",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://gijayi.com"),
  viewport: "width=device-width, initial-scale=1.0, viewport-fit=cover",
  openGraph: {
    title: "Gijayi | Handcrafted Luxury Jewelry",
    description: "Bespoke Indian jewelry, bridal sets, and heirloom craftsmanship from Gijayi. Global shipping and personalized styling support.",
    siteName: "Gijayi",
    type: "website",
    locale: "en_IN",
    images: [
      {
        url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=90",
        width: 1200,
        height: 630,
        alt: "Gijayi Handcrafted Luxury Jewelry",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gijayi | Handcrafted Luxury Jewelry",
    description: "Bespoke Indian jewelry, bridal sets, and heirloom craftsmanship from Gijayi.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || "https://gijayi.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://gijayi.com";
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Gijayi",
    url: siteUrl,
    description: "Handcrafted Indian jewelry and bridal collections",
    sameAs: [
      "https://www.facebook.com/gijayi",
      "https://www.instagram.com/gijayi",
      "https://www.youtube.com/@gijayi",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Support",
      telephone: "+91-XXXXXXXXXX",
      email: "support@gijayi.com",
    },
  };

  return (
    <html lang="en">
      <head>
        {/* Google Tag Manager */}
        <Script id="google-tag-manager" strategy="afterInteractive" src="https://www.googletagmanager.com/gtag/js?id=G-0F8X38P7XQ" />
        <Script
          id="google-tag-manager-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-0F8X38P7XQ');
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
        <link rel="icon" href="/favicon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
      </head>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>
        <CartProvider>
          <AuthProvider>
            <WishlistProvider>
              {/* Track route changes for Meta Pixel PageView events */}
              <MetaPixelTracker />
              <PopupManager />
              <StoreChrome>{children}</StoreChrome>
            </WishlistProvider>
          </AuthProvider>
        </CartProvider>
      </body>
    </html>
  );
}
