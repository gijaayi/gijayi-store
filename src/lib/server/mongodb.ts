import 'server-only';

import { MongoClient, Db, ServerDescription } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'gijayi';

if (!MONGODB_URI) {
  throw new Error('Missing MONGODB_URI environment variable.');
}

declare global {
  // eslint-disable-next-line no-var
  var __gijayiMongoClient: MongoClient | undefined;
}

let cachedClient: MongoClient | undefined;
let cachedDb: Db | undefined;

async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb && cachedClient.topology?.isConnected()) {
    return { client: cachedClient, db: cachedDb };
  }

  try {
    const client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 45000,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      retryWrites: true,
      retryReads: true,
    });

    await client.connect();
    
    // Verify connection with a ping
    await client.db('admin').command({ ping: 1 });

    const db = client.db(MONGODB_DB);
    
    cachedClient = client;
    cachedDb = db;

    if (process.env.NODE_ENV !== 'production') {
      global.__gijayiMongoClient = client;
    }

    return { client, db };
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    throw error;
  }
}

export async function getMongoDb(): Promise<Db> {
  const { db } = await connectToDatabase();
  return db;
}

export async function getMongoClient(): Promise<MongoClient> {
  const { client } = await connectToDatabase();
  return client;
}
