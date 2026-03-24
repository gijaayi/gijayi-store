import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { collections, products } from '@/lib/data';
import ProductCard from '@/components/ProductCard';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return collections.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const collection = collections.find((c) => c.slug === slug);

  if (!collection) {
    return {
      title: 'Collection Not Found | Gijayi',
      description: 'The requested collection could not be found.',
    };
  }

  const url = `https://gijayi.com/collections/${collection.slug}`;

  return {
    title: `${collection.name} Collection | Gijayi`,
    description: collection.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${collection.name} Collection | Gijayi`,
      description: collection.description,
      type: 'website',
      url,
      images: [{ url: collection.image, alt: collection.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${collection.name} Collection | Gijayi`,
      description: collection.description,
      images: [collection.image],
    },
  };
}

export default async function CollectionDetailPage({ params }: Props) {
  const { slug } = await params;
  const collection = collections.find((c) => c.slug === slug);
  if (!collection) notFound();

  const collectionProducts = products.filter(
    (p) => p.collection.toLowerCase().replace(/\s+/g, '-') === slug
  );

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${collection.name} Collection`,
    description: collection.description,
    url: `https://gijayi.com/collections/${collection.slug}`,
    image: collection.image,
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://gijayi.com/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Collections',
        item: 'https://gijayi.com/collections',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: collection.name,
        item: `https://gijayi.com/collections/${collection.slug}`,
      },
    ],
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Hero */}
      <div className="relative h-[50vh] min-h-[320px] flex items-center">
        <Image
          src={collection.image}
          alt={collection.name}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full text-center text-white">
          <p className="text-xs tracking-[0.4em] uppercase text-[#d4af64] mb-3">{collection.itemCount} pieces</p>
          <h1 className="font-serif text-5xl md:text-6xl">{collection.name}</h1>
          <div className="w-12 h-px bg-[#d4af64] mx-auto mt-5" />
          <p className="text-sm text-white/80 max-w-xl mx-auto mt-4 leading-relaxed">{collection.description}</p>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        {collectionProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {collectionProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="font-serif text-2xl text-gray-300">More pieces coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
}
