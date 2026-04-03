import 'server-only';

import { MongoClient, Db } from 'mongodb';
const RAW_MONGODB_URI = process.env.MONGODB_URI;
const RAW_MONGODB_DB = process.env.MONGODB_DB;

function normalizeMongoUri(uri: string | undefined): string {
  if (!uri) {
    return '';
  }

  const trimmedUri = uri.trim();

  if (
    (trimmedUri.startsWith('"') && trimmedUri.endsWith('"')) ||
    (trimmedUri.startsWith("'") && trimmedUri.endsWith("'"))
  ) {
    return trimmedUri.slice(1, -1).trim();
  }

  return trimmedUri;
}

function extractDatabaseNameFromUri(uri: string): string | undefined {
  try {
    const parsedUri = new URL(uri);
    const dbName = parsedUri.pathname.replace(/^\//, '').trim();
    return dbName || undefined;
  } catch {
    return undefined;
  }
}

function normalizeMongoDbName(dbName: string | undefined): string {
  if (!dbName) {
    return '';
  }

  const trimmedDbName = dbName.trim();

  if (
    (trimmedDbName.startsWith('"') && trimmedDbName.endsWith('"')) ||
    (trimmedDbName.startsWith("'") && trimmedDbName.endsWith("'"))
  ) {
    return trimmedDbName.slice(1, -1).trim();
  }

  return trimmedDbName;
}

const MONGODB_URI = normalizeMongoUri(RAW_MONGODB_URI);
const MONGODB_DB =
  normalizeMongoDbName(RAW_MONGODB_DB) || extractDatabaseNameFromUri(MONGODB_URI) || 'Gijayi';

if (!MONGODB_URI) {
  throw new Error('Missing MONGODB_URI environment variable.');
}

if (!MONGODB_URI.startsWith('mongodb://') && !MONGODB_URI.startsWith('mongodb+srv://')) {
  throw new Error(
    'Invalid MONGODB_URI format. It must start with "mongodb://" or "mongodb+srv://". ' +
      'If you set this in Vercel, remove any extra quotes around the value.'
  );
}

declare global {
  // eslint-disable-next-line no-var
  var __gijayiMongoClient: MongoClient | undefined;
}

let cachedClient: MongoClient | undefined;
let cachedDb: Db | undefined;

async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  // Return cached connection if it's already established
  if (cachedClient && cachedDb) {
    try {
      // Verify the connection is still alive with a quick ping
      await cachedClient.db('admin').command({ ping: 1 }).catch(() => {
        // Connection is dead, will reconnect below
        cachedClient = undefined;
        cachedDb = undefined;
      });
      
      if (cachedClient && cachedDb) {
        return { client: cachedClient, db: cachedDb };
      }
    } catch {
      // Connection failed, will reconnect
      cachedClient = undefined;
      cachedDb = undefined;
    }
  }

  let lastError: Error | null = null;
  const maxRetries = 3;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`MongoDB connection attempt ${attempt}/${maxRetries}...`);
      
      const client = new MongoClient(MONGODB_URI, {
        maxPoolSize: 10,
        minPoolSize: 2,
        maxIdleTimeMS: 45000,
        socketTimeoutMS: 60000,
        serverSelectionTimeoutMS: 20000,
        connectTimeoutMS: 20000,
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

      console.log('MongoDB connected successfully');
      return { client, db };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`MongoDB connection attempt ${attempt} failed:`, lastError.message);
      
      if (attempt < maxRetries) {
        // Wait before retrying (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  console.error('MongoDB connection failed after all retries:', lastError?.message);
  throw lastError || new Error('Failed to connect to MongoDB');
}

export async function getMongoDb(): Promise<Db> {
  const { db } = await connectToDatabase();
  return db;
}

export async function getMongoClient(): Promise<MongoClient> {
  const { client } = await connectToDatabase();
  return client;
}
