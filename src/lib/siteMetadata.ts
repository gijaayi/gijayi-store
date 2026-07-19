import type { Metadata } from "next";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://gijayi.com";

export const SITE_NAME = "Gijayi";

export const DEFAULT_TITLE = "Gijayi | Handcrafted Luxury Indian Jewellery";

export const DEFAULT_DESCRIPTION =
  "Shop handcrafted Indian jewellery, bridal sets, and statement pieces from Gijayi. Made in India with premium craftsmanship and worldwide shipping.";

/** Public OG/Twitter share image (1200x630), served from /public/og-image.jpg */
export const DEFAULT_OG_IMAGE = {
  url: "/og-image.jpg",
  width: 1200,
  height: 630,
  alt: "Gijayi - Handcrafted Indian Jewellery",
  type: "image/jpeg",
} as const;

export const defaultMetadata: Metadata = {
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  keywords:
    "Gijayi, handcrafted Indian jewellery, bridal jewelry, statement jewelry, luxury jewelry online, made in India jewelry",
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }],
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_IN",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE.url],
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
    canonical: SITE_URL,
  },
};