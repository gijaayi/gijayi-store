import { NextRequest, NextResponse } from 'next/server';
import { applyWebhookStatusUpdate } from '@/lib/server/shiprocket';

/**
 * Shiprocket webhook endpoint.
 * Configure this URL in Shiprocket dashboard:
 *   https://gijayi.com/api/webhooks/shiprocket
 *
 * Optional shared secret via SHIPROCKET_WEBHOOK_SECRET header/query.
 */
export async function POST(request: NextRequest) {
  try {
    const configuredSecret = (process.env.SHIPROCKET_WEBHOOK_SECRET || '').trim();
    if (configuredSecret) {
      const headerSecret =
        request.headers.get('x-api-key') ||
        request.headers.get('x-shiprocket-secret') ||
        request.nextUrl.searchParams.get('secret') ||
        '';
      if (headerSecret !== configuredSecret) {
        return NextResponse.json({ error: 'Unauthorized webhook.' }, { status: 401 });
      }
    }

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    const awb = String(
      body.awb ||
        body.awb_code ||
        body.awb_number ||
        (body as { tracking_data?: { awb?: string } }).tracking_data?.awb ||
        '',
    ).trim();

    const orderId = String(
      body.order_id ||
        body.channel_order_id ||
        body.sr_order_id ||
        body.orderId ||
        '',
    ).trim();

    const currentStatus = String(
      body.current_status ||
        body.shipment_status ||
        body.status ||
        body.current_status_id ||
        '',
    ).trim();

    if (!awb && !orderId) {
      return NextResponse.json({ error: 'Missing AWB or order id.' }, { status: 400 });
    }

    await applyWebhookStatusUpdate({
      awb,
      orderId,
      currentStatus,
      courierName: String(body.courier_name || body.courier || '').trim() || undefined,
      etd: String(body.etd || body.edd || '').trim() || undefined,
      location: String(body.current_location || body.location || '').trim() || undefined,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Webhook processing failed.';
    if (message === 'NOT_FOUND') {
      // Acknowledge unknown orders so Shiprocket does not retry endlessly.
      return NextResponse.json({ ok: true, ignored: true });
    }
    console.error('[Shiprocket Webhook]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
