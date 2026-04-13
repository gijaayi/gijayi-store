'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ShoppingBag, Search, Menu, X, ChevronDown, Heart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { motion, AnimatePresence } from 'framer-motion';

const defaultNavLinks = [
  {
    label: 'Shop',
    href: '/shop',
    children: [
      { label: 'Earrings', href: '/shop?category=Earrings' },
      { label: 'Neck Pieces', href: '/shop?category=Neck+Pieces' },
      { label: 'Hand Accessories', href: '/shop?category=Hand+Accessories' },
      { label: 'Head Gears', href: '/shop?category=Head+Gears' },
      { label: 'Brooches', href: '/shop?category=Brooches' },
    ],
  },
  {
    label: 'Gijayi Edit',
    href: '/collections',
    children: [
      { label: 'Bano', href: '/shop?q=Bano' },
      { label: 'Begum', href: '/shop?q=Begum' },
      { label: 'Bi', href: '/shop?q=Bi' },
      { label: 'Khatoon', href: '/shop?q=Khatoon' },
      { label: 'Khanam', href: '/shop?q=Khanam' },
      { label: 'Naaz', href: '/shop?q=Naaz' },
    ],
  },
  {
    label: 'Fresh Arrival',
    href: '/shop?filter=new',
    children: [],
  },
];

