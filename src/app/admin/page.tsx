'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

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
    const categoriesData = (await categoriesRes.json()) as {
      categories: AdminCategory[];
    };

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

  async function updateOrderStatus(orderId: string, status: string) {
    await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    await fetchData();
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
    <div className="pb-10">
      <div className="mb-8">
        <p className="text-xs tracking-[0.35em] uppercase text-slate-500 mb-2 font-medium">Operations Overview</p>
        <h2 className="font-serif text-3xl text-slate-900">Business Snapshot</h2>
      </div>

      {error && <p className="mb-6 text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-lg">{error}</p>}

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          {[
            ['Users', stats.users],
            ['Products', stats.products],
            ['Categories', stats.categories],
            ['Orders', stats.orders],
            ['Inquiries', stats.contacts],
            ['Revenue', `₹${stats.revenue.toLocaleString('en-IN')}`],
          ].map(([label, value]) => (
            <div key={String(label)} className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-3">{value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8 mb-10">
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs tracking-[0.35em] uppercase text-slate-500 mb-1 font-medium">Manage</p>
              <h2 className="font-serif text-2xl text-slate-900">Products</h2>
            </div>
            {selectedProductId && (
              <button
                onClick={() => {
                  setSelectedProductId('');
                  setForm(defaultForm);
                }}
                className="text-xs tracking-widest uppercase text-slate-600 hover:text-slate-900 font-medium"
              >
                New Product
              </button>
            )}
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs tracking-widest uppercase text-slate-600 mb-2 font-medium">Edit Existing Product</label>
              <select
                value={selectedProductId}
                onChange={(event) => setSelectedProductId(event.target.value)}
                className="w-full border border-slate-300 rounded-lg bg-white text-slate-900 px-4 py-3 text-sm outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-800/20"
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
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-800/20" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs tracking-widest uppercase text-slate-600 mb-2 font-medium">Price (₹)</label>
                  <input required type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Price" className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-800/20" />
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase text-slate-600 mb-2 font-medium">Stock</label>
                  <input required type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="Stock" className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-800/20" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs tracking-widest uppercase text-slate-600 mb-2 font-medium">Category</label>
                  <input required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Category" className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-800/20" />
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase text-slate-600 mb-2 font-medium">Collection</label>
                  <input required value={form.collection} onChange={(e) => setForm({ ...form, collection: e.target.value })} placeholder="Collection" className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-800/20" />
                </div>
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase text-slate-600 mb-2 font-medium">Primary Image URL</label>
                <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://example.com/image.jpg" className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-800/20" />
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase text-slate-600 mb-2 font-medium">Details (comma separated)</label>
                <input value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} placeholder="Material, Care Instructions, etc." className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-800/20" />
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase text-slate-600 mb-2 font-medium">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Detailed product description" rows={3} className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-800/20" />
              </div>
              <button disabled={busy} type="submit" className="w-full bg-gradient-to-r from-slate-800 to-slate-700 text-white py-3 rounded-lg text-xs tracking-widest uppercase hover:from-slate-700 hover:to-slate-600 transition-all disabled:opacity-50 font-medium">
                {busy ? 'Saving...' : selectedProductId ? 'Update Product' : 'Add Product'}
              </button>
            </form>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-6 py-5 border-b border-slate-200">
            <p className="text-xs tracking-[0.35em] uppercase text-slate-500 mb-1 font-medium">Recent</p>
            <h2 className="font-serif text-2xl text-slate-900">Orders</h2>
          </div>
          <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
            {orders.map((order) => (
              <div key={order.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{order.orderCode}</p>
                    <p className="text-xs text-slate-600">{order.userName}</p>
                  </div>
                  <p className="text-sm font-medium text-slate-900">₹{order.totalAmount.toLocaleString('en-IN')}</p>
                </div>
                <select
                  value={order.status}
                  onChange={(event) => updateOrderStatus(order.id, event.target.value)}
                  className="w-full border border-slate-300 rounded-lg bg-white text-slate-900 px-3 py-2 text-xs tracking-widest uppercase outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-800/20"
                >
                  {['Confirmed', 'Preparing for Dispatch', 'In Transit', 'Delivered'].map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-6 py-5 border-b border-slate-200">
            <p className="text-xs tracking-[0.35em] uppercase text-slate-500 mb-1 font-medium">Users</p>
            <h2 className="font-serif text-2xl text-slate-900">Registered</h2>
          </div>
          <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
            {users.map((appUser) => (
              <div key={appUser.id} className="border border-slate-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{appUser.name}</p>
                    <p className="text-xs text-slate-600">{appUser.email}</p>
                  </div>
                  <span className="text-[10px] tracking-widest uppercase px-2 py-1 border border-slate-300 text-slate-700 rounded bg-slate-50 whitespace-nowrap">
                    {appUser.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-6 py-5 border-b border-slate-200">
            <p className="text-xs tracking-[0.35em] uppercase text-slate-500 mb-1 font-medium">Manage</p>
            <h2 className="font-serif text-2xl text-slate-900">Categories</h2>
          </div>
          <div className="p-6">
            <form onSubmit={handleCreateCategory} className="flex gap-2 mb-4">
              <input
                value={newCategory}
                onChange={(event) => setNewCategory(event.target.value)}
                placeholder="Add category"
                className="flex-1 border border-slate-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-800/20"
              />
              <button
                disabled={busy}
                type="submit"
                className="bg-slate-800 text-white px-4 py-3 text-xs tracking-widest uppercase hover:bg-slate-700 transition-colors disabled:opacity-50 rounded-lg font-medium"
              >
                Add
              </button>
            </form>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {categories.map((category) => (
                <div key={category.id} className="border border-slate-200 rounded-lg p-3 hover:shadow-sm transition-shadow flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-900">{category.name}</p>
                  <p className="text-[10px] tracking-widest uppercase text-slate-600">{category.slug}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-6 py-5 border-b border-slate-200">
            <p className="text-xs tracking-[0.35em] uppercase text-slate-500 mb-1 font-medium">Gallery</p>
            <h2 className="font-serif text-2xl text-slate-900">Products</h2>
          </div>
          <div className="p-6 space-y-2 max-h-96 overflow-y-auto">
            {products.slice(0, 30).map((product) => (
              <div key={product.id} className="border border-slate-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
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
        </section>
      </div>

      <section className="bg-white rounded-xl border border-slate-200 shadow-sm mt-8">
        <div className="px-6 py-5 border-b border-slate-200">
          <p className="text-xs tracking-[0.35em] uppercase text-slate-500 mb-1 font-medium">Recent</p>
          <h2 className="font-serif text-2xl text-slate-900">Inquiries</h2>
        </div>
        <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
          {contacts.map((contact) => (
            <div key={contact.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <p className="text-sm font-medium text-slate-900">{contact.firstName} {contact.lastName}</p>
                  <p className="text-xs text-slate-600">{contact.email}{contact.phone && ` · ${contact.phone}`}</p>
                </div>
                <span className="text-[10px] tracking-widest uppercase px-2 py-1 border border-slate-300 text-slate-700 rounded bg-slate-50 whitespace-nowrap">
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
