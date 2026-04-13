import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/server/auth';

function getPayPalCredentials() {
  const clientId = String(process.env.PAYPAL_CLIENT_ID || '').trim();
  const clientSecret = String(process.env.PAYPAL_CLIENT_SECRET || '').trim();

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
    const { amount, currency, description, customerDetails } = body;

    if (!amount || !currency) {
      return NextResponse.json(
        { error: 'Missing amount or currency' },
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

    // Create PayPal order
    const orderResponse = await fetch('https://api-m.paypal.com/v2/checkout/orders', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: `gijayi-order-${Date.now()}`,
            amount: {
              currency_code: currency,
              value: amount.toFixed(2),
              breakdown: {
                item_total: {
                  currency_code: currency,
                  value: amount.toFixed(2),
                },
              },
            },
            description: description || 'Gijayi Store Order',
            custom_id: customerDetails?.email || '',
            items: [
              {
                name: description || 'Gijayi Products',
                quantity: '1',
                unit_amount: {
                  currency_code: currency,
                  value: amount.toFixed(2),
                },
              },
            ],
          },
        ],
        payer: {
          name: {
            given_name: customerDetails?.firstName || 'Customer',
            surname: customerDetails?.lastName || '',
          },
          email_address: customerDetails?.email || '',
          phone: {
            phone_number: {
              national_number: customerDetails?.phone?.replace(/\D/g, '') || '',
            },
          },
        },
        application_context: {
          brand_name: 'Gijayi',
          locale: 'en-US',
          landing_page: 'BILLING',
          user_action: 'PAY_NOW',
          return_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout?payment=success`,
          cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout?payment=cancelled`,
        },
      }),
    });

    if (!orderResponse.ok) {
      const error = (await orderResponse.json()) as any;
      throw new Error(error.message || 'Failed to create PayPal order');
    }

    const order = (await orderResponse.json()) as any;

    return NextResponse.json({
      orderId: order.id,
      status: order.status,
      links: order.links,
      approvalUrl: order.links.find((link: any) => link.rel === 'approve')?.href || '',
    });
  } catch (error) {
    console.error('PayPal order creation error:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to create payment order' },
      { status: 500 }
    );
  }
}
