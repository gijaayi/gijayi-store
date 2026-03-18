'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Folder,
  LogOut,
  Menu,
  X,
  MessageSquare,
  Store,
} from 'lucide-react';
import { useState, useEffect } from 'react';

const navItems = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Products', href: '/admin#products', icon: Package },
  { label: 'Orders', href: '/admin#orders', icon: ShoppingCart },
  { label: 'Categories', href: '/admin#categories', icon: Folder },
  { label: 'Customers', href: '/admin#users', icon: Users },
  { label: 'Inquiries', href: '/admin#inquiries', icon: MessageSquare },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading && user && user.role !== 'admin') {
      router.push('/');
    }
  }, [mounted, loading, user, router]);

  if (!mounted || loading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800 mb-4"></div>
          <p className="text-slate-600 text-sm">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  async function handleLogout() {
    await logout();
    router.push('/admin-login');
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <aside
        className={`fixed lg:relative left-0 top-0 h-screen w-72 bg-white border-r border-slate-200 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } z-50 lg:z-0 shadow-xl lg:shadow-none`}
      >
        <div className="h-24 flex items-center justify-between px-6 border-b border-slate-200">
          <div>
            <p className="text-[10px] tracking-[0.35em] uppercase text-slate-500 mb-1">Gijayi</p>
            <p className="font-serif text-2xl text-slate-900">Admin Studio</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-500 hover:text-slate-700"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === '/admin' && item.href === '/admin';

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 pb-4 mt-auto">
          <Link
            href="/"
            className="w-full mb-3 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 px-4 py-3 text-sm font-medium transition-colors"
          >
            <Store size={16} />
            Open Storefront
          </Link>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 mb-3">
            <p className="text-xs font-medium text-slate-900 truncate">{user.name}</p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-red-100"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="h-24 bg-white/90 backdrop-blur border-b border-slate-200 flex items-center justify-between px-6 lg:px-8">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-slate-600 hover:text-slate-900"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>

          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-slate-500 mb-1">Control Center</p>
            <h1 className="font-serif text-3xl text-slate-900">Dashboard</h1>
          </div>

          <div className="hidden md:flex items-center gap-3 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Live Store Connected
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">{children}</div>
        </div>
      </main>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 lg:hidden z-40" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}
