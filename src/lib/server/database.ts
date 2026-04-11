import 'server-only';

import { randomUUID } from 'crypto';
import type { Document } from 'mongodb';
import { Collection, Product } from '@/lib/types';
import { collections as seedCollections, products as seedProducts } from '@/lib/data';
import { hashPassword } from './password';
import { getMongoDb } from './mongodb';

export interface DbUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'user';
  phone?: string;
  defaultAddress?: DbUserAddress;
  hasPlacedOrder: boolean;
  createdAt: string;
}

export interface DbUserAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface DbContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  topic: string;
  message: string;
  status: 'new' | 'closed';
  createdAt: string;
}

export interface DbOrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  image?: string;
}

export interface DbTimelineEvent {
  label: string;
  time: string;
}

export interface DbOrder {
  id: string;
  orderCode: string;
  userId: string;
  userName: string;
  userEmail: string;
  items: DbOrderItem[];
  shipping: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  paymentMethod: string;
  paymentDetails?: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    currency: string;
    exchangeRate: number;
  };
  status: 'Confirmed' | 'Preparing for Dispatch' | 'In Transit' | 'Delivered';
  timeline: DbTimelineEvent[];
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
  estimatedDeliveryDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbCarouselBanner {
  id: string;
  image: string;
  headline: string;
  subtitle: string;
}

export interface DbStorefrontHero {
  badge: string;
  title: string;
  subtitle: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  heroImage: string;
  featureLabel: string;
  featureTitle: string;
  featureSubtitle: string;
  secondaryMedia: {
    enabled: boolean;
    image: string;
    label: string;
    title: string;
    href: string;
  };
}

export interface DbStorefrontCarousel {
  id: string;
  banners: DbCarouselBanner[];
}

export interface DbStorefrontTrustSignal {
  title: string;
  desc: string;
}

export interface DbStorefrontTestimonial {
  name: string;
  location: string;
  text: string;
  rating: number;
}

export interface DbStorefrontSettings {
  id: string;
  navigation: {
    shop: {
      label: string;
      subcategories: string[];
    };
    gijayiEdit: {
      label: string;
      subcategories: string[];
    };
    freshArrival: {
      label: string;
    };
  };
  hero: DbStorefrontHero;
  carousel: DbStorefrontCarousel;
  luxurySignals: string[];
  trustSection: {
    badge: string;
    title: string;
    subtitle: string;
  };
  trustSignals: DbStorefrontTrustSignal[];
  testimonialsSection: {
    badge: string;
    title: string;
    subtitle: string;
    testimonials: DbStorefrontTestimonial[];
  };
  productCard: {
    quickAddLabel: string;
    quickViewLabel: string;
    newBadgeLabel: string;
    bestsellerBadgeLabel: string;
    saleBadgeSuffix: string;
    ratingValue: string;
    ratingCountLabel: string;
  };
  updatedAt: string;
}

export interface DatabaseState {
  users: DbUser[];
  products: Product[];
  collections: Collection[];
  categories: DbCategory[];
  contacts: DbContact[];
  orders: DbOrder[];
  storefront: DbStorefrontSettings;
  instagramGallery: DbInstagramGallery;
}

export interface DbInstagramImage {
  id: string;
  url: string;
  uploadedAt: string;
}

export interface DbInstagramGallery {
  id: string;
  images: DbInstagramImage[];
  handle: string;
  profileUrl: string;
  maxImages: number;
  updatedAt: string;
}

