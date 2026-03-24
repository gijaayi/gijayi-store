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
  title: "Gijayi – Luxury Indian Jewellery",
  description: "Discover handcrafted Indian jewelry at Gijayi, including bridal jewelry online, made in India pieces, and affordable designer jewelry collections.",
  keywords: "handcrafted Indian jewelry, bridal jewelry online, made in India, affordable designer jewelry, kundan, polki, Gijayi",
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
