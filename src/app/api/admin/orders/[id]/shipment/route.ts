import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/auth';
import { readDatabase } from '@/lib/server/database';
import {
  assignAwb,
  fulfillOrderShipment,
  generateInvoice,
  generateLabel,
  generatePickup,
  persistShipmentOnOrder,
  refreshShipmentTracking,
  buildTrackingUrl,
} from '@/lib/server/shiprocket';

interface Context {
  params: Promise<{ id: string }>;
}

type ShipmentAction =
  | 'create'
  | 'auto_fulfill'
  | 'assign_awb'
  | 'generate_pickup'
  | 'generate_label'
  | 'generate_invoice'
  | 'refresh'
  | 'track';

export async function POST(request: NextRequest, context: Context) {
  const auth = await requireAdmin(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === 'Forbidden' ? 403 : 401 });
  }

  try {
    const { id } = await context.params;
    const body = (await request.json().catch(() => ({}))) as {
      action?: ShipmentAction;
      courierId?: string;
    };
    const action = (body.action || 'auto_fulfill') as ShipmentAction;

    const db = await readDatabase();
    const order = db.orders.find((item) => item.id === id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    if (action === 'create' || action === 'auto_fulfill') {
      const result = await fulfillOrderShipment(id);
      if (!result.ok) {
        return NextResponse.json(
          { error: result.error || 'Unable to fulfill shipment.', steps: result.steps },
          { status: 400 },
        );
      }
    } else if (action === 'assign_awb') {
      if (!order.shipment?.shipmentId) {
        return NextResponse.json({ error: 'Create a shipment first.' }, { status: 400 });
      }
      const awbResult = await assignAwb(order.shipment.shipmentId, body.courierId);
      const awbData = awbResult.response?.data;
      const awbCode = awbData?.awb_code ? String(awbData.awb_code) : undefined;
      const courierName = awbData?.courier_name ? String(awbData.courier_name) : undefined;
      const courierId = awbData?.courier_id != null ? String(awbData.courier_id) : undefined;

      await persistShipmentOnOrder(
        id,
        {
          awbCode,
          trackingNumber: awbCode,
          courierId,
          courierName,
          shippingCharges: awbData?.freight_charges,
          trackingUrl: buildTrackingUrl(awbCode, courierName),
          shipmentStatus: awbCode ? 'AWB Assigned' : order.shipment.shipmentStatus,
          lastTrackingUpdate: new Date().toISOString(),
          lastError: undefined,
        },
        { timelineLabel: awbCode ? 'AWB generated' : undefined, status: awbCode ? 'Packed' : undefined },
      );
    } else if (action === 'generate_pickup') {
      if (!order.shipment?.shipmentId) {
        return NextResponse.json({ error: 'Create a shipment first.' }, { status: 400 });
      }
      await generatePickup(order.shipment.shipmentId);
      await persistShipmentOnOrder(
        id,
        { pickupStatus: 'Pickup requested', shipmentStatus: 'Pickup Scheduled', lastError: undefined },
        { timelineLabel: 'Pickup requested', status: 'Packed' },
      );
    } else if (action === 'generate_label') {
      if (!order.shipment?.shipmentId) {
        return NextResponse.json({ error: 'Create a shipment first.' }, { status: 400 });
      }
      const label = await generateLabel(order.shipment.shipmentId);
      await persistShipmentOnOrder(id, {
        labelUrl: label.label_url,
        lastError: undefined,
      });
    } else if (action === 'generate_invoice') {
      if (!order.shipment?.shiprocketOrderId) {
        return NextResponse.json({ error: 'Create a shipment first.' }, { status: 400 });
      }
      const invoice = await generateInvoice(order.shipment.shiprocketOrderId);
      await persistShipmentOnOrder(id, {
        invoiceUrl: invoice.invoice_url,
        lastError: undefined,
      });
    } else if (action === 'refresh' || action === 'track') {
      await refreshShipmentTracking(id);
    } else {
      return NextResponse.json({ error: 'Unknown shipment action.' }, { status: 400 });
    }

    const refreshed = await readDatabase();
    const updated = refreshed.orders.find((item) => item.id === id);
    return NextResponse.json({ ok: true, order: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Shipment action failed.';
    console.error('[Admin shipment]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}