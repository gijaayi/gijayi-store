

import 'server-only';

import { Collection, Product } from './types';
import { collections as fallbackCollections, products as fallbackProducts } from './data';
import { readDatabase } from './server/database';

const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

const SHOPIFY_API_URL = SHOPIFY_DOMAIN
  ? `https://${SHOPIFY_DOMAIN}/api/2024-10/graphql.json`
  : '';

function hasShopifyConfig() {
  return Boolean(SHOPIFY_DOMAIN && SHOPIFY_STOREFRONT_TOKEN);
}

type ShopifyEdge<T> = { node: T };
type ShopifyConnection<T> = { edges: ShopifyEdge<T>[] };

interface ShopifyImage {
  url: string;
  altText?: string | null;
}

interface ShopifyVariant {
  price: { amount: string; currencyCode: string };
  compareAtPrice?: { amount: string; currencyCode: string } | null;
  availableForSale: boolean;
  quantityAvailable?: number | null;
  selectedOptions: { name: string; value: string }[];
}

interface ShopifyProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  productType: string;
  tags: string[];
  totalInventory?: number | null;
  createdAt: string;
  images: ShopifyConnection<ShopifyImage>;
  variants: ShopifyConnection<ShopifyVariant>;
  collections: ShopifyConnection<{ handle: string; title: string }>;
}

interface ShopifyCollection {
  id: string;
  handle: string;
  title: string;
  description: string;
  image?: ShopifyImage | null;
  products: { totalCount: number };
}

async function shopifyFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  if (!hasShopifyConfig()) {
    throw new Error('Shopify Storefront credentials are not configured.');
  }

  const response = await fetch(SHOPIFY_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN as string,
    },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Shopify API request failed: ${response.status}`);
  }

  const json = await response.json();

  if (json.errors?.length) {
    throw new Error(`Shopify GraphQL error: ${json.errors[0].message}`);
  }

  return json.data as T;
}

function mapShopifyProduct(product: ShopifyProduct): Product {
  const primaryVariant = product.variants.edges[0]?.node;
  const compareAt = primaryVariant?.compareAtPrice?.amount
    ? Number(primaryVariant.compareAtPrice.amount)
    : undefined;
  const sizeOption = primaryVariant?.selectedOptions.find(
    (option) => option.name.toLowerCase() === 'size'
  );
  const sizeValues = Array.from(
    new Set(
      product.variants.edges
        .flatMap((edge) => edge.node.selectedOptions)
        .filter((option) => option.name.toLowerCase() === 'size')
        .map((option) => option.value)
    )
  );

  const firstCollection = product.collections.edges[0]?.node;
  const lowerTags = product.tags.map((tag) => tag.toLowerCase());

  return {
    id: product.id,
    slug: product.handle,
    name: product.title,
    price: Number(primaryVariant?.price?.amount ?? 0),
    compareAtPrice: compareAt,
    images: product.images.edges.map((edge) => edge.node.url),
    category: product.productType || 'Jewellery',
    collection: firstCollection?.title || 'Shop All',
    description: product.description || 'No description available.',
    details: product.tags.slice(0, 6),
    sizes: sizeValues.length > 0 ? sizeValues : sizeOption ? [sizeOption.value] : undefined,
    isNew: lowerTags.includes('new') || lowerTags.includes('new-arrival'),
    isBestseller: lowerTags.includes('bestseller') || lowerTags.includes('best-seller'),
    stock: product.totalInventory ?? 0,
  };
}

function mapShopifyCollection(collection: ShopifyCollection): Collection {
  return {
    id: collection.id,
    name: collection.title,
    slug: collection.handle,
    image:
      collection.image?.url ||
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=80',
    description: collection.description || 'Explore this collection on Gijayi.',
    itemCount: collection.products.totalCount,
  };
}

const PRODUCT_FRAGMENT = `
  fragment ProductFields on Product {
    id
    handle
    title
    description
    productType
    tags
    totalInventory
    createdAt
    images(first: 8) {
      edges {
        node {
          url
          altText
        }
      }
    }
    variants(first: 20) {
      edges {
        node {
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
          availableForSale
          quantityAvailable
          selectedOptions {
            name
            value
          }
        }
      }
    }
    collections(first: 3) {
      edges {
        node {
          handle
          title
        }
      }
    }
  }
