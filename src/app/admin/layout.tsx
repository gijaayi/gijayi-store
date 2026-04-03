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
  Palette,
  Settings,
  Image,
} from 'lucide-react';
import { useState, useEffect } from 'react';

const navItems = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { label: 'Categories', href: '/admin/categories', icon: Folder },
  { label: 'Customers', href: '/admin/users', icon: Users },
  { label: 'Inquiries', href: '/admin/inquiries', icon: MessageSquare },
  { label: 'Storefront CMS', href: '/admin/storefront', icon: Palette },
  { label: 'Instagram Gallery', href: '/admin/instagram-gallery', icon: Image },
];

function getTitle(pathname: string) {
  if (pathname === '/admin/products') return 'Products';
  if (pathname === '/admin/orders') return 'Orders';
  if (pathname === '/admin/categories') return 'Categories';
  if (pathname === '/admin/users') return 'Customers';
  if (pathname === '/admin/inquiries') return 'Inquiries';
  if (pathname === '/admin/storefront') return 'Storefront CMS';
  if (pathname === '/admin/instagram-gallery') return 'Instagram Gallery';
  return 'Overview';
}

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
    <div className="flex min-h-screen bg-[#f5f7fb] text-slate-900">
      <aside
        className={`fixed lg:relative left-0 top-0 h-screen w-72 bg-[#0f172a] text-slate-100 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } z-40 lg:z-0 shadow-2xl`}
      >
        <div className="h-24 flex items-center justify-between px-6 border-b border-slate-800/80">
          <div>
            <p className="text-[10px] tracking-[0.35em] uppercase text-slate-400 mb-1">Gijayi</p>
            <p className="font-serif text-2xl text-white">Admin Studio</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#2563eb] text-white shadow-md shadow-blue-900/25'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 pb-6 mt-auto space-y-2 border-t border-slate-700 pt-6">
          {/* Open Storefront Button */}
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-linear-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 px-4 py-2.5 text-xs font-semibold transition-all shadow-md hover:shadow-lg"
          >
            <Store size={16} />
            Open Storefront
          </Link>

          {/* Profile Card */}
          <div className="rounded-lg border-2 border-blue-400 bg-linear-to-br from-blue-600 via-blue-700 to-indigo-800 p-3 shadow-lg shadow-blue-500/20">
            <p className="text-xs font-bold text-white truncate">{user.name}</p>
            <p className="text-xs text-blue-100 truncate mt-0.5">{user.email}</p>
          </div>

          {/* Settings Button */}
          <Link
            href="/admin/profile"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-lg transition-all shadow-md hover:shadow-lg border border-blue-400/30"
          >
            <Settings size={16} />
            Settings
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-linear-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-lg transition-all shadow-md hover:shadow-lg border border-red-400/30"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-linear-to-r from-slate-50 to-blue-50 border-b border-slate-300 flex items-center justify-between px-6 lg:px-8 py-6 sticky top-0 z-50 shadow-sm">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-slate-600 hover:text-slate-900"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>

          <div className="flex-1 ml-4 lg:ml-0">
            <p className="text-[11px] uppercase tracking-[0.4em] text-slate-500 font-semibold mb-1.5">Admin Panel</p>
            <h1 className="font-serif text-4xl lg:text-5xl font-bold text-slate-900">{getTitle(pathname)}</h1>
          </div>

          <div className="hidden md:flex items-center gap-3 text-xs text-slate-600 bg-white px-4 py-2 rounded-lg border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Live Store Connected
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 lg:p-8 max-w-350 mx-auto w-full pt-8">{children}</div>
        </div>
      </main>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 lg:hidden z-30" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}
