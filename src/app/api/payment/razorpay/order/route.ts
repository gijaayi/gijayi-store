import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/server/auth';
import crypto from 'crypto';

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';

interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  offer_id?: string | null;
  status: string;
  attempts: number;
  notes: Record<string, unknown>;
  created_at: number;
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    return NextResponse.json(
      { error: 'Payment gateway not configured' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { amount, currency = 'INR', description, customerDetails } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Calculate amount in paise (Razorpay expects integer paise)
    const amountInPaise = Math.round(amount * 100);

    // Create request options
    const options = {
      amount: amountInPaise,
      currency,
      description: description || 'Gijayi Order',
      customer_notify: 1,
      notes: {
        userId: auth.user.id,
        userName: auth.user.name,
        email: auth.user.email,
        ...customerDetails,
      },
    };

    // Make request to Razorpay API
    const auth_string = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth_string}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Razorpay API Error:', error);
      return NextResponse.json(
        { error: 'Failed to create payment order' },
        { status: response.status }
      );
    }

    const razorpayOrder = (await response.json()) as RazorpayOrderResponse;

    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Payment order error:', error);
    return NextResponse.json(
      { error: 'Error creating payment order' },
      { status: 500 }
    );
  }
}
