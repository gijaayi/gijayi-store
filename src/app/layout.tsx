import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { WishlistProvider } from "@/context/WishlistContext";
import StoreChrome from "@/components/StoreChrome";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "Gijayi – Luxury Indian Jewellery",
  description: "Discover Gijayi's curated collection of handcrafted Indian jewellery – bridal, heritage, and everyday luxe pieces crafted with love in India.",
  keywords: "Indian jewellery, bridal jewellery, kundan, polki, gold jewellery, Gijayi",
  metadataBase: new URL("https://gijayi.com"),
  openGraph: {
    title: "Gijayi – Luxury Indian Jewellery",
    description: "Handcrafted Indian jewellery for every occasion.",
    siteName: "Gijayi",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} ${cormorant.variable} font-sans antialiased`}>
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
