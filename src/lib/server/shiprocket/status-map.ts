import type { OrderStatus } from './types';

/** Map Shiprocket courier/order statuses to internal order statuses. */
export function mapShiprocketStatusToOrderStatus(rawStatus: string): OrderStatus | null {
  const status = rawStatus.trim().toLowerCase();

  if (!status) return null;

  if (status.includes('cancel')) return 'Cancelled';
  if (status.includes('rto') || status.includes('return')) return 'Returned';
  if (status.includes('delivered')) return 'Delivered';
  if (status.includes('out for delivery') || status === 'ofd') return 'Out For Delivery';
  if (
    status.includes('in transit') ||
    status.includes('shipped') ||
    status.includes('in-transit') ||
    status.includes('reached') ||
    status.includes('connected')
  ) {
    return 'In Transit';
  }
  if (status.includes('picked up') || status.includes('picked')) {
    return 'Picked Up';
  }
  if (
    status.includes('packed') ||
    status.includes('ready to ship') ||
    status.includes('ready_to_ship') ||
    status.includes('label generated') ||
    status.includes('awb assigned')
  ) {
    return 'Packed';
  }
  if (
    status.includes('new') ||
    status.includes('processing') ||
    status.includes('confirmed') ||
    status.includes('pending')
  ) {
    return 'Confirmed';
  }

  return null;
}

export const SHIPMENT_TIMELINE_STEPS = [
  'Order Placed',
  'Confirmed',
  'Packed',
  'Picked Up',
  'In Transit',
  'Out For Delivery',
  'Delivered',
] as const;

export function orderStatusToTimelineLabel(status: OrderStatus | string): string {
  switch (status) {
    case 'Confirmed':
      return 'Confirmed';
    case 'Preparing for Dispatch':
    case 'Packed':
      return 'Packed';
    case 'Picked Up':
      return 'Picked Up';
    case 'In Transit':
      return 'In Transit';
    case 'Out For Delivery':
      return 'Out For Delivery';
    case 'Delivered':
      return 'Delivered';
    case 'Returned':
      return 'Returned';
    case 'Cancelled':
      return 'Cancelled';
    default:
      return String(status);
  }
}

export function buildTrackingUrl(awb?: string, courierName?: string): string | undefined {
  if (!awb) return undefined;
  const courier = (courierName || '').toLowerCase();
  if (courier.includes('delhivery')) return `https://www.delhivery.com/track/package/${awb}`;
  if (courier.includes('bluedart')) return `https://www.bluedart.com/tracking/${awb}`;
  if (courier.includes('dtdc')) {
    return `https://www.dtdc.in/tracking/tracking_results.asp?Ttype=awb_no&strCnno=${awb}`;
  }
  return `https://shiprocket.co/tracking/${awb}`;
}
