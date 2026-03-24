'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Box, Folder, IndianRupee, MessageSquareText, ShoppingBag, Store, Users } from 'lucide-react';

interface AdminStats {
  users: number;
  products: number;
  categories: number;
  orders: number;
  contacts: number;
  revenue: number;
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/overview', { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load overview');
        const data = (await res.json()) as { stats: AdminStats };
        setStats(data.stats);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load dashboard'));
  }, []);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl p-6 md:p-8 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white">
        <p className="text-[10px] tracking-[0.4em] uppercase text-blue-100 mb-3">Commerce Control Hub</p>
        <h2 className="font-serif text-4xl md:text-5xl mb-3">Welcome to Gijayi Admin</h2>
        <p className="text-blue-50 max-w-2xl text-sm md:text-base">
          Manage catalog, orders, categories, inquiries, customers, and storefront content using dedicated pages.
        </p>
      </section>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-xl">{error}</p>}

      {stats && (
        <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {[
            { label: 'Users', value: stats.users, icon: Users },
            { label: 'Products', value: stats.products, icon: Box },
            { label: 'Categories', value: stats.categories, icon: Folder },
            { label: 'Orders', value: stats.orders, icon: ShoppingBag },
            { label: 'Inquiries', value: stats.contacts, icon: MessageSquareText },
            { label: 'Revenue', value: `₹${stats.revenue.toLocaleString('en-IN')}`, icon: IndianRupee },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs tracking-widest uppercase text-slate-500">{item.label}</p>
                  <Icon size={16} className="text-slate-500" />
                </div>
                <p className="text-2xl font-semibold text-slate-900">{item.value}</p>
              </div>
            );
          })}
        </section>
      )}

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
    </div>
  );
}
