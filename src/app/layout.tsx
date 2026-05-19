import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { WishlistProvider } from "@/context/WishlistContext";
import StoreChrome from "@/components/StoreChrome";
import PopupManager from "@/components/PopupManager";

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
  title: "Gijayi – Women Led Start-up for Handcrafted Jewelry | Worldwide Shipping",
  description: "Welcome to Gijayi Family. Shop carefully crafted jewelry from a women led start-up with secure payment and worldwide shipping.",
  keywords: "women led start-up, secure payment, carefully crafted jewelry, worldwide shipping, handcrafted jewelry, bridal jewelry, luxury jewelry, jewelry worldwide, handmade bridal sets, Indian jewelry, statement jewelry, premium jewelry online",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://gijayi.com"),
  viewport: "width=device-width, initial-scale=1.0, viewport-fit=cover",
  openGraph: {
    title: "Welcome to Gijayi Family",
    description: "Women led start-up with carefully crafted jewelry, secure payment, and worldwide shipping.",
    siteName: "Gijayi",
    type: "website",
    locale: "en_IN",
    images: [
      {
        url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=90",
        width: 1200,
        height: 630,
        alt: "Gijayi Handcrafted Jewelry",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Welcome to Gijayi Family",
    description: "Women led start-up with carefully crafted jewelry, secure payment, and worldwide shipping.",
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
        <Script id="google-tag-manager" strategy="afterInteractive" src="https://www.googletagmanager.com/gtag/js?id=G-92MWSPN2Y3" />
        <Script
          id="google-tag-manager-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-92MWSPN2Y3');
            `,
          }}
        />
        <meta name="theme-color" content="#b8963e" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="icon" href="/favicon.ico" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
      </head>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>
        <CartProvider>
          <AuthProvider>
            <WishlistProvider>
              <PopupManager />
              <StoreChrome>{children}</StoreChrome>
            </WishlistProvider>
          </AuthProvider>
        </CartProvider>
      </body>
    </html>
  );
}
