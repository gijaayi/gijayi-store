export type OrderStatus =
  | 'Confirmed'
  | 'Preparing for Dispatch'
  | 'Packed'
  | 'Picked Up'
  | 'In Transit'
  | 'Out For Delivery'
  | 'Delivered'
  | 'Returned'
  | 'Cancelled';

export interface ShipmentHistoryEvent {
  status: string;
  location?: string;
  activity?: string;
  time: string;
}

export interface OrderShipment {
  shiprocketOrderId?: string;
  shipmentId?: string;
  awbCode?: string;
  courierId?: string;
  courierName?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  shipmentStatus?: string;
  pickupStatus?: string;
  shippingCharges?: number;
  codCharges?: number;
  estimatedDelivery?: string;
  labelUrl?: string;
  invoiceUrl?: string;
  currentLocation?: string;
  lastTrackingUpdate?: string;
  shipmentHistory?: ShipmentHistoryEvent[];
  lastError?: string;
}

export interface ShiprocketCreateOrderResult {
  shiprocketOrderId: string;
  shipmentId: string;
  status?: string;
  awbCode?: string;
  courierName?: string;
}
