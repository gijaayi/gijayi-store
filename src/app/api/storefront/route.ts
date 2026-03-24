import { NextResponse } from 'next/server';
import { readDatabase } from '@/lib/server/database';

export async function GET() {
  const db = await readDatabase();
  return NextResponse.json({ storefront: db.storefront });
}
