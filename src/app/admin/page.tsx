'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Box, Folder, IndianRupee, MessageSquareText, ShoppingBag, Store, Users, TrendingUp, AlertCircle } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

interface AdminStats {
  users: number;
  products: number;
  categories: number;
  orders: number;
  contacts: number;
  revenue: number;
}

interface AnalyticsData {
  stats: AdminStats;
  revenueTrendData: Array<{ date: string; revenue: number }>;
  ordersByStatus: Record<string, number>;
  topProducts: Array<{ name: string; quantity: number; revenue: number }>;
  monthlyData: Array<{ month: string; revenue: number; orders: number }>;
  latestOrders: any[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AdminOverviewPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/overview', { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load analytics');
        const result = (await res.json()) as AnalyticsData;
        setData(result);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load dashboard'));
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="rounded-2xl p-6 md:p-8 bg-linear-to-r from-blue-700 via-indigo-700 to-slate-900 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] tracking-[0.4em] uppercase text-blue-100 mb-3">Analytics Dashboard</p>
            <h2 className="font-serif text-4xl md:text-5xl mb-3">Business Intelligence</h2>
            <p className="text-blue-50 max-w-2xl text-sm md:text-base">
              Real-time insights into your revenue, orders, products, and customer activity.
            </p>
          </div>
          <TrendingUp size={48} className="text-blue-200 opacity-80" />
        </div>
      </section>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle size={18} className="text-red-600" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {data && (
        <>
          {/* Key Metrics */}
          <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {[
              { label: 'Users', value: data.stats.users, icon: Users, color: 'blue' },
              { label: 'Products', value: data.stats.products, icon: Box, color: 'purple' },
              { label: 'Categories', value: data.stats.categories, icon: Folder, color: 'green' },
              { label: 'Orders', value: data.stats.orders, icon: ShoppingBag, color: 'orange' },
              { label: 'Inquiries', value: data.stats.contacts, icon: MessageSquareText, color: 'pink' },
              { label: 'Revenue', value: `₹${(data.stats.revenue / 1000).toFixed(1)}K`, icon: IndianRupee, color: 'yellow' },
            ].map((item) => {
              const Icon = item.icon;
              const colorClasses: Record<string, string> = {
                blue: 'bg-blue-50 text-blue-600 border-blue-200',
                purple: 'bg-purple-50 text-purple-600 border-purple-200',
                green: 'bg-green-50 text-green-600 border-green-200',
                orange: 'bg-orange-50 text-orange-600 border-orange-200',
                pink: 'bg-pink-50 text-pink-600 border-pink-200',
                yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
              };
              return (
                <div key={item.label} className={`border rounded-xl p-4 ${colorClasses[item.color]}`}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs tracking-widest uppercase font-semibold">{item.label}</p>
                    <Icon size={16} />
                  </div>
                  <p className="text-2xl font-bold">{item.value}</p>
                </div>
              );
            })}
          </section>

          {/* Charts Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Revenue Trend - Last 7 Days */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Revenue Trend (7 Days)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.revenueTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                    formatter={(value: any) => typeof value === 'number' ? `₹${value.toLocaleString('en-IN')}` : value}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Monthly Comparison */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Monthly Comparison (6 Months)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                    formatter={(value: any) => typeof value === 'number' ? `₹${value.toLocaleString('en-IN')}` : value}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#3b82f6" name="Revenue (₹)" />
                  <Bar dataKey="orders" fill="#10b981" name="Orders" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Order Status Distribution */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Order Status Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Pending', value: data.ordersByStatus.pending },
                      { name: 'Confirmed', value: data.ordersByStatus.confirmed },
                      { name: 'Shipped', value: data.ordersByStatus.shipped },
                      { name: 'Delivered', value: data.ordersByStatus.delivered },
                      { name: 'Cancelled', value: data.ordersByStatus.cancelled },
                    ].filter(item => item.value > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => `${value} order${value !== 1 ? 's' : ''}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Top Products by Revenue */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Top Products by Revenue</h3>
              <div className="space-y-3">
                {data.topProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{product.name}</p>
                        <p className="text-xs text-slate-500">{product.quantity} units sold</p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 whitespace-nowrap">₹{product.revenue.toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Access Links */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6">
            <h3 className="font-serif text-2xl text-slate-900 mb-4">Manage by Section</h3>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {[
                { label: 'Products', href: '/admin/products', desc: 'Create and edit products' },
                { label: 'Orders', href: '/admin/orders', desc: 'Track and update order status' },
                { label: 'Categories', href: '/admin/categories', desc: 'Manage product categories' },
                { label: 'Customers', href: '/admin/users', desc: 'View registered users' },
                { label: 'Inquiries', href: '/admin/inquiries', desc: 'Review contact requests' },
                { label: 'Storefront CMS', href: '/admin/storefront', desc: 'Edit homepage and card copy' },
              ].map((item) => (
                <Link key={item.href} href={item.href} className="rounded-xl border border-slate-200 p-4 hover:border-blue-500 hover:bg-blue-50/40 transition-colors">
                  <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                  <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                </Link>
              ))}
            </div>

            <Link href="/" className="inline-flex items-center gap-2 mt-5 text-xs tracking-widest uppercase text-blue-700 hover:text-blue-900">
              <Store size={14} /> Open Storefront
            </Link>
          </section>
        </>
      )}
    </div>
  );
}
