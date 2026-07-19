import type { Metadata } from 'next';
import { getProductByHandle } from '@/lib/shopify';
import { stripHtml } from '@/lib/productSeo';

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

  const title = product.seoTitle?.trim() || `${product.name} | Gijayi`;

  const plainDescription = stripHtml(product.description || '');
  const fallbackDescription = plainDescription
    ? `${plainDescription} Shop handcrafted Indian jewelry, bridal jewelry online, made in India designs, and affordable designer jewelry from Gijayi Store.`
    : `${product.name} by Gijayi. Shop handcrafted Indian jewelry, bridal jewelry online, made in India designs, and affordable designer jewelry from Gijayi Store.`;

  const description = product.metaDescription?.trim() || fallbackDescription;
  const keywords = product.metaKeywords?.trim() || undefined;
  const image = product.images?.[0];
  const url = `${SITE_URL}/products/${product.slug}`;

  return {
    title,
    description,
    ...(keywords ? { keywords } : {}),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
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
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default function ProductSlugLayout({ children }: Props) {
  return children;
}
