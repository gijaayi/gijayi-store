import 'server-only';

import type { DbOrder } from '@/lib/server/database';
import { readDatabase, updateDatabase } from '@/lib/server/database';
import { sendShipmentStatusEmail } from '@/lib/server/email';
import {
  getDefaultParcelDims,
  getShiprocketPickupLocation,
  isShiprocketConfigured,
  shiprocketRequest,
} from './client';
import { buildTrackingUrl, mapShiprocketStatusToOrderStatus, orderStatusToTimelineLabel } from './status-map';
import type { OrderShipment, ShiprocketCreateOrderResult } from './types';

function nowLabel() {
  return new Date().toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function phoneDigits(phone: string) {
  const digits = phone.replace(/\D/g, '');
  if (digits.length > 10) return digits.slice(-10);
  return digits;
}

function parseAwbAssignResult(awbResult: {
  response?: {
    data?: {
      awb_code?: string;
      courier_id?: number | string;
      courier_name?: string;
      freight_charges?: number;
    };
  };
}) {
  const awbData = awbResult.response?.data;
  const awbCode = awbData?.awb_code ? String(awbData.awb_code) : undefined;
  const courierName = awbData?.courier_name ? String(awbData.courier_name) : undefined;
  const courierId = awbData?.courier_id != null ? String(awbData.courier_id) : undefined;
  const shippingCharges =
    typeof awbData?.freight_charges === 'number' ? awbData.freight_charges : undefined;
  return { awbCode, courierName, courierId, shippingCharges };
}

async function getOrderOrThrow(orderId: string): Promise<DbOrder> {
  const db = await readDatabase();
  const order = db.orders.find((item) => item.id === orderId);
  if (!order) throw new Error('NOT_FOUND');
  return order;
}

export async function createShiprocketShipment(order: DbOrder): Promise<ShiprocketCreateOrderResult> {
  if (!isShiprocketConfigured()) {
    throw new Error('Shiprocket is not configured.');
  }

  if (order.shipment?.shipmentId) {
    throw new Error('Shipment already exists for this order.');
  }

  const dims = getDefaultParcelDims();
  const pickupLocation = getShiprocketPickupLocation();
  const orderDate = new Date(order.createdAt);
  const formattedDate = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}-${String(orderDate.getDate()).padStart(2, '0')} ${String(orderDate.getHours()).padStart(2, '0')}:${String(orderDate.getMinutes()).padStart(2, '0')}`;

  const payload = {
    order_id: order.orderCode,
    order_date: formattedDate,
    pickup_location: pickupLocation,
    billing_customer_name: order.shipping.firstName,
    billing_last_name: order.shipping.lastName || '',
    billing_address: order.shipping.address,
    billing_address_2: '',
    billing_city: order.shipping.city,
    billing_pincode: order.shipping.pincode,
    billing_state: order.shipping.state || '',
    billing_country: order.shipping.country || 'India',
    billing_email: order.shipping.email,
    billing_phone: phoneDigits(order.shipping.phone),
    shipping_is_billing: true,
    order_items: order.items.map((item) => ({
      name: item.name,
      sku: item.productId.slice(0, 50) || item.name.slice(0, 50),
      units: item.quantity,
      selling_price: item.price,
      discount: 0,
      tax: 0,
      hsn: '',
    })),
    payment_method: 'Prepaid',
    sub_total: order.subtotal,
    length: dims.length,
    breadth: dims.breadth,
    height: dims.height,
    weight: dims.weight,
  };

  const data = await shiprocketRequest<{
    order_id?: number | string;
    shipment_id?: number | string;
    status?: string;
    awb_code?: string;
    courier_name?: string;
  }>('/orders/create/adhoc', { method: 'POST', body: payload });

  const shiprocketOrderId = String(data.order_id || '');
  const shipmentId = String(data.shipment_id || '');

  if (!shiprocketOrderId || !shipmentId) {
    throw new Error('Shiprocket did not return order/shipment IDs.');
  }

  return {
    shiprocketOrderId,
    shipmentId,
    status: data.status,
    awbCode: data.awb_code ? String(data.awb_code) : undefined,
    courierName: data.courier_name ? String(data.courier_name) : undefined,
  };
}

export async function assignAwb(shipmentId: string, courierId?: string) {
  const body: Record<string, unknown> = { shipment_id: Number(shipmentId) || shipmentId };
  if (courierId) body.courier_id = Number(courierId) || courierId;

  return shiprocketRequest<{
    response?: {
      data?: {
        awb_code?: string;
        courier_id?: number | string;
        courier_name?: string;
        freight_charges?: number;
      };
    };
    awb_assign_status?: number;
  }>('/courier/assign/awb', { method: 'POST', body });
}

export async function generatePickup(shipmentId: string) {
  return shiprocketRequest<{ pickup_status?: number; response?: unknown }>(
    '/courier/generate/pickup',
    { method: 'POST', body: { shipment_id: [Number(shipmentId) || shipmentId] } },
  );
}

export async function generateLabel(shipmentId: string) {
  return shiprocketRequest<{ label_url?: string; label_created?: number }>(
    '/courier/generate/label',
    { method: 'POST', body: { shipment_id: [Number(shipmentId) || shipmentId] } },
  );
}

export async function generateInvoice(shiprocketOrderId: string) {
  return shiprocketRequest<{ invoice_url?: string; is_invoice_created?: boolean }>(
    '/orders/print/invoice',
    { method: 'POST', body: { ids: [Number(shiprocketOrderId) || shiprocketOrderId] } },
  );
}

export async function trackByAwb(awb: string) {
  return shiprocketRequest<{
    tracking_data?: {
      track_status?: number;
      shipment_status?: string | number;
      shipment_track?: Array<{
        current_status?: string;
        status?: string;
        location?: string;
        date?: string;
        activity?: string;
        'sr-status'?: string;
      }>;
      shipment_track_activities?: Array<{
        date?: string;
        status?: string;
        activity?: string;
        location?: string;
      }>;
      etd?: string;
    };
  }>(`/courier/track/awb/${encodeURIComponent(awb)}`);
}

export async function persistShipmentOnOrder(
  orderId: string,
  patch: Partial<OrderShipment>,
  options?: { timelineLabel?: string; status?: DbOrder['status']; notify?: boolean },
) {
  let updatedOrder: DbOrder | null = null;

  await updateDatabase((db) => {
    const order = db.orders.find((item) => item.id === orderId);
    if (!order) throw new Error('NOT_FOUND');

    order.shipment = {
      ...(order.shipment || {}),
      ...patch,
    };

    if (options?.status && order.status !== options.status) {
      order.status = options.status;
    }

    if (options?.timelineLabel) {
      const exists = order.timeline.some((event) => event.label === options.timelineLabel);
      if (!exists) {
        order.timeline.unshift({
          label: options.timelineLabel,
          time: nowLabel(),
        });
      }
    }

    order.updatedAt = new Date().toISOString();
    updatedOrder = { ...order, shipment: { ...(order.shipment || {}) }, timeline: [...order.timeline] };
  });

  if (options?.notify && updatedOrder) {
    const order = updatedOrder as DbOrder;
    void sendShipmentStatusEmail({
      to: order.shipping.email,
      customerName: `${order.shipping.firstName} ${order.shipping.lastName || ''}`.trim(),
      orderCode: order.orderCode,
      statusLabel: options.timelineLabel || order.status,
      trackingNumber: order.shipment?.trackingNumber || order.shipment?.awbCode,
      courierName: order.shipment?.courierName,
      trackingUrl: order.shipment?.trackingUrl,
      estimatedDelivery: order.shipment?.estimatedDelivery || order.estimatedDeliveryDate,
    }).catch((error) => {
      console.warn('[Shiprocket] shipment email failed:', error);
    });
  }

  return updatedOrder;
}

export type FulfillShipmentResult = {
  ok: boolean;
  error?: string;
  steps: string[];
};

/**
 * Full prepaid shipping pipeline:
 * create shipment -> assign AWB -> request pickup -> generate label/invoice.
 * Continues from whatever step is missing. Never throws for auto-flow callers.
 */
export async function fulfillOrderShipment(orderId: string): Promise<FulfillShipmentResult> {
  const steps: string[] = [];

  try {
    if (!isShiprocketConfigured()) {
      return { ok: false, error: 'Shiprocket is not configured.', steps };
    }

    let order = await getOrderOrThrow(orderId);

    // 1) Create Shiprocket order/shipment
    if (!order.shipment?.shipmentId) {
      const created = await createShiprocketShipment(order);
      await persistShipmentOnOrder(
        orderId,
        {
          shiprocketOrderId: created.shiprocketOrderId,
          shipmentId: created.shipmentId,
          awbCode: created.awbCode,
          courierName: created.courierName,
          trackingNumber: created.awbCode,
          trackingUrl: buildTrackingUrl(created.awbCode, created.courierName),
          shipmentStatus: created.status || 'NEW',
          lastError: undefined,
          lastTrackingUpdate: new Date().toISOString(),
        },
        {
          timelineLabel: 'Shipment created',
          status: 'Preparing for Dispatch',
        },
      );
      steps.push('created');
      order = await getOrderOrThrow(orderId);
    }

    const shipmentId = order.shipment?.shipmentId;
    if (!shipmentId) {
      throw new Error('Shipment ID missing after create.');
    }

    // 2) Assign AWB (auto courier if none selected)
    if (!order.shipment?.awbCode) {
      const awbResult = await assignAwb(shipmentId);
      const parsed = parseAwbAssignResult(awbResult);
      if (!parsed.awbCode) {
        throw new Error('Shiprocket did not return an AWB code.');
      }

      await persistShipmentOnOrder(
        orderId,
        {
          awbCode: parsed.awbCode,
          trackingNumber: parsed.awbCode,
          courierId: parsed.courierId,
          courierName: parsed.courierName || order.shipment?.courierName,
          shippingCharges: parsed.shippingCharges,
          trackingUrl: buildTrackingUrl(parsed.awbCode, parsed.courierName || order.shipment?.courierName),
          shipmentStatus: 'AWB Assigned',
          lastError: undefined,
          lastTrackingUpdate: new Date().toISOString(),
        },
        {
          timelineLabel: 'AWB generated',
          status: 'Packed',
          notify: true,
        },
      );
      steps.push('awb');
      order = await getOrderOrThrow(orderId);
    }

    // 3) Request pickup
    const pickupDone = Boolean(
      order.shipment?.pickupStatus &&
        !/fail|error|cancel/i.test(order.shipment.pickupStatus),
    );
    if (!pickupDone) {
      await generatePickup(shipmentId);
      await persistShipmentOnOrder(
        orderId,
        {
          pickupStatus: 'Pickup requested',
          shipmentStatus: 'Pickup Scheduled',
          lastError: undefined,
          lastTrackingUpdate: new Date().toISOString(),
        },
        {
          timelineLabel: 'Pickup requested',
          status: 'Packed',
        },
      );
      steps.push('pickup');
      order = await getOrderOrThrow(orderId);
    }

    // 4) Label + invoice (best-effort; do not fail the whole pipeline)
    const softErrors: string[] = [];

    if (!order.shipment?.labelUrl) {
      try {
        const label = await generateLabel(shipmentId);
        if (label.label_url) {
          await persistShipmentOnOrder(orderId, {
            labelUrl: label.label_url,
            lastError: undefined,
          });
          steps.push('label');
          order = await getOrderOrThrow(orderId);
        }
      } catch (error) {
        softErrors.push(error instanceof Error ? error.message : 'Label generation failed');
      }
    }

    if (order.shipment?.shiprocketOrderId && !order.shipment?.invoiceUrl) {
      try {
        const invoice = await generateInvoice(order.shipment.shiprocketOrderId);
        if (invoice.invoice_url) {
          await persistShipmentOnOrder(orderId, {
            invoiceUrl: invoice.invoice_url,
            lastError: undefined,
          });
          steps.push('invoice');
        }
      } catch (error) {
        softErrors.push(error instanceof Error ? error.message : 'Invoice generation failed');
      }
    }

    if (softErrors.length) {
      await persistShipmentOnOrder(orderId, {
        lastError: `Documents: ${softErrors.join(' | ')}`,
      });
      return {
        ok: true,
        error: softErrors.join(' | '),
        steps,
      };
    }

    await persistShipmentOnOrder(orderId, { lastError: undefined });
    return { ok: true, steps };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Shipment fulfillment failed';
    console.error('[Shiprocket] fulfillOrderShipment:', message, steps);

    try {
      await persistShipmentOnOrder(orderId, { lastError: message });
    } catch {
      // ignore secondary write failures
    }

    return { ok: false, error: message, steps };
  }
}

/** Alias used by order placement — runs the full automated pipeline. */
export async function createAndAttachShipment(orderId: string): Promise<{ ok: boolean; error?: string }> {
  const result = await fulfillOrderShipment(orderId);
  return { ok: result.ok, error: result.error };
}

export async function refreshShipmentTracking(orderId: string): Promise<DbOrder | null> {
  const db = await readDatabase();
  const current = db.orders.find((item) => item.id === orderId);
  if (!current) throw new Error('NOT_FOUND');

  const awb = current.shipment?.awbCode || current.shipment?.trackingNumber;
  if (!awb) {
    throw new Error('No AWB/tracking number available to refresh.');
  }

  const track = await trackByAwb(awb);
  const trackingData = track.tracking_data;
  const activities = trackingData?.shipment_track_activities || [];
  const trackRows = trackingData?.shipment_track || [];
  const latestActivity = activities[0];
  const latestTrack = trackRows[0];
  const rawStatus =
    latestActivity?.status ||
    latestActivity?.activity ||
    latestTrack?.current_status ||
    latestTrack?.status ||
    String(trackingData?.shipment_status || current.shipment?.shipmentStatus || '');
  const latestLocation = latestActivity?.location || latestTrack?.location;

  const mapped = mapShiprocketStatusToOrderStatus(rawStatus);
  const history = activities.map((item) => ({
    status: item.status || item.activity || 'Update',
    location: item.location,
    activity: item.activity,
    time: item.date || nowLabel(),
  }));

  const shouldNotify =
    Boolean(mapped) &&
    mapped !== current.status &&
    ['Packed', 'Picked Up', 'In Transit', 'Out For Delivery', 'Delivered', 'Returned', 'Cancelled'].includes(
      mapped || '',
    );

  return persistShipmentOnOrder(
    orderId,
    {
      shipmentStatus: rawStatus || current.shipment?.shipmentStatus,
      currentLocation: latestLocation,
      estimatedDelivery: trackingData?.etd || current.shipment?.estimatedDelivery,
      shipmentHistory: history.length ? history : current.shipment?.shipmentHistory,
      trackingUrl: current.shipment?.trackingUrl || buildTrackingUrl(awb, current.shipment?.courierName),
      trackingNumber: awb,
      lastTrackingUpdate: new Date().toISOString(),
    },
    {
      status: mapped || undefined,
      timelineLabel: mapped ? orderStatusToTimelineLabel(mapped) : undefined,
      notify: shouldNotify,
    },
  );
}

export async function applyWebhookStatusUpdate(payload: {
  awb?: string;
  orderId?: string;
  currentStatus?: string;
  courierName?: string;
  etd?: string;
  location?: string;
}) {
  const awb = String(payload.awb || '').trim();
  const channelOrderId = String(payload.orderId || '').trim();
  const currentStatus = String(payload.currentStatus || '').trim();

  const db = await readDatabase();
  const existing = db.orders.find((item) => {
    if (channelOrderId && item.orderCode.toUpperCase() === channelOrderId.toUpperCase()) return true;
    if (awb && (item.shipment?.awbCode === awb || item.shipment?.trackingNumber === awb)) return true;
    return false;
  });
  if (!existing) throw new Error('NOT_FOUND');

  const mapped = mapShiprocketStatusToOrderStatus(currentStatus);
  const previousStatus = existing.status;
  const shouldNotify = Boolean(mapped) && mapped !== previousStatus;
  const history = [
    {
      status: currentStatus || 'Update',
      location: payload.location,
      time: nowLabel(),
    },
    ...(existing.shipment?.shipmentHistory || []),
  ].slice(0, 40);

  return persistShipmentOnOrder(
    existing.id,
    {
      awbCode: awb || existing.shipment?.awbCode,
      trackingNumber: awb || existing.shipment?.trackingNumber,
      courierName: payload.courierName || existing.shipment?.courierName,
      shipmentStatus: currentStatus || existing.shipment?.shipmentStatus,
      currentLocation: payload.location || existing.shipment?.currentLocation,
      estimatedDelivery: payload.etd || existing.shipment?.estimatedDelivery,
      trackingUrl:
        buildTrackingUrl(awb || existing.shipment?.awbCode, payload.courierName || existing.shipment?.courierName) ||
        existing.shipment?.trackingUrl,
      lastTrackingUpdate: new Date().toISOString(),
      shipmentHistory: history,
    },
    {
      status: mapped || undefined,
      timelineLabel: mapped ? orderStatusToTimelineLabel(mapped) : currentStatus || undefined,
      notify: shouldNotify,
    },
  );
}