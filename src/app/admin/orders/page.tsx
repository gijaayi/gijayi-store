'use client';

import { useEffect, useState } from 'react';

interface AdminOrderShipment {
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
  lastError?: string;
}

interface AdminOrder {
  id: string;
  orderCode: string;
  userName: string;
  userEmail?: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  paymentMethod?: string;
  shipping?: {
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  items?: Array<{ name: string; quantity: number; price: number }>;
  shipment?: AdminOrderShipment;
}

const ORDER_STATUSES = [
  'Confirmed',
  'Preparing for Dispatch',
  'Packed',
  'Picked Up',
  'In Transit',
  'Out For Delivery',
  'Delivered',
  'Returned',
  'Cancelled',
];

function getOrderStatusClasses(status: string) {
  if (status === 'Delivered') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (status === 'Out For Delivery' || status === 'In Transit' || status === 'Picked Up') {
    return 'bg-blue-50 text-blue-700 border-blue-200';
  }
  if (status === 'Preparing for Dispatch' || status === 'Packed') {
    return 'bg-amber-50 text-amber-700 border-amber-200';
  }
  if (status === 'Returned' || status === 'Cancelled') return 'bg-red-50 text-red-700 border-red-200';
  return 'bg-slate-100 text-slate-700 border-slate-200';
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');
  const [expandedId, setExpandedId] = useState('');

  async function fetchOrders() {
    const response = await fetch('/api/admin/orders', { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to load orders');
    const data = (await response.json()) as { orders: AdminOrder[] };
    setOrders(data.orders);
  }

  useEffect(() => {
    fetchOrders().catch((err) => setError(err instanceof Error ? err.message : 'Unable to load orders'));
  }, []);

  async function updateOrderStatus(orderId: string, status: string) {
    const response = await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      setError('Unable to update order status');
      return;
    }

    await fetchOrders();
  }

  async function runShipmentAction(orderId: string, action: string) {
    setBusyId(orderId);
    setError('');
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/shipment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error || 'Shipment action failed.');
        return;
      }
      await fetchOrders();
    } catch {
      setError('Shipment action failed.');
    } finally {
      setBusyId('');
    }
  }

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6">
      <h2 className="font-serif text-3xl mb-1 text-slate-900">Order Operations</h2>
      <p className="text-sm text-slate-500 mb-6">
        Track orders, manage Shiprocket shipments, and update delivery status.
      </p>

      {error && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{error}</p>
      )}

      <div className="space-y-3 max-h-[860px] overflow-y-auto pr-1">
        {orders.map((order) => {
          const shipment = order.shipment;
          const isExpanded = expandedId === order.id;
          const busy = busyId === order.id;

          return (
            <div key={order.id} className="border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{order.orderCode}</p>
                  <p className="text-xs text-slate-500">
                    {order.userName} · {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  ₹{order.totalAmount.toLocaleString('en-IN')}
                </p>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <span
                  className={`text-[10px] tracking-widest uppercase px-2 py-1 rounded-full border ${getOrderStatusClasses(order.status)}`}
                >
                  {order.status}
                </span>
                <select
                  value={order.status}
                  onChange={(event) => updateOrderStatus(order.id, event.target.value)}
                  className="flex-1 border border-slate-300 rounded-lg bg-white px-3 py-2 text-xs tracking-widest uppercase outline-none focus:border-blue-600"
                >
                  {ORDER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? '' : order.id)}
                  className="text-[10px] tracking-widest uppercase px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  {isExpanded ? 'Hide' : 'Shipping'}
                </button>
              </div>

              {isExpanded && (
                <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                  <h3 className="text-xs tracking-widest uppercase font-semibold text-slate-700">
                    Shipping Information
                  </h3>

                  <div className="grid sm:grid-cols-2 gap-2 text-xs text-slate-600">
                    <p>
                      <span className="font-medium text-slate-800">Shiprocket Order ID:</span>{' '}
                      {shipment?.shiprocketOrderId || '—'}
                    </p>
                    <p>
                      <span className="font-medium text-slate-800">Shipment ID:</span>{' '}
                      {shipment?.shipmentId || '—'}
                    </p>
                    <p>
                      <span className="font-medium text-slate-800">Courier:</span>{' '}
                      {shipment?.courierName || '—'}
                    </p>
                    <p>
                      <span className="font-medium text-slate-800">Tracking Number:</span>{' '}
                      {shipment?.trackingNumber || shipment?.awbCode || '—'}
                    </p>
                    <p>
                      <span className="font-medium text-slate-800">AWB:</span> {shipment?.awbCode || '—'}
                    </p>
                    <p>
                      <span className="font-medium text-slate-800">Shipment Status:</span>{' '}
                      {shipment?.shipmentStatus || '—'}
                    </p>
                    <p>
                      <span className="font-medium text-slate-800">Pickup Status:</span>{' '}
                      {shipment?.pickupStatus || '—'}
                    </p>
                    <p>
                      <span className="font-medium text-slate-800">Expected Delivery:</span>{' '}
                      {shipment?.estimatedDelivery
                        ? new Date(shipment.estimatedDelivery).toLocaleDateString('en-IN')
                        : '—'}
                    </p>
                    <p>
                      <span className="font-medium text-slate-800">Shipping Charges:</span>{' '}
                      {shipment?.shippingCharges != null ? `₹${shipment.shippingCharges}` : '—'}
                    </p>
                    <p>
                      <span className="font-medium text-slate-800">COD Charges:</span>{' '}
                      {shipment?.codCharges != null ? `₹${shipment.codCharges}` : '—'}
                    </p>
                  </div>

                  {shipment?.lastError && (
                    <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                      Last error: {shipment.lastError}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {!shipment?.shipmentId && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => runShipmentAction(order.id, 'create')}
                        className="px-3 py-2 text-[10px] tracking-widest uppercase bg-blue-600 text-white rounded-lg disabled:opacity-50"
                      >
                        Create Shipment
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={busy || !shipment?.shipmentId}
                      onClick={() => runShipmentAction(order.id, 'assign_awb')}
                      className="px-3 py-2 text-[10px] tracking-widest uppercase border border-slate-300 rounded-lg hover:bg-white disabled:opacity-50"
                    >
                      Generate AWB
                    </button>
                    <button
                      type="button"
                      disabled={busy || !shipment?.shipmentId}
                      onClick={() => runShipmentAction(order.id, 'generate_pickup')}
                      className="px-3 py-2 text-[10px] tracking-widest uppercase border border-slate-300 rounded-lg hover:bg-white disabled:opacity-50"
                    >
                      Request Pickup
                    </button>
                    <button
                      type="button"
                      disabled={busy || !shipment?.shipmentId}
                      onClick={() => runShipmentAction(order.id, 'generate_label')}
                      className="px-3 py-2 text-[10px] tracking-widest uppercase border border-slate-300 rounded-lg hover:bg-white disabled:opacity-50"
                    >
                      Print Label
                    </button>
                    <button
                      type="button"
                      disabled={busy || !shipment?.shiprocketOrderId}
                      onClick={() => runShipmentAction(order.id, 'generate_invoice')}
                      className="px-3 py-2 text-[10px] tracking-widest uppercase border border-slate-300 rounded-lg hover:bg-white disabled:opacity-50"
                    >
                      Print Invoice
                    </button>
                    <button
                      type="button"
                      disabled={busy || !(shipment?.awbCode || shipment?.trackingNumber)}
                      onClick={() => runShipmentAction(order.id, 'refresh')}
                      className="px-3 py-2 text-[10px] tracking-widest uppercase border border-slate-300 rounded-lg hover:bg-white disabled:opacity-50"
                    >
                      Refresh Status
                    </button>
                    {(shipment?.trackingUrl || shipment?.awbCode) && (
                      <a
                        href={
                          shipment.trackingUrl ||
                          `https://shiprocket.co/tracking/${shipment.awbCode || shipment.trackingNumber}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 text-[10px] tracking-widest uppercase border border-[#b8963e] text-[#b8963e] rounded-lg hover:bg-[#b8963e]/5"
                      >
                        Track Shipment
                      </a>
                    )}
                    {shipment?.labelUrl && (
                      <a
                        href={shipment.labelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 text-[10px] tracking-widest uppercase border border-slate-300 rounded-lg hover:bg-white"
                      >
                        Open Label
                      </a>
                    )}
                    {shipment?.invoiceUrl && (
                      <a
                        href={shipment.invoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 text-[10px] tracking-widest uppercase border border-slate-300 rounded-lg hover:bg-white"
                      >
                        Open Invoice
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {!orders.length && <p className="text-sm text-slate-500">No orders yet.</p>}
      </div>
    </section>
  );
}
