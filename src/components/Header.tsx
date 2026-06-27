'use client';

import Image from 'next/image';
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

function slugify(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

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
          categories?: Array<{ name: string; slug: string }>;
        };

        const shop = data.storefront?.navigation?.shop;
        const gijayiEdit = data.storefront?.navigation?.gijayiEdit;
        const freshArrival = data.storefront?.navigation?.freshArrival;

        const dbCategories = (data.categories || []).map((cat) => String(cat.name || '').trim()).filter(Boolean);
        const shopSubcategories = dbCategories.length > 0
          ? dbCategories
          : (shop?.subcategories || []).map((name) => String(name || '').trim()).filter(Boolean);

        const nextLinks = [
          {
            label: shop?.label?.trim() || 'Shop',
            href: '/shop',
            children: shopSubcategories.map((name) => ({
              label: name,
              href: `/shop?category=${encodeURIComponent(name)}`,
            })),
          },
          {
            label: gijayiEdit?.label?.trim() || 'Gijayi Edit',
            href: '/collections',
            children: (gijayiEdit?.subcategories || [])
              .map((name) => String(name || '').trim())
              .filter(Boolean)
              .map((name) => ({ label: name, href: `/collections/${slugify(String(name || ''))}` })),
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
    setSearchValue(searchParams?.get('q') ?? '');
  }, [searchParams]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedValue = searchValue.trim();
    const params = new URLSearchParams(pathname === '/shop' ? searchParams?.toString() ?? '' : '');

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
      <div className="bg-[#171717] text-[#f5e7c1] py-2 sm:py-2.5 text-[10px] sm:text-xs tracking-widest uppercase font-medium overflow-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 text-center">
          <span className="inline-block">Worldwide Shipping &nbsp;|&nbsp; Complementary Repair &nbsp;|&nbsp; Easy Return</span>
        </div>
      </div>

      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-[#050505] shadow-black/10 border-b border-[#2d2416]' : 'bg-[#050505] border-b border-[#2d2416]'
        }`}
        style={{ backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.02), rgba(0,0,0,0))' }}
      >
        <div className="max-w-[1600px] mx-auto pl-0 pr-6 sm:pr-8 lg:pr-12">
          <div className="flex items-center justify-between h-[90px] sm:h-[110px] md:h-[130px]">
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 shrink-0 text-[#f5e7c1]"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} className="sm:w-6 sm:h-6" />
            </button>

            <div className="flex items-center gap-5 md:gap-6 lg:gap-8">
              <div className="flex items-center flex-shrink-0 ml-0 pl-0">
                <Link
                  href="/"
                  className="group relative flex items-center focus:outline-none focus-visible:outline-none focus-visible:ring-0 active:outline-none active:ring-0 border-none outline-none"
                >
                  <div className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-[#050505] z-10 pointer-events-none" />
                    <div className="relative w-[190px] h-[95px] sm:w-[210px] sm:h-[105px] md:w-[230px] md:h-[115px]">
                      <Image
                        src="/logo.png"
                        alt="Gijayi Luxury Jewellery"
                        fill
                        priority
                        className="object-contain mix-blend-lighten transition-all duration-500 group-hover:opacity-95"
                        sizes="(max-width: 640px) 190px, (max-width: 768px) 210px, 230px"
                      />
                    </div>
                  </div>
                </Link>
              </div>

              {/* Desktop Nav */}
              <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
              {navLinks.map((link) => (
                <div
                  key={link.label}
                  className="relative group"
                  onMouseEnter={() => setActiveDropdown(link.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  {link.children && link.children.length > 0 ? (
                    <button
                      type="button"
                      className="flex items-center gap-1 text-xs tracking-widest uppercase font-medium text-[#f5e7c1] hover:text-[#d4af37] transition-colors duration-200 py-2"
                    >
                      {link.label}
                      <ChevronDown size={12} />
                    </button>
                  ) : (
                    <Link
                      href={link.href}
                      className="flex items-center gap-1 text-xs tracking-widest uppercase font-medium text-[#f5e7c1] hover:text-[#d4af37] transition-colors duration-200 py-2"
                    >
                      {link.label}
                    </Link>
                  )}
                  {link.children && link.children.length > 0 && (
                    <AnimatePresence>
                      {activeDropdown === link.label && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[320px] bg-[#0f0f0f] shadow-black/20 border border-[#2d2416] py-3 z-50"
                        >
                          <div className="grid grid-cols-2 gap-1 px-2">
                            {link.children.map((child) => (
                              <Link
                                key={child.label}
                                href={child.href}
                                className="block px-3 py-2 text-[11px] tracking-widest uppercase text-[#f5e7c1] hover:text-[#d4af37] hover:bg-[#171717] transition-colors rounded"
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
          </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {user ? (
                <>
                  <Link href="/profile" className="hidden md:inline text-[11px] tracking-widest uppercase text-[#f5e7c1] hover:text-[#d4af37] transition-colors py-1">
                    Hi, {firstName}
                  </Link>
                  {user.role === 'admin' && (
                    <Link href="/admin" className="hidden md:inline text-[11px] tracking-widest uppercase text-[#f5e7c1] hover:text-[#d4af37] transition-colors py-1">
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={async () => {
                      await logout();
                      router.refresh();
                    }}
                    className="hidden md:inline text-[11px] tracking-widest uppercase text-[#f5e7c1] hover:text-[#d4af37] transition-colors py-1"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="hidden md:flex items-center gap-2 text-[11px] tracking-widest uppercase">
                  <Link href="/login" className="border border-[#3c2e1a] text-[#f5e7c1] px-4 py-2 rounded-full hover:border-[#d4af37] hover:text-[#d4af37] transition-colors">Login</Link>
                  <Link href="/register" className="border border-[#d4af37] text-[#f5e7c1] px-4 py-2 rounded-full hover:bg-[#d4af37] hover:text-[#0f0f0f] transition-all">Register</Link>
                </div>
              )}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-[#f5e7c1] hover:text-[#d4af37] transition-colors shrink-0"
                aria-label="Search"
              >
                <Search size={18} className="sm:w-5 sm:h-5" />
              </button>
              <Link
                href="/wishlist"
                className="p-2 text-[#f5e7c1] hover:text-[#d4af37] transition-colors relative shrink-0"
                aria-label="Wishlist"
              >
                <Heart size={18} className="sm:w-5 sm:h-5" />
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#d4af37] text-[#0f0f0f] text-[10px] rounded-full min-w-4 h-4 px-1 flex items-center justify-center font-medium">
                    {count}
                  </span>
                )}
              </Link>
              <button
                onClick={toggleCart}
                className="p-2 text-[#f5e7c1] hover:text-[#d4af37] transition-colors relative shrink-0"
                aria-label="Cart"
              >
                <ShoppingBag size={18} className="sm:w-5 sm:h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#d4af37] text-[#0f0f0f] text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-medium">
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
                className="overflow-hidden border-t border-[#2d2416]"
              >
                <form onSubmit={handleSearchSubmit} className="py-3 sm:py-4 flex items-center gap-2 sm:gap-3">
                  <Search size={16} className="text-[#d4af37] sm:w-4.5" />
                  <input
                    autoFocus
                    type="text"
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    placeholder="Search for jewellery..."
                    className="flex-1 outline-none text-sm text-[#f5e7c1] tracking-wide placeholder:text-[#d4af37]/70 bg-[#171717]"
                  />
                  <button
                    type="submit"
                    className="text-xs tracking-widest uppercase text-[#d4af37] hover:text-[#f5e7c1] transition-colors shrink-0"
                  >
                    Search
                  </button>
                  <button type="button" onClick={() => setSearchOpen(false)} className="shrink-0">
                    <X size={16} className="text-[#f5e7c1] sm:w-4.5" />
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
              className="fixed top-0 left-0 h-full w-72 sm:w-80 bg-[#0f0f0f] z-50 overflow-y-auto shadow-black/30"
            >
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#2d2416]">
                  <Link href="/" className="flex items-center gap-2">
                    <span className="text-2xl font-serif font-semibold tracking-[0.65em] uppercase text-[#f5e7c1]" aria-label="Gijayi">GIJAYI</span>
                  </Link>
                <button onClick={() => setMobileOpen(false)} className="p-1 hover:bg-[#171717] rounded">
                  <X size={20} className="text-[#f5e7c1]" />
                </button>
              </div>
              <nav className="p-4 sm:p-6 space-y-3 sm:space-y-4 text-[#f5e7c1]">
                <div className="pb-4 sm:pb-6 border-b border-[#2d2416]">
                  <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 border border-[#2d2416] bg-[#171717] px-3 py-2.5 rounded">
                    <Search size={14} className="text-[#d4af37]" />
                    <input
                      type="text"
                      value={searchValue}
                      onChange={(event) => setSearchValue(event.target.value)}
                      placeholder="Search the store"
                      className="flex-1 text-sm text-[#f5e7c1] bg-transparent outline-none placeholder:text-[#d4af37]/70"
                    />
                  </form>
                </div>
                {navLinks.map((link) => (
                  <div key={link.label} className="space-y-1">
                    <Link
                      href={link.href}
                      className="block text-sm sm:text-base tracking-widest uppercase font-medium text-[#f5e7c1] py-2 hover:text-[#d4af37] transition-colors"
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
                <div className="pt-3 sm:pt-4 border-t border-[#2d2416] grid grid-cols-2 gap-2 sm:gap-3 text-xs tracking-widest uppercase">
                  <Link href="/wishlist" className="border border-[#2d2416] text-[#f5e7c1] px-3 sm:px-4 py-3 text-center hover:border-[#d4af37] hover:text-[#d4af37] transition-colors rounded" onClick={() => setMobileOpen(false)}>
                    Wishlist
                  </Link>
                  <Link href="/track-order" className="border border-[#2d2416] text-[#f5e7c1] px-3 sm:px-4 py-3 text-center hover:border-[#d4af37] hover:text-[#d4af37] transition-colors rounded" onClick={() => setMobileOpen(false)}>
                    Track Order
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs tracking-widest uppercase">
                  {user ? (
                    <>
                      {user.role === 'admin' ? (
                        <Link href="/admin" className="border border-[#2d2416] text-[#f5e7c1] px-3 sm:px-4 py-3 text-center hover:border-[#d4af37] hover:text-[#d4af37] transition-colors rounded" onClick={() => setMobileOpen(false)}>
                          Admin
                        </Link>
                      ) : (
                        <Link href="/profile" className="border border-[#2d2416] text-[#f5e7c1] px-3 sm:px-4 py-3 text-center hover:border-[#d4af37] hover:text-[#d4af37] transition-colors rounded" onClick={() => setMobileOpen(false)}>
                          {firstName}
                        </Link>
                      )}
                      <button
                        onClick={async () => {
                          await logout();
                          setMobileOpen(false);
                          router.refresh();
                        }}
                        className="border border-[#2d2416] text-[#f5e7c1] px-3 sm:px-4 py-3 text-center hover:border-[#d4af37] hover:text-[#d4af37] transition-colors rounded"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" className="border border-[#2d2416] text-[#f5e7c1] px-3 sm:px-4 py-3 text-center hover:border-[#d4af37] hover:text-[#d4af37] transition-colors rounded" onClick={() => setMobileOpen(false)}>
                        Login
                      </Link>
                      <Link href="/register" className="border border-[#d4af37] text-[#f5e7c1] px-3 sm:px-4 py-3 text-center hover:bg-[#d4af37] hover:text-[#0f0f0f] transition-colors rounded" onClick={() => setMobileOpen(false)}>
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
