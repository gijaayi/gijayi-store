import { NextResponse } from 'next/server';
import { getPublicOrderView, readDatabase } from '@/lib/server/database';

interface Context {
  params: Promise<{ orderCode: string }>;
}

export async function GET(_: Request, context: Context) {
  const { orderCode } = await context.params;
  const normalizedCode = orderCode.trim().toUpperCase();

  const db = await readDatabase();
  const order = db.orders.find((item) => item.orderCode.toUpperCase() === normalizedCode);

  if (!order) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  }

  return NextResponse.json({ order: getPublicOrderView(order) });
}