`;

export async function getAllProducts(): Promise<Product[]> {
  // Always prioritize database products first
  const db = await readDatabase();
  if (db.products && db.products.length > 0) {
    return db.products;
  }

  // Fall back to Shopify if no database products
  if (!hasShopifyConfig()) {
    return fallbackProducts;
  }

  try {
    const data = await shopifyFetch<{ products: ShopifyConnection<ShopifyProduct> }>(`
      ${PRODUCT_FRAGMENT}
      query GetProducts {
        products(first: 100, sortKey: CREATED_AT, reverse: true) {
          edges {
            node {
              ...ProductFields
            }
          }
        }
      }
    `);

    return data.products.edges.map((edge) => mapShopifyProduct(edge.node));
  } catch {
    return fallbackProducts;
  }
}

export async function getProductByHandle(handle: string): Promise<Product | null> {
  // Always prioritize database first
  const db = await readDatabase();
  const dbProduct = db.products.find((product) => product.slug === handle);
  if (dbProduct) {
    return dbProduct;
  }

  // Fall back to Shopify if not in database
  if (!hasShopifyConfig()) {
    return null;
  }

  try {
    const data = await shopifyFetch<{ productByHandle: ShopifyProduct | null }>(`
      ${PRODUCT_FRAGMENT}
      query GetProductByHandle($handle: String!) {
        productByHandle(handle: $handle) {
          ...ProductFields
        }
      }
    `, { handle });

    return data.productByHandle ? mapShopifyProduct(data.productByHandle) : null;
  } catch {
    return null;
  }
}

export async function getAllCollections(): Promise<Collection[]> {
  // Always prioritize database collections first
  const db = await readDatabase();
  if (db.collections && db.collections.length > 0) {
    return db.collections;
  }

  // Fall back to Shopify if no database collections
  if (!hasShopifyConfig()) {
    return fallbackCollections;
  }

  try {
    const data = await shopifyFetch<{ collections: ShopifyConnection<ShopifyCollection> }>(`
      query GetCollections {
        collections(first: 50, sortKey: UPDATED_AT) {
          edges {
            node {
              id
              handle
              title
              description
              image {
                url
                altText
              }
              products {
                totalCount
              }
            }
          }
        }
      }
    `);

    return data.collections.edges.map((edge) => mapShopifyCollection(edge.node));
  } catch {
    return fallbackCollections;
  }
}

export async function getCollectionByHandle(handle: string): Promise<Collection | null> {
  // Always prioritize database first
  const db = await readDatabase();
  const dbCollection = db.collections.find((collection) => collection.slug === handle);
  if (dbCollection) {
    return dbCollection;
  }

  // Fall back to Shopify if not in database
  if (!hasShopifyConfig()) {
    return null;
  }

  try {
    const data = await shopifyFetch<{ collectionByHandle: ShopifyCollection | null }>(`
      query GetCollectionByHandle($handle: String!) {
        collectionByHandle(handle: $handle) {
          id
          handle
          title
          description
          image {
            url
            altText
          }
          products {
            totalCount
          }
        }
      }
    `, { handle });

    return data.collectionByHandle ? mapShopifyCollection(data.collectionByHandle) : null;
  } catch {
    return null;
  }
}

export async function getProductsByCollectionHandle(handle: string): Promise<Product[]> {
  if (!hasShopifyConfig()) {
    const db = await readDatabase();
    return db.products.filter(
      (product) => product.collection.toLowerCase().replace(/\s+/g, '-') === handle
    );
  }

  try {
    const data = await shopifyFetch<{
      collectionByHandle: { products: ShopifyConnection<ShopifyProduct> } | null;
    }>(`
      ${PRODUCT_FRAGMENT}
      query GetProductsByCollection($handle: String!) {
        collectionByHandle(handle: $handle) {
          products(first: 100, sortKey: CREATED_AT, reverse: true) {
            edges {
              node {
                ...ProductFields
              }
            }
          }
        }
      }
    `, { handle });

    if (!data.collectionByHandle) return [];

    return data.collectionByHandle.products.edges.map((edge) => mapShopifyProduct(edge.node));
  } catch {
    const db = await readDatabase();
    return db.products.filter(
      (product) => product.collection.toLowerCase().replace(/\s+/g, '-') === handle
    );
  }
}

export async function getHomeData() {
  const [products, collections] = await Promise.all([getAllProducts(), getAllCollections()]);

  return {
    products,
    collections,
  };
}

export async function getShopData() {
  const products = await getAllProducts();
  const db = await readDatabase();
  const configuredCategories = db.categories.map((category) => category.name).filter(Boolean);
  const categories = ['All', ...(configuredCategories.length ? configuredCategories : Array.from(new Set(products.map((product) => product.category).filter(Boolean))))];

  return { products, categories };
}
