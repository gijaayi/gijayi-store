'use client';

import { useEffect, useState } from 'react';

interface AdminOrder {
  id: string;
  orderCode: string;
  userName: string;
  status: string;
  totalAmount: number;
  createdAt: string;
}

function getOrderStatusClasses(status: string) {
  if (status === 'Delivered') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (status === 'In Transit') return 'bg-blue-50 text-blue-700 border-blue-200';
  if (status === 'Preparing for Dispatch') return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-slate-100 text-slate-700 border-slate-200';
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [error, setError] = useState('');

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

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6">
      <h2 className="font-serif text-3xl mb-1 text-slate-900">Order Operations</h2>
      <p className="text-sm text-slate-500 mb-6">Track and update live order status from one place.</p>

      {error && <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{error}</p>}

      <div className="space-y-3 max-h-[760px] overflow-y-auto pr-1">
        {orders.map((order) => (
          <div key={order.id} className="border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{order.orderCode}</p>
                <p className="text-xs text-slate-500">{order.userName} · {new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <p className="text-sm font-semibold text-slate-900">₹{order.totalAmount.toLocaleString('en-IN')}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-[10px] tracking-widest uppercase px-2 py-1 rounded-full border ${getOrderStatusClasses(order.status)}`}>
                {order.status}
              </span>
              <select
                value={order.status}
                onChange={(event) => updateOrderStatus(order.id, event.target.value)}
                className="flex-1 border border-slate-300 rounded-lg bg-white px-3 py-2 text-xs tracking-widest uppercase outline-none focus:border-blue-600"
              >
                {['Confirmed', 'Preparing for Dispatch', 'In Transit', 'Delivered'].map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
        {!orders.length && <p className="text-sm text-slate-500">No orders yet.</p>}
      </div>
    </section>
  );
}
