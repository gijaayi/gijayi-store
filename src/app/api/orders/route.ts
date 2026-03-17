import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/server/auth';
import { createOrderCode, createOrderId, computeOrderTotals, buildInitialTimeline } from '@/lib/server/order';
import { DbOrderItem, updateDatabase } from '@/lib/server/database';

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const body = await request.json();
    const items = Array.isArray(body.items) ? (body.items as DbOrderItem[]) : [];
    const shipping = body.shipping;
    const paymentMethod = String(body.paymentMethod || '').trim();

    if (!items.length || !shipping || !paymentMethod) {
      return NextResponse.json({ error: 'Invalid order payload.' }, { status: 400 });
    }

    if (!shipping.firstName || !shipping.email || !shipping.address || !shipping.city || !shipping.pincode || !shipping.phone) {
      return NextResponse.json({ error: 'Shipping details are incomplete.' }, { status: 400 });
    }

    let createdOrderCode = '';

    await updateDatabase((db) => {
      createdOrderCode = createOrderCode(db.orders.map((order) => order.orderCode));
      const now = new Date().toISOString();
      const totals = computeOrderTotals(items);

      db.orders.unshift({
        id: createOrderId(),
        orderCode: createdOrderCode,
        userId: auth.user.id,
        userName: auth.user.name,
        userEmail: auth.user.email,
        items,
        shipping: {
          firstName: String(shipping.firstName),
          lastName: String(shipping.lastName || ''),
          email: String(shipping.email),
          phone: String(shipping.phone),
          address: String(shipping.address),
          city: String(shipping.city),
          state: String(shipping.state || ''),
          pincode: String(shipping.pincode),
          country: String(shipping.country || 'India'),
        },
        paymentMethod,
        status: 'Confirmed',
        timeline: buildInitialTimeline(),
        subtotal: totals.subtotal,
        shippingCost: totals.shippingCost,
        totalAmount: totals.totalAmount,
        createdAt: now,
        updatedAt: now,
      });
    });

    return NextResponse.json({ ok: true, orderCode: createdOrderCode });
  } catch {
    return NextResponse.json({ error: 'Unable to place order.' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const { readDatabase } = await import('@/lib/server/database');
  const db = await readDatabase();
  const orders = db.orders.filter((order) => order.userId === auth.user.id);

  return NextResponse.json({ orders });
}
