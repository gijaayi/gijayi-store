import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/server/auth';
import { createOrderCode, createOrderId, computeOrderTotals, buildInitialTimeline } from '@/lib/server/order';
import { DbOrderItem, updateDatabase } from '@/lib/server/database';
import crypto from 'crypto';
import { sendOrderConfirmationEmail } from '@/lib/server/email';

function addBusinessDays(fromDate: Date, days: number) {
  const date = new Date(fromDate);
  let added = 0;

  while (added < days) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day !== 0 && day !== 6) {
      added += 1;
    }
  }

  return date;
}

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
    const paymentDetails = body.paymentDetails;

    if (!items.length || !shipping || !paymentMethod) {
      return NextResponse.json({ error: 'Invalid order payload.' }, { status: 400 });
    }

    if (paymentMethod.toLowerCase() === 'cod') {
      return NextResponse.json({ error: 'Cash on delivery is not available.' }, { status: 400 });
    }

    const validPaymentMethods = ['razorpay', 'paypal'];
    if (!validPaymentMethods.includes(paymentMethod.toLowerCase())) {
      return NextResponse.json({ error: 'Invalid payment method. Supported methods: Razorpay, PayPal.' }, { status: 400 });
    }

    if (!shipping.firstName || !shipping.email || !shipping.address || !shipping.city || !shipping.pincode || !shipping.phone) {
      return NextResponse.json({ error: 'Shipping details are incomplete.' }, { status: 400 });
    }

    // Validate based on payment method
    if (paymentMethod.toLowerCase() === 'razorpay') {
      const RAZORPAY_KEY_SECRET_CONFIG = process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_LIVE_KEY_SECRET || process.env.RAZORPAY_TEST_KEY_SECRET || '';
      
      if (!RAZORPAY_KEY_SECRET_CONFIG) {
        return NextResponse.json({ error: 'Razorpay not configured.' }, { status: 500 });
      }

      const razorpayOrderId = String(paymentDetails?.razorpayOrderId || '').trim();
      const razorpayPaymentId = String(paymentDetails?.razorpayPaymentId || '').trim();
      const razorpaySignature = String(paymentDetails?.razorpaySignature || '').trim();

      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return NextResponse.json({ error: 'Razorpay payment details are missing.' }, { status: 400 });
      }

      const hmac = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET_CONFIG);
      hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
      const digest = hmac.digest('hex');

      if (digest !== razorpaySignature) {
        return NextResponse.json({ error: 'Razorpay payment verification failed.' }, { status: 400 });
      }
    } else if (paymentMethod.toLowerCase() === 'paypal') {
      const paypalOrderId = String(paymentDetails?.paypalOrderId || '').trim();
      const paypalPaymentId = String(paymentDetails?.paypalPaymentId || '').trim();
      const paypalStatus = String(paymentDetails?.status || '').trim();

      if (!paypalOrderId || !paypalPaymentId || paypalStatus !== 'COMPLETED') {
        return NextResponse.json({ error: 'PayPal payment verification failed.' }, { status: 400 });
      }
    }

    const razorpayOrderId = String(paymentDetails?.razorpayOrderId || '').trim();
    const razorpayPaymentId = String(paymentDetails?.razorpayPaymentId || '').trim();
    const razorpaySignature = String(paymentDetails?.razorpaySignature || '').trim();
    const currency = String(paymentDetails?.currency || 'INR').toUpperCase();
    const exchangeRate = Number(paymentDetails?.exchangeRate || 1);

    let createdOrderCode = '';
    let createdTotalAmount = 0;
    let createdEstimatedDeliveryDate = '';

    await updateDatabase((db) => {
      createdOrderCode = createOrderCode(db.orders.map((order) => order.orderCode));
      const now = new Date().toISOString();
      const totals = computeOrderTotals(items);
      createdTotalAmount = totals.totalAmount;
      createdEstimatedDeliveryDate = addBusinessDays(new Date(), 5).toISOString();

      const user = db.users.find((u) => u.id === auth.user.id);
      if (user && !user.hasPlacedOrder) {
        user.hasPlacedOrder = true;
      }

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
        paymentDetails: {
          razorpayOrderId,
          razorpayPaymentId,
          currency,
          exchangeRate: Number.isFinite(exchangeRate) && exchangeRate > 0 ? exchangeRate : 1,
        },
        status: 'Confirmed',
        timeline: buildInitialTimeline(),
        subtotal: totals.subtotal,
        shippingCost: totals.shippingCost,
        totalAmount: totals.totalAmount,
        estimatedDeliveryDate: createdEstimatedDeliveryDate,
        createdAt: now,
        updatedAt: now,
      });
    });

    const emailResult = await sendOrderConfirmationEmail({
      to: String(shipping.email),
      customerName: `${String(shipping.firstName)} ${String(shipping.lastName || '')}`.trim() || auth.user.name,
      orderCode: createdOrderCode,
      totalAmount: createdTotalAmount,
      currency,
      estimatedDeliveryDate: createdEstimatedDeliveryDate,
    });

    return NextResponse.json({
      ok: true,
      orderCode: createdOrderCode,
      estimatedDeliveryDate: createdEstimatedDeliveryDate,
      emailSent: emailResult.ok,
      emailSkipped: emailResult.skipped || false,
    });
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
