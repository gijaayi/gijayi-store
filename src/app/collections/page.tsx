import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getAllCollections } from '@/lib/shopify';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Collections – Gijayi',
  description: 'Explore Gijayi collections including bridal jewellery, heritage designs, and everyday luxe essentials.',
};

export default async function CollectionsPage() {
  const collections = await getAllCollections();

  return (
    <div className="bg-white">
      <section className="relative overflow-hidden bg-[#1a1a1a] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(212,175,100,0.3),_transparent_35%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28 text-center">
          <p className="text-xs tracking-[0.4em] uppercase text-[#d4af64] mb-4">Curated Edit</p>
          <h1 className="font-serif text-5xl md:text-6xl">Collections</h1>
          <p className="max-w-2xl mx-auto mt-6 text-sm text-white/75 leading-relaxed">
            Explore signature worlds shaped around ceremonies, heirloom craft, and elevated daily wear.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-20">
        <div className="grid gap-8 md:gap-10">
          {collections.map((collection, index) => (
            <article
              key={collection.id}
              className="grid overflow-hidden border border-[#efe6d7] bg-[#fcfbf8] md:grid-cols-[1.2fr_1fr]"
            >
              <div className={`relative min-h-[320px] ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                <Image
                  src={collection.image}
                  alt={collection.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 60vw"
                />
              </div>
              <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16">
                <p className="text-xs tracking-[0.35em] uppercase text-[#b8963e] mb-3">{collection.itemCount} Pieces</p>
                <h2 className="font-serif text-3xl md:text-4xl mb-4">{collection.name}</h2>
                <p className="text-sm text-gray-600 leading-relaxed mb-8">{collection.description}</p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href={`/collections/${collection.slug}`}
                    className="inline-flex items-center gap-2 bg-[#1a1a1a] text-white px-6 py-3 text-xs tracking-widest uppercase hover:bg-[#b8963e] transition-colors"
                  >
                    View Collection <ArrowRight size={14} />
                  </Link>
                  <Link
                    href={`/shop?q=${encodeURIComponent(collection.name)}`}
                    className="inline-flex items-center gap-2 border border-[#1a1a1a] px-6 py-3 text-xs tracking-widest uppercase hover:border-[#b8963e] hover:text-[#b8963e] transition-colors"
                  >
                    Shop Similar
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}