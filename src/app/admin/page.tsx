'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ArrowUpRight, IndianRupee, Layers, MessageSquareText, Package, ShoppingBag, Users } from 'lucide-react';

interface AdminStats {
  users: number;
  products: number;
  categories: number;
  orders: number;
  contacts: number;
  revenue: number;
}

interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

interface AdminContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  topic: string;
  message: string;
  status: 'new' | 'closed';
  createdAt: string;
}

interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  category: string;
  collection: string;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
}

interface AdminOrder {
  id: string;
  orderCode: string;
  userName: string;
  status: string;
  totalAmount: number;
  createdAt: string;
}

const defaultForm = {
  name: '',
  price: '',
  stock: '',
  category: '',
  collection: '',
  description: '',
  image: '',
  details: '',
};

function getOrderStatusClasses(status: string) {
  if (status === 'Delivered') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (status === 'In Transit') return 'bg-blue-50 text-blue-700 border-blue-200';
  if (status === 'Preparing for Dispatch') return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-slate-100 text-slate-700 border-slate-200';
}

export default function AdminPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [contacts, setContacts] = useState<AdminContact[]>([]);

  const [newCategory, setNewCategory] = useState('');
  const [form, setForm] = useState(defaultForm);
  const [selectedProductId, setSelectedProductId] = useState<string>('');

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedProductId) || null,
    [products, selectedProductId]
  );

  async function fetchData() {
    const [overviewRes, productsRes, usersRes, ordersRes, categoriesRes] = await Promise.all([
      fetch('/api/admin/overview', { cache: 'no-store' }),
      fetch('/api/admin/products', { cache: 'no-store' }),
      fetch('/api/admin/users', { cache: 'no-store' }),
      fetch('/api/admin/orders', { cache: 'no-store' }),
      fetch('/api/admin/categories', { cache: 'no-store' }),
    ]);

    if ([overviewRes, productsRes, usersRes, ordersRes, categoriesRes].some((res) => !res.ok)) {
      throw new Error('Unable to load admin data.');
    }

    const overviewData = (await overviewRes.json()) as { stats: AdminStats; latestContacts: AdminContact[] };
    const productsData = (await productsRes.json()) as { products: AdminProduct[] };
    const usersData = (await usersRes.json()) as { users: AdminUser[] };
    const ordersData = (await ordersRes.json()) as { orders: AdminOrder[] };
    const categoriesData = (await categoriesRes.json()) as { categories: AdminCategory[] };

    setStats(overviewData.stats);
    setProducts(productsData.products);
    setUsers(usersData.users);
    setOrders(ordersData.orders);
    setCategories(categoriesData.categories);
    setContacts(overviewData.latestContacts ?? []);
  }

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/login?redirect=/admin');
      return;
    }

    if (user.role !== 'admin') {
      router.push('/');
      return;
    }

    fetchData().catch((fetchError) => setError(fetchError instanceof Error ? fetchError.message : 'Failed to load admin panel'));
  }, [loading, user, router]);

  useEffect(() => {
    if (!selectedProduct) return;

    setForm({
      name: selectedProduct.name,
      price: String(selectedProduct.price),
      stock: String(selectedProduct.stock),
      category: selectedProduct.category,
      collection: selectedProduct.collection,
      description: '',
      image: '',
      details: '',
    });
  }, [selectedProduct]);

  async function handleCreateOrUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');

    const payload = {
      name: form.name,
      price: Number(form.price),
      stock: Number(form.stock),
      category: form.category,
      collection: form.collection,
      description: form.description || 'Handcrafted by Gijayi artisans.',
      images: form.image ? [form.image] : undefined,
      details: form.details ? form.details.split(',').map((item) => item.trim()).filter(Boolean) : undefined,
    };

    const endpoint = selectedProductId ? `/api/admin/products/${selectedProductId}` : '/api/admin/products';
    const method = selectedProductId ? 'PUT' : 'POST';

    const response = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(data.error || 'Failed to save product.');
      setBusy(false);
      return;
    }

    setForm(defaultForm);
    setSelectedProductId('');
    await fetchData();
    setBusy(false);
  }

  async function handleCreateCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const categoryName = newCategory.trim();
    if (!categoryName) return;

    setBusy(true);
    setError('');

    const response = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: categoryName }),
    });

    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(data.error || 'Failed to add category.');
      setBusy(false);
      return;
    }

    setNewCategory('');
    await fetchData();
    setBusy(false);
  }

  async function updateOrderStatus(orderId: string, status: string) {
    await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    await fetchData();
  }

  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800 mx-auto mb-4"></div>
          <p className="text-sm text-slate-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-10 space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 md:p-8">
        <p className="text-[10px] tracking-[0.45em] uppercase text-slate-300 mb-3">Commerce Command Center</p>
        <h2 className="font-serif text-4xl md:text-5xl mb-4">Scale Gijayi with Confidence</h2>
        <p className="text-slate-200 max-w-2xl leading-relaxed">
          Manage products, orders, categories, and customer interactions from one streamlined dashboard designed for high-conversion ecommerce operations.
        </p>
      </section>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-xl">{error}</p>}

      {stats && (
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Users', value: stats.users, icon: Users },
            { label: 'Products', value: stats.products, icon: Package },
            { label: 'Categories', value: stats.categories, icon: Layers },
            { label: 'Orders', value: stats.orders, icon: ShoppingBag },
            { label: 'Inquiries', value: stats.contacts, icon: MessageSquareText },
            { label: 'Revenue', value: `₹${stats.revenue.toLocaleString('en-IN')}`, icon: IndianRupee },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs tracking-widest uppercase text-slate-500 font-medium">{item.label}</p>
                  <Icon size={16} className="text-slate-500" />
                </div>
                <p className="text-2xl font-semibold text-slate-900">{item.value}</p>
              </div>
            );
          })}
        </section>
      )}

      <section id="products" className="grid xl:grid-cols-[1.35fr,1fr] gap-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs tracking-[0.35em] uppercase text-slate-500 mb-1 font-medium">Catalog Studio</p>
              <h3 className="font-serif text-2xl text-slate-900">Create or Edit Product</h3>
            </div>
            {selectedProductId && (
              <button
                onClick={() => {
                  setSelectedProductId('');
                  setForm(defaultForm);
                }}
                className="text-xs tracking-widest uppercase text-slate-600 hover:text-slate-900 font-medium"
              >
                Reset
              </button>
            )}
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs tracking-widest uppercase text-slate-600 mb-2 font-medium">Edit Existing Product</label>
              <select
                value={selectedProductId}
                onChange={(event) => setSelectedProductId(event.target.value)}
                className="w-full border border-slate-300 rounded-xl bg-white text-slate-900 px-4 py-3 text-sm outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-800/20"
              >
                <option value="">Create new product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            <form className="space-y-4" onSubmit={handleCreateOrUpdate}>
              <div>
                <label className="block text-xs tracking-widest uppercase text-slate-600 mb-2 font-medium">Product Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  placeholder="Product name"
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-800/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs tracking-widest uppercase text-slate-600 mb-2 font-medium">Price (₹)</label>
                  <input
                    required
                    type="number"
                    value={form.price}
                    onChange={(event) => setForm({ ...form, price: event.target.value })}
                    placeholder="Price"
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-800/20"
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase text-slate-600 mb-2 font-medium">Stock</label>
                  <input
                    required
                    type="number"
                    value={form.stock}
                    onChange={(event) => setForm({ ...form, stock: event.target.value })}
                    placeholder="Stock"
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-800/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs tracking-widest uppercase text-slate-600 mb-2 font-medium">Category</label>
                  <input
                    required
                    value={form.category}
                    onChange={(event) => setForm({ ...form, category: event.target.value })}
                    placeholder="Category"
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-800/20"
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase text-slate-600 mb-2 font-medium">Collection</label>
                  <input
                    required
                    value={form.collection}
                    onChange={(event) => setForm({ ...form, collection: event.target.value })}
                    placeholder="Collection"
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-800/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs tracking-widest uppercase text-slate-600 mb-2 font-medium">Primary Image URL</label>
                <input
                  value={form.image}
                  onChange={(event) => setForm({ ...form, image: event.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-800/20"
                />
              </div>

              <div>
                <label className="block text-xs tracking-widest uppercase text-slate-600 mb-2 font-medium">Details (comma separated)</label>
                <input
                  value={form.details}
                  onChange={(event) => setForm({ ...form, details: event.target.value })}
                  placeholder="Material, Care Instructions, etc."
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-800/20"
                />
              </div>

              <div>
                <label className="block text-xs tracking-widest uppercase text-slate-600 mb-2 font-medium">Description</label>
                <textarea
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  placeholder="Detailed product description"
                  rows={3}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-800/20"
                />
              </div>

              <button
                disabled={busy}
                type="submit"
                className="w-full bg-slate-900 text-white py-3 rounded-xl text-xs tracking-widest uppercase hover:bg-slate-800 transition-all disabled:opacity-50 font-medium"
              >
                {busy ? 'Saving...' : selectedProductId ? 'Update Product' : 'Add Product'}
              </button>
            </form>
          </div>
        </div>

        <div id="orders" className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="px-6 py-5 border-b border-slate-200">
            <p className="text-xs tracking-[0.35em] uppercase text-slate-500 mb-1 font-medium">Order Operations</p>
            <h3 className="font-serif text-2xl text-slate-900">Live Orders</h3>
          </div>
          <div className="p-6 space-y-3 max-h-[680px] overflow-y-auto">
            {orders.map((order) => (
              <div key={order.id} className="border border-slate-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{order.orderCode}</p>
                    <p className="text-xs text-slate-600">{order.userName}</p>
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
                    className="flex-1 border border-slate-300 rounded-lg bg-white text-slate-900 px-3 py-2 text-xs tracking-widest uppercase outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-800/20"
                  >
                    {['Confirmed', 'Preparing for Dispatch', 'In Transit', 'Delivered'].map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
            {!orders.length && <p className="text-sm text-slate-600 py-4">No orders yet.</p>}
          </div>
        </div>
      </section>

      <section className="grid lg:grid-cols-3 gap-8">
        <div id="users" className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="px-6 py-5 border-b border-slate-200">
            <p className="text-xs tracking-[0.35em] uppercase text-slate-500 mb-1 font-medium">Customer Base</p>
            <h3 className="font-serif text-2xl text-slate-900">Registered Users</h3>
          </div>
          <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
            {users.map((appUser) => (
              <div key={appUser.id} className="border border-slate-200 rounded-xl p-3 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{appUser.name}</p>
                    <p className="text-xs text-slate-600">{appUser.email}</p>
                  </div>
                  <span className="text-[10px] tracking-widest uppercase px-2 py-1 border border-slate-300 text-slate-700 rounded-full bg-slate-50 whitespace-nowrap">
                    {appUser.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div id="categories" className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="px-6 py-5 border-b border-slate-200">
            <p className="text-xs tracking-[0.35em] uppercase text-slate-500 mb-1 font-medium">Taxonomy</p>
            <h3 className="font-serif text-2xl text-slate-900">Categories</h3>
          </div>
          <div className="p-6">
            <form onSubmit={handleCreateCategory} className="flex gap-2 mb-4">
              <input
                value={newCategory}
                onChange={(event) => setNewCategory(event.target.value)}
                placeholder="Add category"
                className="flex-1 border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-800/20"
              />
              <button
                disabled={busy}
                type="submit"
                className="bg-slate-900 text-white px-4 py-3 text-xs tracking-widest uppercase hover:bg-slate-800 transition-colors disabled:opacity-50 rounded-xl font-medium"
              >
                Add
              </button>
            </form>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {categories.map((category) => (
                <div key={category.id} className="border border-slate-200 rounded-xl p-3 hover:shadow-sm transition-shadow flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-900 truncate">{category.name}</p>
                  <p className="text-[10px] tracking-widest uppercase text-slate-600 shrink-0">{category.slug}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs tracking-[0.35em] uppercase text-slate-500 mb-1 font-medium">Inventory Pulse</p>
              <h3 className="font-serif text-2xl text-slate-900">Top Products</h3>
            </div>
            <ArrowUpRight size={16} className="text-slate-500" />
          </div>
          <div className="p-6 space-y-2 max-h-96 overflow-y-auto">
            {products.slice(0, 30).map((product) => (
              <div key={product.id} className="border border-slate-200 rounded-xl p-3 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{product.name}</p>
                    <p className="text-xs text-slate-600 truncate">{product.category} · {product.collection}</p>
                  </div>
                  <p className="text-xs tracking-widest uppercase text-slate-600 whitespace-nowrap">Stock: {product.stock}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="inquiries" className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="px-6 py-5 border-b border-slate-200">
          <p className="text-xs tracking-[0.35em] uppercase text-slate-500 mb-1 font-medium">Customer Relations</p>
          <h3 className="font-serif text-2xl text-slate-900">Recent Inquiries</h3>
        </div>
        <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
          {contacts.map((contact) => (
            <div key={contact.id} className="border border-slate-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <p className="text-sm font-medium text-slate-900">{contact.firstName} {contact.lastName}</p>
                  <p className="text-xs text-slate-600">{contact.email}{contact.phone && ` · ${contact.phone}`}</p>
                </div>
                <span className="text-[10px] tracking-widest uppercase px-2 py-1 border border-slate-300 text-slate-700 rounded-full bg-slate-50 whitespace-nowrap">
                  {contact.topic}
                </span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{contact.message}</p>
            </div>
          ))}
          {!contacts.length && <p className="text-sm text-slate-600 py-4">No inquiries yet.</p>}
        </div>
      </section>
    </div>
  );
}
