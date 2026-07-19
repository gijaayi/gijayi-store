import { NextRequest, NextResponse } from 'next/server';
import { applyWebhookStatusUpdate } from '@/lib/server/shiprocket';

/**
 * Courier tracking webhook endpoint for Shiprocket.
 *
 * IMPORTANT: Shiprocket forbids URL keywords like "shiprocket", "sr", "kr".
 * Configure this exact URL in Shiprocket dashboard:
 *   https://gijayi.com/api/webhooks/delivery-status
 *
 * Auth: Auth Token Type = x-api-key
 * Token value must match SHIPROCKET_WEBHOOK_SECRET in Hostinger env.
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

    // Shiprocket "Test Webhook" often sends an empty/minimal body.
    // Return 200 so their dashboard can verify connectivity.
    if (!awb && !orderId) {
      return NextResponse.json({ ok: true, ping: true });
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
      return NextResponse.json({ ok: true, ignored: true });
    }
    console.error('[Delivery Webhook]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}