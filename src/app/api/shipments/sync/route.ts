import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/auth';
import { readDatabase } from '@/lib/server/database';
import { refreshShipmentTracking } from '@/lib/server/shiprocket';

/**
 * Sync tracking for open shipments.
 * - Admins can call manually
 * - Optional cron via Authorization: Bearer SHIPROCKET_SYNC_SECRET
 */
export async function POST(request: NextRequest) {
  const syncSecret = (process.env.SHIPROCKET_SYNC_SECRET || '').trim();
  const authHeader = request.headers.get('authorization') || '';
  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  const isCron = Boolean(syncSecret && bearer && bearer === syncSecret);
  if (!isCron) {
    const auth = await requireAdmin(request);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.error === 'Forbidden' ? 403 : 401 });
    }
  }

  try {
    const db = await readDatabase();
    const openOrders = db.orders.filter((order) => {
      if (!order.shipment?.awbCode && !order.shipment?.trackingNumber) return false;
      return !['Delivered', 'Cancelled', 'Returned'].includes(order.status);
    });

    const results: Array<{ orderCode: string; ok: boolean; error?: string }> = [];

    for (const order of openOrders.slice(0, 40)) {
      try {
        await refreshShipmentTracking(order.id);
        results.push({ orderCode: order.orderCode, ok: true });
      } catch (error) {
        results.push({
          orderCode: order.orderCode,
          ok: false,
          error: error instanceof Error ? error.message : 'sync failed',
        });
      }
    }

    return NextResponse.json({
      ok: true,
      synced: results.filter((item) => item.ok).length,
      failed: results.filter((item) => !item.ok).length,
      results,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sync failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
