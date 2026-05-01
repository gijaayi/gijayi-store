// pages/api/admin/fix-product-collections.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getMongoDb } from '@/lib/server/mongodb';

const fixes = [
  { from: 'Bridal', to: 'Bridal Luxe' },
  { from: 'Bridal Collection', to: 'Bridal Luxe' },
  { from: 'Everyday Luxe', to: 'Everyday Minimal' },
  { from: 'Everyday', to: 'Everyday Minimal' },
  { from: 'Heritage', to: 'Heritage' }, // for completeness
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const db = await getMongoDb();
    const products = db.collection('products');
    let total = 0;
    for (const { from, to } of fixes) {
      const result = await products.updateMany(
        { collection: from },
        { $set: { collection: to } }
      );
      total += result.modifiedCount;
    }
    return res.status(200).json({ message: `Updated ${total} products.` });
  } catch (err) {
    return res.status(500).json({ error: err?.toString() });
  }
}
