import type { Collection, Product } from '@/lib/types';

export type CollectionHighlightImages = {
  bridalLuxe?: string;
  heritage?: string;
  everydayMinimal?: string;
};

export type StorefrontCollectionDefinition = {
  slug: 'bridal-luxe' | 'heritage' | 'everyday-minimal';
  label: string;
  aliases: string[];
  highlightKey: keyof Required<CollectionHighlightImages>;
  description: string;
};

/** Canonical storefront collections — single source of truth for Homepage + /collections */
export const STOREFRONT_COLLECTION_DEFS: StorefrontCollectionDefinition[] = [
  {
    slug: 'bridal-luxe',
    label: 'Bridal Luxe',
    aliases: ['Bridal Luxe', 'Bridal Collection', 'Bridal', 'Khanam'],
    highlightKey: 'bridalLuxe',
    description:
      'Opulent jewellery crafted for your most cherished moments. Every piece tells a story of love and tradition.',
  },
  {
    slug: 'heritage',
    label: 'Heritage',
    aliases: ['Heritage'],
    highlightKey: 'heritage',
    description:
      "Timeless designs inspired by India's rich jewellery-making legacy, reimagined for the modern woman.",
  },
  {
    slug: 'everyday-minimal',
    label: 'Everyday Minimal',
    aliases: ['Everyday Minimal', 'Everyday Luxe', 'Everyday', 'Minimal', 'Naaz'],
    highlightKey: 'everydayMinimal',
    description:
      'Refined pieces to elevate every day. Effortlessly luxurious for the woman who appreciates beauty in simplicity.',
  },
];

export type StorefrontCollectionCard = {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  itemCount: number;
};

export function normalizeCollectionKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function collectionMatchesStorefrontDefinition(
  collection: Collection,
  definition: StorefrontCollectionDefinition,
) {
  const slug = normalizeCollectionKey(collection.slug);
  const name = normalizeCollectionKey(collection.name);

  return (
    slug === definition.slug ||
    definition.aliases.some((alias) => {
      const aliasKey = normalizeCollectionKey(alias);
      return slug === aliasKey || name === aliasKey;
    })
  );
}

function productMatchesDefinition(product: Product, definition: StorefrontCollectionDefinition) {
  if (definition.slug === 'bridal-luxe' && product.bridalLuxe) return true;
  if (definition.slug === 'heritage' && product.heritage) return true;
  if (definition.slug === 'everyday-minimal' && product.everydayMinimal) return true;

  const collectionKey = normalizeCollectionKey(product.collection || '');
  return definition.aliases.some((alias) => collectionKey === normalizeCollectionKey(alias));
}

function isPlaceholderDescription(description: string | undefined) {
  const value = (description || '').trim();
  if (!value) return true;
  return /^collection:\s*/i.test(value);
}

/**
 * Resolve the three storefront collections using:
 * - Admin storefront collection highlight images (preferred)
 * - Mongo/DB collection records for id/description fallback
 * - Live product counts from flags + collection aliases
 */
export function resolveStorefrontCollections(
  collections: Collection[],
  products: Product[],
  highlights: CollectionHighlightImages,
): StorefrontCollectionCard[] {
  return STOREFRONT_COLLECTION_DEFS.map((definition) => {
    const matched = collections.find((collection) =>
      collectionMatchesStorefrontDefinition(collection, definition),
    );
    const highlightImage = highlights[definition.highlightKey] || '';
    const image = highlightImage || matched?.image || '';
    const description = !isPlaceholderDescription(matched?.description)
      ? String(matched?.description)
      : definition.description;
    const itemCount =
      products.filter((product) => productMatchesDefinition(product, definition)).length ||
      matched?.itemCount ||
      0;

    return {
      id: matched?.id || definition.slug,
      name: definition.label,
      slug: definition.slug,
      image,
      description,
      itemCount,
    };
  });
}

/** Map an arbitrary collection name to a canonical storefront label, if possible. */
export function toCanonicalCollectionName(name: string): string | null {
  const key = normalizeCollectionKey(name);
  const matched = STOREFRONT_COLLECTION_DEFS.find(
    (definition) =>
      definition.slug === key ||
      definition.aliases.some((alias) => normalizeCollectionKey(alias) === key),
  );
  return matched?.label || null;
}