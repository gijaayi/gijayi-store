import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/server/auth';
import { DbUserAddress, readDatabase, sanitizeUser, updateDatabase } from '@/lib/server/database';

function normalizeAddress(input: unknown): DbUserAddress | undefined {
  if (!input || typeof input !== 'object') return undefined;

  const value = input as Record<string, unknown>;

  return {
    firstName: String(value.firstName || '').trim(),
    lastName: String(value.lastName || '').trim(),
    email: String(value.email || '').trim(),
    phone: String(value.phone || '').trim(),
    address: String(value.address || '').trim(),
    city: String(value.city || '').trim(),
    state: String(value.state || '').trim(),
    pincode: String(value.pincode || '').trim(),
    country: String(value.country || 'India').trim() || 'India',
  };
}

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const db = await readDatabase();
  const user = db.users.find((item) => item.id === auth.user.id);

  if (!user) {
    return NextResponse.json({ error: 'User not found.' }, { status: 404 });
  }

  const orders = db.orders
    .filter((order) => order.userId === user.id)
    .map((order) => ({
      id: order.id,
      orderCode: order.orderCode,
      status: order.status,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      itemsCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    }));

  return NextResponse.json({ user: sanitizeUser(user), orders });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAuth(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      name?: string;
      phone?: string;
      defaultAddress?: unknown;
    };

    const name = String(body.name || '').trim();
    const phone = String(body.phone || '').trim();
    const defaultAddress = normalizeAddress(body.defaultAddress);

    if (!name) {
      return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
    }

    let updatedUserId = '';

    await updateDatabase((db) => {
      const user = db.users.find((item) => item.id === auth.user.id);
      if (!user) {
        throw new Error('USER_NOT_FOUND');
      }

      user.name = name;
      user.phone = phone;
      user.defaultAddress = defaultAddress;
      updatedUserId = user.id;

      db.orders.forEach((order) => {
        if (order.userId === user.id) {
          order.userName = user.name;
        }
      });
    });

    const db = await readDatabase();
    const user = db.users.find((item) => item.id === updatedUserId);

    if (!user) {
      return NextResponse.json({ error: 'Profile update failed.' }, { status: 500 });
    }

    return NextResponse.json({ user: sanitizeUser(user) });
  } catch (error) {
    if (error instanceof Error && error.message === 'USER_NOT_FOUND') {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({ error: 'Unable to update profile.' }, { status: 500 });
  }
}
