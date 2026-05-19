import type { Metadata } from 'next';
import AboutClient from '../../components/about/AboutClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gijayi.com';

export const metadata: Metadata = {
  title: 'About Gijayi – Handcrafted Luxury Jewelry',
  description: "Gijayi — handcrafted heirloom jewelry, preserving craft and supporting artisan communities.",
  metadataBase: new URL(siteUrl),
};

export default function AboutPage() {
  return <AboutClient />;
}
