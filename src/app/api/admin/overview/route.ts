import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/auth';
import { readDatabase } from '@/lib/server/database';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === 'Forbidden' ? 403 : 401 });
  }

  const db = await readDatabase();
  const revenue = db.orders.reduce((sum, order) => sum + order.totalAmount, 0);

  return NextResponse.json({
    stats: {
      users: db.users.length,
      products: db.products.length,
      categories: db.categories.length,
      orders: db.orders.length,
      contacts: db.contacts.length,
      revenue,
    },
    latestOrders: db.orders.slice(0, 8),
    latestContacts: db.contacts.slice(0, 8),
  });
}