export interface DbCategory {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export const DEFAULT_PRODUCT_CATEGORIES = [
  'Necklaces',
  'Earrings',
  'Bangles',
  'Maang Tikka',
  'Waistbands',
  'Nose Rings',
  'Anklets',
  'Watches',
  'Smart Watches',
  'Body Jewelry',
  'Bracelets',
  'Brooches & Lapel Pins',
  'Pendants Set',
  'Jwellery Sets',
  'Rings',
  'Baguette Handbags',
  'Fold Over Clutches',
  'Half-Moon Bags',
  'Hobo bags',
  'Minaudieres',
  'Muff Clutches & Bags',
  'Saddle Bags',
  'Satchel Bags',
  'School Bags',
  'Shopper Bags',
  'Shoulder Bag',
  'Barrel Bags',
  'Trapezoid Bags',
  'Beach Bags',
  'Bucket Bags',
  'Clutch Bags',
  'Convertible Bags',
  'Cross Body Bags',
  'Doctor Bags',
  'Envelope Clutches',
];

let writeQueue: Promise<void> = Promise.resolve();
let fallbackState: DatabaseState | null = null;

const ADMIN_LOGIN_EMAIL = (process.env.ADMIN_LOGIN_EMAIL || 'admin@gijayi.com').trim().toLowerCase() || 'admin@gijayi.com';
const ADMIN_LOGIN_PASSWORD = process.env.ADMIN_LOGIN_PASSWORD || 'Admin@123';
const ADMIN_NAME = 'Platform Admin';

export const DEFAULT_STOREFRONT_CAROUSEL: DbStorefrontCarousel = {
  id: 'carousel-config',
  banners: [
    {
      id: 'banner-1',
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1400&q=90',
      headline: 'Handcrafted Bridal Luxury',
      subtitle: 'Statement jewelry designed for grand wedding celebrations.',
    },
    {
      id: 'banner-2',
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1400&q=90',
      headline: 'Timeless Kundan & Polki',
      subtitle: 'Classic Indian artistry with modern, wearable elegance.',
    },
    {
      id: 'banner-3',
      image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1400&q=90',
      headline: 'Made in India Craftsmanship',
      subtitle: 'Every detail is handcrafted with premium materials.',
    },
    {
      id: 'banner-4',
      image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=1400&q=90',
      headline: 'Affordable Designer Jewelry',
      subtitle: 'Luxury-inspired looks at fair prices.',
    },
  ],
};

export const DEFAULT_STOREFRONT_SETTINGS: DbStorefrontSettings = {
  id: 'storefront-config',
  navigation: {
    shop: {
      label: 'Shop',
      subcategories: ['Earrings', 'Neck Pieces', 'Hand Accessories', 'Head Gears', 'Brooches'],
    },
    gijayiEdit: {
      label: 'Gijayi Edit',
      subcategories: ['Bano', 'Begum', 'Bi', 'Khatoon', 'Khanam', 'Naaz'],
    },
    freshArrival: {
      label: 'Fresh Arrival',
    },
  },
  carousel: cloneState(DEFAULT_STOREFRONT_CAROUSEL),
  hero: {
    badge: 'Handcrafted Indian Jewellery',
    title: 'Handcrafted Bridal & Statement Jewelry',
    subtitle:
      'Unique designs, fair prices, made in India.',
    primaryCtaLabel: 'Explore Collection',
    primaryCtaHref: '/shop',
    secondaryCtaLabel: 'Explore Collections',
    secondaryCtaHref: '/collections',
    heroImage: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=90',
    featureLabel: 'Featured Drop',
    featureTitle: 'Heritage Edit',
    featureSubtitle: '18 statement pieces inspired by royal Indian silhouettes.',
    secondaryMedia: {
      enabled: false,
      image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=900&q=90',
      label: 'Craft Spotlight',
      title: 'Atelier Details',
      href: '/about',
    },
  },
  luxurySignals: ['Handmade in India', 'Quality Materials', 'Proudly trusted by customers across India'],
  trustSection: {
    badge: 'Why Gijayi',
    title: 'Confidence at Every Step',
    subtitle: 'From authenticity to delivery, every stage is designed for premium confidence.',
  },
  trustSignals: [
    { title: 'Certified Authentic', desc: 'Every piece includes authenticity-backed quality checks.' },
    { title: 'Premium Shipping', desc: 'Safe and trackable delivery with complimentary packaging.' },
    { title: 'Easy Returns', desc: 'Simple return support with assisted pickup flow.' },
    { title: 'Style Concierge', desc: 'Personal guidance for bridal, gifting, and festive edits.' },
  ],
  testimonialsSection: {
    badge: 'Loved By Customers',
    title: 'Trusted Across India',
    subtitle: 'Proudly trusted by customers across India for handcrafted Indian jewelry and bridal jewelry online.',
    testimonials: [
      {
        name: 'Nisha Kapoor',
        location: 'Mumbai',
        text: 'Beautiful handcrafted Indian jewelry and quick delivery. Perfect for my wedding functions.',
        rating: 5,
      },
      {
        name: 'Aarohi Mehta',
        location: 'Hyderabad',
        text: 'Loved the quality materials and finish. Bridal jewelry online that actually looks premium.',
        rating: 5,
      },
      {
        name: 'Sana Rizvi',
        location: 'Lucknow',
        text: 'Affordable designer jewelry with classy packaging. Great support on WhatsApp too.',
        rating: 5,
      },
    ],
  },
  productCard: {
    quickAddLabel: 'Quick Add',
    quickViewLabel: 'Quick View',
    newBadgeLabel: 'New',
    bestsellerBadgeLabel: 'Bestseller',
    saleBadgeSuffix: 'Off',
    ratingValue: '4.8',
    ratingCountLabel: '(24 reviews)',
  },
  updatedAt: new Date().toISOString(),
};

export const DEFAULT_INSTAGRAM_GALLERY: DbInstagramGallery = {
  id: 'instagram-gallery-config',
  handle: 'begijayi',
  profileUrl: 'https://instagram.com/begijayi',
  maxImages: 6,
  images: [
    {
      id: '1',
      url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80',
      uploadedAt: new Date().toISOString(),
    },
    {
      id: '2',
      url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80',
      uploadedAt: new Date().toISOString(),
    },
    {
      id: '3',
      url: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=400&q=80',
      uploadedAt: new Date().toISOString(),
    },
    {
      id: '4',
      url: 'https://images.unsplash.com/photo-1584811644165-33078f50eb15?w=400&q=80',
      uploadedAt: new Date().toISOString(),
    },
    {
      id: '5',
      url: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=400&q=80',
      uploadedAt: new Date().toISOString(),
    },
    {
      id: '6',
      url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=81',
      uploadedAt: new Date().toISOString(),
    },
  ],
  updatedAt: new Date().toISOString(),
};

function cloneState<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

async function getFallbackState(): Promise<DatabaseState> {
  if (!fallbackState) {
    const adminHash = await hashPassword(ADMIN_LOGIN_PASSWORD);

    fallbackState = {
      users: [
        {
          id: randomUUID(),
          name: ADMIN_NAME,
          email: ADMIN_LOGIN_EMAIL,
          passwordHash: adminHash,
          role: 'admin',
          phone: '',
          hasPlacedOrder: false,
          createdAt: new Date().toISOString(),
        },
      ],
      products: cloneState(seedProducts),
      collections: cloneState(seedCollections),
      categories: DEFAULT_PRODUCT_CATEGORIES.map((name) => ({
        id: randomUUID(),
        name,
        slug: slugify(name),
        createdAt: new Date().toISOString(),
      })),
      contacts: [],
      orders: [],
      storefront: cloneState(DEFAULT_STOREFRONT_SETTINGS),
      instagramGallery: cloneState(DEFAULT_INSTAGRAM_GALLERY),
    };
  }

  return cloneState(fallbackState!)
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function withoutMongoId<T>(doc: T & Document): T {
  const { _id, ...rest } = doc;
  void _id;
  return rest as T;
}

function normalizeStorefrontSettings(value: Partial<DbStorefrontSettings> | undefined): DbStorefrontSettings {
  return {
    ...DEFAULT_STOREFRONT_SETTINGS,
    ...value,
    navigation: {
      shop: {
        ...DEFAULT_STOREFRONT_SETTINGS.navigation.shop,
        ...(value?.navigation?.shop || {}),
        subcategories:
          value?.navigation?.shop?.subcategories && value.navigation.shop.subcategories.length
            ? value.navigation.shop.subcategories
            : DEFAULT_STOREFRONT_SETTINGS.navigation.shop.subcategories,
      },
      gijayiEdit: {
        ...DEFAULT_STOREFRONT_SETTINGS.navigation.gijayiEdit,
        ...(value?.navigation?.gijayiEdit || {}),
        subcategories:
          value?.navigation?.gijayiEdit?.subcategories && value.navigation.gijayiEdit.subcategories.length
            ? value.navigation.gijayiEdit.subcategories
            : DEFAULT_STOREFRONT_SETTINGS.navigation.gijayiEdit.subcategories,
      },
      freshArrival: {
        ...DEFAULT_STOREFRONT_SETTINGS.navigation.freshArrival,
        ...(value?.navigation?.freshArrival || {}),
      },
    },
    hero: {
      ...DEFAULT_STOREFRONT_SETTINGS.hero,
      ...(value?.hero || {}),
      secondaryMedia: {
        ...DEFAULT_STOREFRONT_SETTINGS.hero.secondaryMedia,
        ...(value?.hero?.secondaryMedia || {}),
      },
    },
    productCard: {
      ...DEFAULT_STOREFRONT_SETTINGS.productCard,
      ...(value?.productCard || {}),
    },
    trustSection: {
      ...DEFAULT_STOREFRONT_SETTINGS.trustSection,
      ...(value?.trustSection || {}),
    },
    testimonialsSection: {
      ...DEFAULT_STOREFRONT_SETTINGS.testimonialsSection,
      ...(value?.testimonialsSection || {}),
      testimonials:
        value?.testimonialsSection?.testimonials && value.testimonialsSection.testimonials.length
          ? value.testimonialsSection.testimonials
          : DEFAULT_STOREFRONT_SETTINGS.testimonialsSection.testimonials,
    },
    carousel: {
      id: value?.carousel?.id || DEFAULT_STOREFRONT_SETTINGS.carousel?.id || 'carousel-config',
      banners:
        value?.carousel?.banners && value.carousel.banners.length
          ? value.carousel.banners
          : DEFAULT_STOREFRONT_SETTINGS.carousel?.banners || [],
    },
    luxurySignals:
      value?.luxurySignals && value.luxurySignals.length
        ? value.luxurySignals
        : DEFAULT_STOREFRONT_SETTINGS.luxurySignals,
    trustSignals:
      value?.trustSignals && value.trustSignals.length
        ? value.trustSignals
        : DEFAULT_STOREFRONT_SETTINGS.trustSignals,
    updatedAt: value?.updatedAt || DEFAULT_STOREFRONT_SETTINGS.updatedAt,
  };
}

async function ensureIndexes() {
  const db = await getMongoDb();
  await Promise.all([
    db.collection<DbUser>('users').createIndex({ email: 1 }, { unique: true }),
    db.collection<Product>('products').createIndex({ slug: 1 }, { unique: true }),
    db.collection<DbOrder>('orders').createIndex({ orderCode: 1 }, { unique: true }),
    db.collection<DbCategory>('categories').createIndex({ slug: 1 }, { unique: true }),
  ]);
}

async function ensureDatabase(): Promise<void> {
  await ensureIndexes();
  const db = await getMongoDb();

  const usersCollection = db.collection<DbUser>('users');
  const productsCollection = db.collection<Product>('products');
  const collectionsCollection = db.collection<Collection>('collections');
  const categoriesCollection = db.collection<DbCategory>('categories');
  const storefrontCollection = db.collection<DbStorefrontSettings>('storefront');

  const [usersCount, productsCount, collectionsCount, categoriesCount, storefrontCount] = await Promise.all([
    usersCollection.estimatedDocumentCount(),
    productsCollection.estimatedDocumentCount(),
    collectionsCollection.estimatedDocumentCount(),
    categoriesCollection.estimatedDocumentCount(),
    storefrontCollection.estimatedDocumentCount(),
  ]);

  const configuredAdminHash = await hashPassword(ADMIN_LOGIN_PASSWORD);

  if (usersCount === 0) {
    await usersCollection.insertOne({
      id: randomUUID(),
      name: ADMIN_NAME,
      email: ADMIN_LOGIN_EMAIL,
      passwordHash: configuredAdminHash,
      role: 'admin',
      phone: '',
      hasPlacedOrder: false,
      createdAt: new Date().toISOString(),
    });
  } else {
    const existingAdmin =
      (await usersCollection.findOne({ role: 'admin' })) || (await usersCollection.findOne({ email: ADMIN_LOGIN_EMAIL }));

    if (existingAdmin) {
      await usersCollection.updateOne(
        { id: existingAdmin.id },
        {
          $set: {
            name: existingAdmin.name || ADMIN_NAME,
            email: ADMIN_LOGIN_EMAIL,
            passwordHash: configuredAdminHash,
            role: 'admin',
          },
        },
      );
    } else {
      await usersCollection.insertOne({
        id: randomUUID(),
        name: ADMIN_NAME,
        email: ADMIN_LOGIN_EMAIL,
        passwordHash: configuredAdminHash,
        role: 'admin',
        phone: '',
        hasPlacedOrder: false,
        createdAt: new Date().toISOString(),
      });
    }
  }

  if (productsCount === 0 && seedProducts.length) {
    await productsCollection.insertMany(seedProducts);
  }

  if (collectionsCount === 0 && seedCollections.length) {
    await collectionsCollection.insertMany(seedCollections);
  }

  if (categoriesCount === 0) {
    const categories = DEFAULT_PRODUCT_CATEGORIES.map((name) => ({
      id: randomUUID(),
      name,
      slug: slugify(name),
      createdAt: new Date().toISOString(),
    }));

    if (categories.length) {
      await categoriesCollection.insertMany(categories);
    }
  }

  if (storefrontCount === 0) {
    const defaultSettings = cloneState(DEFAULT_STOREFRONT_SETTINGS);
    await storefrontCollection.insertOne(defaultSettings);
  } else {
    const existing = await storefrontCollection.findOne({ id: 'storefront-config' });
    if (existing && !existing.carousel) {
      await storefrontCollection.updateOne(
        { id: 'storefront-config' },
        { $set: { carousel: cloneState(DEFAULT_STOREFRONT_CAROUSEL) } },
      );
    }
  }

  const instagramGalleryCollection = db.collection<DbInstagramGallery>('instagramGallery');
  const instagramCount = await instagramGalleryCollection.estimatedDocumentCount();

  if (instagramCount === 0) {
    const defaultGallery = cloneState(DEFAULT_INSTAGRAM_GALLERY);
    await instagramGalleryCollection.insertOne(defaultGallery);
  }
}

export async function readDatabase(): Promise<DatabaseState> {
  try {
    await ensureDatabase();
    const db = await getMongoDb();

    const [users, products, collections, categories, contacts, orders, storefront, instagramGallery] = await Promise.all([
      db.collection<DbUser>('users').find({}).toArray(),
      db.collection<Product>('products').find({}).toArray(),
      db.collection<Collection>('collections').find({}).toArray(),
      db.collection<DbCategory>('categories').find({}).toArray(),
      db.collection<DbContact>('contacts').find({}).toArray(),
      db.collection<DbOrder>('orders').find({}).toArray(),
      db.collection<DbStorefrontSettings>('storefront').findOne({ id: 'storefront-config' }),
      db.collection<DbInstagramGallery>('instagramGallery').findOne({ id: 'instagram-gallery-config' }),
    ]);

    const storefrontSettings = storefront
      ? normalizeStorefrontSettings(withoutMongoId<DbStorefrontSettings>(storefront as DbStorefrontSettings & Document))
      : DEFAULT_STOREFRONT_SETTINGS;

    const instagramGallerySettings = instagramGallery
      ? withoutMongoId<DbInstagramGallery>(instagramGallery as DbInstagramGallery & Document)
      : DEFAULT_INSTAGRAM_GALLERY;

    return {
      users: users.map((user) => withoutMongoId<DbUser>(user)),
      products: products.map((product) => withoutMongoId<Product>(product)),
      collections: collections.map((collection) => withoutMongoId<Collection>(collection)),
      categories: categories.map((category) => withoutMongoId<DbCategory>(category)),
      contacts: contacts.map((contact) => withoutMongoId<DbContact>(contact)),
      orders: orders.map((order) => withoutMongoId<DbOrder>(order)),
      storefront: storefrontSettings,
      instagramGallery: instagramGallerySettings,
    };
  } catch (error) {
    console.warn('MongoDB unavailable. Using in-memory fallback state.', error);
    return getFallbackState();
  }
}

async function writeState(dbState: DatabaseState) {
  const db = await getMongoDb();

  async function replaceCollection(name: string, docs: Document[]) {
    const collection = db.collection(name);
    await collection.deleteMany({});
    if (docs.length) {
      await collection.insertMany(docs);
    }
  }

  await Promise.all([
    replaceCollection('users', dbState.users as unknown as Document[]),
    replaceCollection('products', dbState.products as unknown as Document[]),
    replaceCollection('collections', dbState.collections as unknown as Document[]),
    replaceCollection('categories', dbState.categories as unknown as Document[]),
    replaceCollection('contacts', dbState.contacts as unknown as Document[]),
    replaceCollection('orders', dbState.orders as unknown as Document[]),
    replaceCollection('storefront', [dbState.storefront as unknown as Document]),
    replaceCollection('instagramGallery', [dbState.instagramGallery as unknown as Document]),
  ]);
}

export async function updateDatabase(updater: (db: DatabaseState) => void | Promise<void>): Promise<DatabaseState> {
  let result: DatabaseState | null = null;

  writeQueue = writeQueue.then(async () => {
    const db = await readDatabase();
    await updater(db);
    try {
      await writeState(db);
    } catch {
      fallbackState = cloneState(db);
    }
    result = db;
  });

  await writeQueue;

  if (!result) {
    return readDatabase();
  }

  return result;
}

export function sanitizeUser(user: DbUser) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || '',
    defaultAddress: user.defaultAddress,
    createdAt: user.createdAt,
  };
}

export function getPublicOrderView(order: DbOrder) {
  return {
    orderCode: order.orderCode,
    status: order.status,
    eta:
      order.status === 'Delivered'
        ? 'Delivered successfully'
        : order.status === 'In Transit'
          ? 'Your parcel is on the way'
          : 'Your order is being prepared',
    timeline: order.timeline,
    updatedAt: order.updatedAt,
  };
}
