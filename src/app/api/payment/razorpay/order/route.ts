import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/server/auth';

function getRazorpayCredentials() {
  const keyId = String(
    process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_LIVE_KEY_ID || process.env.RAZORPAY_TEST_KEY_ID || ''
  ).trim();

  const keySecret = String(
    process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_LIVE_KEY_SECRET || process.env.RAZORPAY_TEST_KEY_SECRET || ''
  ).trim();

  return { keyId, keySecret };
}

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

interface RazorpayErrorResponse {
  error?: {
    code?: string;
    description?: string;
    reason?: string;
    field?: string;
    source?: string;
    step?: string;
  };
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const { keyId, keySecret } = getRazorpayCredentials();

  if (!keyId || !keySecret) {
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

    // Use Razorpay Orders API supported fields only.
    const options = {
      amount: amountInPaise,
      currency,
      receipt: `gijayi_${Date.now()}`.slice(0, 40),
      notes: {
        description: String(description || 'Gijayi Order'),
        userId: auth.user.id,
        userName: auth.user.name,
        email: auth.user.email,
        ...customerDetails,
      },
    };

    // Make request to Razorpay API
    const auth_string = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth_string}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      const raw = await response.text();
      let parsedError: RazorpayErrorResponse | null = null;

      try {
        parsedError = JSON.parse(raw) as RazorpayErrorResponse;
      } catch {
        parsedError = null;
      }

      const providerMessage = parsedError?.error?.description || parsedError?.error?.reason || raw || 'Failed to create payment order';
      const finalMessage = providerMessage.toLowerCase().includes('authentication failed')
        ? 'Razorpay authentication failed. Please verify Key ID and Key Secret are a matching pair in the same mode (Live/Test).'
        : providerMessage;
      console.error('Razorpay API Error:', providerMessage);
      return NextResponse.json(
        { error: finalMessage },
        { status: response.status }
      );
    }

    const razorpayOrder = (await response.json()) as RazorpayOrderResponse;

    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId,
    });
  } catch (error) {
    console.error('Payment order error:', error);
    return NextResponse.json(
      { error: 'Error creating payment order' },
      { status: 500 }
    );
  }
}
