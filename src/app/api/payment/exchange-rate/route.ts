import { NextRequest, NextResponse } from 'next/server';

const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'AED', 'AUD', 'CAD', 'SGD'];

interface FrankfurterResponse {
  amount: number;
  base: string;
  date: string;
  rates: Record<string, number>;
}

export async function GET(request: NextRequest) {
  const currency = (request.nextUrl.searchParams.get('currency') || '').toUpperCase();

  if (!currency || !SUPPORTED_CURRENCIES.includes(currency)) {
    return NextResponse.json(
      { error: 'Unsupported currency.' },
      { status: 400 }
    );
  }

  if (currency === 'INR') {
    return NextResponse.json({ currency: 'INR', rate: 1 });
  }

  try {
    const response = await fetch(
      `https://api.frankfurter.app/latest?from=INR&to=${encodeURIComponent(currency)}`,
      { next: { revalidate: 60 * 60 * 6 } }
    );

    if (!response.ok) {
      return NextResponse.json({ error: 'Unable to fetch exchange rate.' }, { status: 502 });
    }

    const data = (await response.json()) as FrankfurterResponse;
    const rate = Number(data.rates?.[currency] || 0);

    if (!Number.isFinite(rate) || rate <= 0) {
      return NextResponse.json({ error: 'Invalid exchange rate received.' }, { status: 502 });
    }

    return NextResponse.json({ currency, rate });
  } catch {
    return NextResponse.json({ error: 'Unable to fetch exchange rate.' }, { status: 500 });
  }
}
