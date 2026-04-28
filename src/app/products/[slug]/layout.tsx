import type { Metadata } from 'next';
import { getProductByHandle } from '@/lib/shopify';

// Use environment variable or default to production domain
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gijayi.com';

interface Props {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductByHandle(slug);

  if (!product) {
    return {
      title: 'Product Not Found – Gijayi Store',
      description: 'The requested product could not be found.',
    };
  }

  const description = product.description?.trim() || `${product.name} by Gijayi.`;
  const seoDescription = `${description} Shop handcrafted Indian jewelry, bridal jewelry online, made in India designs, and affordable designer jewelry from Gijayi Store.`;
  const image = product.images?.[0];
  const url = `${SITE_URL}/products/${product.slug}`;

  return {
    title: `${product.name} – Gijayi Store`,
    description: seoDescription,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${product.name} – Gijayi Store`,
      description: seoDescription,
      type: 'website',
      url,
      siteName: 'Gijayi',
      locale: 'en_IN',
      images: image 
        ? [
            {
              url: image,
              alt: product.name,
              width: 1200,
              height: 1200,
              type: 'image/jpeg',
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} – Gijayi Store`,
      description: seoDescription,
      images: image ? [image] : undefined,
    },
  };
}

export default function ProductSlugLayout({ children }: Props) {
  return children;
}