export default function Header() {
  const { totalItems, toggleCart } = useCart();
  const { count } = useWishlist();
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [navLinks, setNavLinks] = useState(defaultNavLinks);
  const firstName = user?.name?.trim().split(' ')[0] || 'Account';

  useEffect(() => {
    let active = true;

    async function loadNavigation() {
      try {
        const response = await fetch('/api/storefront', { cache: 'no-store' });
        if (!response.ok) return;

        const data = (await response.json()) as {
          storefront?: {
            navigation?: {
              shop?: { label?: string; subcategories?: string[] };
              gijayiEdit?: { label?: string; subcategories?: string[] };
              freshArrival?: { label?: string };
            };
          };
        };

        const shop = data.storefront?.navigation?.shop;
        const gijayiEdit = data.storefront?.navigation?.gijayiEdit;
        const freshArrival = data.storefront?.navigation?.freshArrival;

        const nextLinks = [
          {
            label: shop?.label?.trim() || 'Shop',
            href: '/shop',
            children: (shop?.subcategories || [])
              .map((name) => String(name || '').trim())
              .filter(Boolean)
              .map((name) => ({ label: name, href: `/shop?category=${encodeURIComponent(name)}` })),
          },
          {
            label: gijayiEdit?.label?.trim() || 'Gijayi Edit',
            href: '/shop',
            children: (gijayiEdit?.subcategories || [])
              .map((name) => String(name || '').trim())
              .filter(Boolean)
              .map((name) => ({ label: name, href: `/shop?collection=${encodeURIComponent(name)}` })),
          },
          {
            label: freshArrival?.label?.trim() || 'Fresh Arrival',
            href: '/shop?filter=new',
            children: [],
          },
        ];

        if (active) {
          setNavLinks(nextLinks);
        }
      } catch {
        // keep default nav links
      }
    }

    loadNavigation();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setSearchValue(searchParams.get('q') ?? '');
  }, [searchParams]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedValue = searchValue.trim();
    const params = new URLSearchParams(pathname === '/shop' ? searchParams.toString() : '');

    if (trimmedValue) {
      params.set('q', trimmedValue);
    } else {
      params.delete('q');
    }

    router.push(`/shop${params.toString() ? `?${params.toString()}` : ''}`);
    setSearchOpen(false);
    setMobileOpen(false);
  }

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-slate-100 text-slate-800 py-2 sm:py-2.5 text-[10px] sm:text-xs tracking-widest uppercase font-medium overflow-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 text-center">
          <span className="inline-block">Worldwide Shipping &nbsp;|&nbsp; Delivery in 7–12 days</span>
        </div>
      </div>

      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white shadow-lg' : 'bg-white'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16 md:h-20">
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 shrink-0"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} className="sm:w-6 sm:h-6" />
            </button>

            {/* Logo */}
            <Link href="/" className="shrink-0 mx-auto sm:mx-0">
              <span className="font-serif text-lg sm:text-2xl md:text-3xl tracking-[0.2em] text-[#1a1a1a] uppercase">
                Gijayi
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
              {navLinks.map((link) => (
                <div
                  key={link.label}
                  className="relative group"
                  onMouseEnter={() => setActiveDropdown(link.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={link.href}
                    className="flex items-center gap-1 text-xs tracking-widest uppercase font-medium text-[#1a1a1a] hover:text-[#b8963e] transition-colors duration-200 py-2"
                  >
                    {link.label}
                    {link.children && link.children.length > 0 && (
                      <ChevronDown size={12} />
                    )}
                  </Link>
                  {link.children && link.children.length > 0 && (
                    <AnimatePresence>
                      {activeDropdown === link.label && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[320px] bg-white shadow-xl border border-gray-100 py-3 z-50"
                        >
                          <div className="grid grid-cols-2 gap-1 px-2">
                            {link.children.map((child) => (
                              <Link
                                key={child.label}
                                href={child.href}
                                className="block px-3 py-2 text-[11px] tracking-widest uppercase text-[#555] hover:text-[#b8963e] hover:bg-[#faf8f4] transition-colors rounded"
                              >
                                {child.label}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {user ? (
                <>
                  <Link href="/profile" className="hidden md:inline text-[11px] tracking-widest uppercase hover:text-[#b8963e] transition-colors py-1">
                    Hi, {firstName}
                  </Link>
                  {user.role === 'admin' && (
                    <Link href="/admin" className="hidden md:inline text-[11px] tracking-widest uppercase hover:text-[#b8963e] transition-colors py-1">
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={async () => {
                      await logout();
                      router.refresh();
                    }}
                    className="hidden md:inline text-[11px] tracking-widest uppercase hover:text-[#b8963e] transition-colors py-1"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="hidden md:flex items-center gap-2 text-[11px] tracking-widest uppercase">
                  <Link href="/login" className="border border-gray-200 px-4 py-2 rounded-full hover:border-[#b8963e] hover:text-[#b8963e] transition-colors">Login</Link>
                  <Link href="/register" className="bg-[#1a1a1a] text-white px-4 py-2 rounded-full hover:bg-[#b8963e] transition-colors">Register</Link>
                </div>
              )}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 hover:text-[#b8963e] transition-colors shrink-0"
                aria-label="Search"
              >
                <Search size={18} className="sm:w-5 sm:h-5" />
              </button>
              <Link
                href="/wishlist"
                className="p-2 hover:text-[#b8963e] transition-colors relative flex-shrink-0"
                aria-label="Wishlist"
              >
                <Heart size={18} className="sm:w-5 sm:h-5" />
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#1a1a1a] text-white text-[10px] rounded-full min-w-4 h-4 px-1 flex items-center justify-center font-medium">
                    {count}
                  </span>
                )}
              </Link>
              <button
                onClick={toggleCart}
                className="p-2 hover:text-[#b8963e] transition-colors relative flex-shrink-0"
                aria-label="Cart"
              >
                <ShoppingBag size={18} className="sm:w-5 sm:h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#b8963e] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-medium">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-t border-gray-100"
              >
                <form onSubmit={handleSearchSubmit} className="py-3 sm:py-4 flex items-center gap-2 sm:gap-3">
                  <Search size={16} className="text-gray-400 sm:w-4.5" />
                  <input
                    autoFocus
                    type="text"
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    placeholder="Search for jewellery..."
                    className="flex-1 outline-none text-sm tracking-wide placeholder:text-gray-400"
                  />
                  <button
                    type="submit"
                    className="text-xs tracking-widest uppercase text-[#b8963e] hover:text-[#1a1a1a] transition-colors shrink-0"
                  >
                    Search
                  </button>
                  <button type="button" onClick={() => setSearchOpen(false)} className="shrink-0">
                    <X size={16} className="text-gray-400 sm:w-4.5" />
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 left-0 h-full w-72 sm:w-80 bg-white z-50 overflow-y-auto shadow-lg"
            >
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100">
                <span className="font-serif text-xl sm:text-2xl tracking-widest uppercase">Gijayi</span>
                <button onClick={() => setMobileOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                  <X size={20} />
                </button>
              </div>
              <nav className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                <div className="pb-4 sm:pb-6 border-b border-gray-100">
                  <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 border border-gray-200 px-3 py-2.5 rounded">
                    <Search size={14} className="text-gray-400" />
                    <input
                      type="text"
                      value={searchValue}
                      onChange={(event) => setSearchValue(event.target.value)}
                      placeholder="Search the store"
                      className="flex-1 text-sm outline-none placeholder:text-gray-400"
                    />
                  </form>
                </div>
                {navLinks.map((link) => (
                  <div key={link.label} className="space-y-1">
                    <Link
                      href={link.href}
                      className="block text-sm sm:text-base tracking-widest uppercase font-medium text-[#1a1a1a] py-2 hover:text-[#b8963e] transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </Link>
                    {link.children && link.children.length > 0 && (
                      <div className="pl-4 space-y-2">
                        {link.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            className="block text-xs sm:text-sm tracking-widest uppercase text-[#777] hover:text-[#b8963e] py-1.5 transition-colors"
                            onClick={() => setMobileOpen(false)}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <div className="pt-3 sm:pt-4 border-t border-gray-100 grid grid-cols-2 gap-2 sm:gap-3 text-xs tracking-widest uppercase">
                  <Link href="/wishlist" className="border border-gray-200 px-3 sm:px-4 py-3 text-center hover:border-[#b8963e] hover:text-[#b8963e] transition-colors rounded" onClick={() => setMobileOpen(false)}>
                    Wishlist
                  </Link>
                  <Link href="/track-order" className="border border-gray-200 px-3 sm:px-4 py-3 text-center hover:border-[#b8963e] hover:text-[#b8963e] transition-colors rounded" onClick={() => setMobileOpen(false)}>
                    Track Order
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs tracking-widest uppercase">
                  {user ? (
                    <>
                      {user.role === 'admin' ? (
                        <Link href="/admin" className="border border-gray-200 px-3 sm:px-4 py-3 text-center hover:border-[#b8963e] hover:text-[#b8963e] transition-colors rounded" onClick={() => setMobileOpen(false)}>
                          Admin
                        </Link>
                      ) : (
                        <Link href="/profile" className="border border-gray-200 px-3 sm:px-4 py-3 text-center hover:border-[#b8963e] hover:text-[#b8963e] transition-colors rounded" onClick={() => setMobileOpen(false)}>
                          {firstName}
                        </Link>
                      )}
                      <button
                        onClick={async () => {
                          await logout();
                          setMobileOpen(false);
                          router.refresh();
                        }}
                        className="border border-gray-200 px-3 sm:px-4 py-3 text-center hover:border-[#b8963e] hover:text-[#b8963e] transition-colors rounded"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" className="border border-gray-200 px-3 sm:px-4 py-3 text-center hover:border-[#b8963e] hover:text-[#b8963e] transition-colors rounded" onClick={() => setMobileOpen(false)}>
                        Login
                      </Link>
                      <Link href="/register" className="bg-[#1a1a1a] text-white border border-[#1a1a1a] px-3 sm:px-4 py-3 text-center hover:bg-[#b8963e] hover:border-[#b8963e] transition-colors rounded" onClick={() => setMobileOpen(false)}>
                        Register
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
