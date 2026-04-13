import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/server/auth';

function getPayPalCredentials() {
  const clientId = String(process.env.PAYPAL_API_KEY || '').trim();
  const clientSecret = String(process.env.PAYPAL_SECRET_KEY || '').trim();

  return { clientId, clientSecret };
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const { clientId, clientSecret } = getPayPalCredentials();

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: 'PayPal gateway not configured' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Missing order ID' },
        { status: 400 }
      );
    }

    // Get PayPal access token
    const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const tokenResponse = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${authString}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to get PayPal access token');
    }

    const tokenData = (await tokenResponse.json()) as { access_token: string };
    const accessToken = tokenData.access_token;

    // Capture PayPal payment
    const captureResponse = await fetch(`https://api-m.paypal.com/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!captureResponse.ok) {
      const error = (await captureResponse.json()) as any;
      throw new Error(error.message || 'Failed to capture PayPal payment');
    }

    const captureData = (await captureResponse.json()) as any;

    // Check if payment was successfully captured
    if (captureData.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: `Payment capture failed with status: ${captureData.status}` },
        { status: 400 }
      );
    }

    const paymentUnit = captureData.purchase_units?.[0];
    const payment = paymentUnit?.payments?.captures?.[0];

    return NextResponse.json({
      success: true,
      paymentId: payment?.id || orderId,
      orderId: orderId,
      status: captureData.status,
      amount: paymentUnit?.amount?.value || 0,
      currency: paymentUnit?.amount?.currency_code || 'USD',
      message: 'Payment captured successfully',
    });
  } catch (error) {
    console.error('PayPal payment verification error:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Error verifying payment' },
      { status: 500 }
    );
  }
}
