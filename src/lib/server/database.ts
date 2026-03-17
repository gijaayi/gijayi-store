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
  createdAt: string;
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
  status: 'Confirmed' | 'Preparing for Dispatch' | 'In Transit' | 'Delivered';
  timeline: DbTimelineEvent[];
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseState {
  users: DbUser[];
  products: Product[];
  collections: Collection[];
  categories: DbCategory[];
  contacts: DbContact[];
  orders: DbOrder[];
}

export interface DbCategory {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

let writeQueue: Promise<void> = Promise.resolve();

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

  const [usersCount, productsCount, collectionsCount, categoriesCount] = await Promise.all([
    usersCollection.estimatedDocumentCount(),
    productsCollection.estimatedDocumentCount(),
    collectionsCollection.estimatedDocumentCount(),
    categoriesCollection.estimatedDocumentCount(),
  ]);

  if (usersCount === 0) {
    const adminHash = await hashPassword('Admin@123');
    await usersCollection.insertOne({
      id: randomUUID(),
      name: 'Platform Admin',
      email: 'admin@gijayi.com',
      passwordHash: adminHash,
      role: 'admin',
      createdAt: new Date().toISOString(),
    });
  }

  if (productsCount === 0 && seedProducts.length) {
    await productsCollection.insertMany(seedProducts);
  }

  if (collectionsCount === 0 && seedCollections.length) {
    await collectionsCollection.insertMany(seedCollections);
  }

  if (categoriesCount === 0) {
    const categories = Array.from(new Set(seedProducts.map((product) => product.category).filter(Boolean))).map((name) => ({
      id: randomUUID(),
      name,
      slug: slugify(name),
      createdAt: new Date().toISOString(),
    }));

    if (categories.length) {
      await categoriesCollection.insertMany(categories);
    }
  }
}

export async function readDatabase(): Promise<DatabaseState> {
  await ensureDatabase();
  const db = await getMongoDb();

  const [users, products, collections, categories, contacts, orders] = await Promise.all([
    db.collection<DbUser>('users').find({}).toArray(),
    db.collection<Product>('products').find({}).toArray(),
    db.collection<Collection>('collections').find({}).toArray(),
    db.collection<DbCategory>('categories').find({}).toArray(),
    db.collection<DbContact>('contacts').find({}).toArray(),
    db.collection<DbOrder>('orders').find({}).toArray(),
  ]);

  return {
    users: users.map((user) => withoutMongoId<DbUser>(user)),
    products: products.map((product) => withoutMongoId<Product>(product)),
    collections: collections.map((collection) => withoutMongoId<Collection>(collection)),
    categories: categories.map((category) => withoutMongoId<DbCategory>(category)),
    contacts: contacts.map((contact) => withoutMongoId<DbContact>(contact)),
    orders: orders.map((order) => withoutMongoId<DbOrder>(order)),
  };
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
  ]);
}

export async function updateDatabase(updater: (db: DatabaseState) => void | Promise<void>): Promise<DatabaseState> {
  let result: DatabaseState | null = null;

  writeQueue = writeQueue.then(async () => {
    const db = await readDatabase();
    await updater(db);
    await writeState(db);
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
