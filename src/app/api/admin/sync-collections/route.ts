import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/auth';
import { readDatabase, updateDatabase } from '@/lib/server/database';
import { Collection } from '@/lib/types';

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === 'Forbidden' ? 403 : 401 });
  }

  try {
    const db = await readDatabase();
    
    // Get all unique collections from products
    const productCollections = new Set(
      db.products
        .map((p) => p.collection)
        .filter(Boolean)
        .filter((c) => c !== '')
    );

    // Import seed collections to ensure defaults are preserved
    const { collections: seedCollections } = await import('@/lib/data');
    
    // Start with default seeded collections to ensure they're always present
    // If db.collections is missing or corrupted, use seedCollections as base
    const baseCollections = db.collections && db.collections.length > 0 
      ? db.collections 
      : seedCollections;

    // Update existing collections with product counts, preserve original definitions
    const updatedCollections: Collection[] = baseCollections.map((collection) => {
      const itemCount = db.products.filter((p) => p.collection === collection.name).length;
      return { ...collection, itemCount };
    });

    // Add any new collections that don't exist yet (from products added with new collection names)
    const existingNames = new Set(updatedCollections.map((c) => c.name));
    const newCollections = Array.from(productCollections)
      .filter((name) => !existingNames.has(name))
      .map((collectionName, index) => ({
        id: String(updatedCollections.length + index + 1),
        name: collectionName,
        slug: slugify(collectionName),
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=80',
        description: `Collection: ${collectionName}`,
        itemCount: db.products.filter((p) => p.collection === collectionName).length,
      }));

    const allCollections = [...updatedCollections, ...newCollections];

    // Update database with synced collections
    await updateDatabase((state) => {
      state.collections = allCollections;
    });

    return NextResponse.json({
      message: 'Collections synced successfully',
      collections: allCollections,
      count: allCollections.length,
    });
  } catch (err) {
    console.error('Error syncing collections:', err);
    return NextResponse.json(
      { error: 'Failed to sync collections.' },
      { status: 500 }
    );
  }
}
