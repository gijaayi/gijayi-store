import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/auth';
import { updateDatabase } from '@/lib/server/database';

interface Context {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, context: Context) {
  const auth = await requireAdmin(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === 'Forbidden' ? 403 : 401 });
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const status = String(body.status || '').trim();

    if (!status) {
      return NextResponse.json({ error: 'Status is required.' }, { status: 400 });
    }

    const db = await updateDatabase((state) => {
      const order = state.orders.find((item) => item.id === id);
      if (!order) {
        throw new Error('NOT_FOUND');
      }

      order.status = status as typeof order.status;
      order.updatedAt = new Date().toISOString();
      order.timeline.unshift({
        label: `Status updated to ${status}`,
        time: new Date().toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }),
      });
    });

    return NextResponse.json({ orders: db.orders });
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    return NextResponse.json({ error: 'Unable to update order.' }, { status: 500 });
  }
}
