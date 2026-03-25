import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { WishlistProvider } from "@/context/WishlistContext";
import StoreChrome from "@/components/StoreChrome";

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
  title: "Gijayi – Handcrafted Indian Jewellery & Bridal Sets",
  description: "Discover handcrafted Indian jewelry at Gijayi. Shop authentic bridal jewelry online, kundan, polki, and made in India designer pieces with free shipping across India.",
  keywords: "handcrafted Indian jewelry, bridal jewelry online, made in India, kundan jewelry, polki jewelry, designer jewelry, Indian earrings, necklaces, bangles",
  metadataBase: new URL("https://gijayi-store-woad.vercel.app"),
  viewport: "width=device-width, initial-scale=1.0, viewport-fit=cover",
  openGraph: {
    title: "Gijayi – Handcrafted Indian Jewellery & Bridal Sets",
    description: "Authentic handcrafted Indian jewelry and bridal collections with premium quality and fast shipping.",
    siteName: "Gijayi",
    type: "website",
    locale: "en_IN",
    images: [
      {
        url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=90",
        width: 1200,
        height: 630,
        alt: "Gijayi Handcrafted Indian Jewelry",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gijayi – Handcrafted Indian Jewellery",
    description: "Shop authentic Indian jewelry and bridal collections online.",
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
    canonical: "https://gijayi-store-woad.vercel.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Gijayi",
    url: "https://gijayi-store-woad.vercel.app",
    logo: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200",
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
              <StoreChrome>{children}</StoreChrome>
            </WishlistProvider>
          </AuthProvider>
        </CartProvider>
      </body>
    </html>
  );
}
