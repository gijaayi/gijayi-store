'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, Search, Heart, User } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

const tabs = [
  { label: 'Home', href: '/', icon: Home, matchExact: true },
  { label: 'Shop', href: '/shop', icon: ShoppingBag, matchExact: false },
  { label: 'Wishlist', href: '/wishlist', icon: Heart, matchExact: false },
  { label: 'Account', href: '/profile', icon: User, matchExact: false },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { totalItems, toggleCart } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { user } = useAuth();

  // Don't show on admin, login, register routes
  const isHidden =
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/login') ||
    pathname?.startsWith('/register') ||
    pathname?.startsWith('/admin-login');

  if (isHidden) return null;

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href;
    return pathname?.startsWith(href);
  }

  const accountHref = user ? '/profile' : '/login';

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[#2d2416]"
      style={{
        background: 'linear-gradient(to top, #0a0a0a 80%, rgba(10,10,10,0.95))',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex items-center justify-around h-[60px] px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const href = tab.label === 'Account' ? accountHref : tab.href;
          const active = isActive(tab.href, tab.matchExact);
          const badgeCount = tab.label === 'Wishlist' ? wishlistCount : 0;

          return (
            <Link
              key={tab.label}
              href={href}
              className="relative flex flex-col items-center justify-center gap-0.5 w-14 h-full group"
            >
              <div className="relative">
                {active && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute -inset-2 rounded-xl bg-[#d4af37]/10"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon
                  size={20}
                  className={`relative transition-all duration-200 ${
                    active ? 'text-[#d4af37]' : 'text-[#888] group-active:text-[#d4af37]'
                  }`}
                  strokeWidth={active ? 2.2 : 1.8}
                />
                {badgeCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#d4af37] text-[#0f0f0f] text-[9px] font-bold rounded-full min-w-4 h-4 px-0.5 flex items-center justify-center leading-none">
                    {badgeCount}
                  </span>
                )}
              </div>
              <span
                className={`text-[9px] tracking-widest uppercase font-medium transition-colors duration-200 ${
                  active ? 'text-[#d4af37]' : 'text-[#666]'
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}

        {/* Cart button (opens drawer, not a link) */}
        <button
          onClick={toggleCart}
          className="relative flex flex-col items-center justify-center gap-0.5 w-14 h-full group"
        >
          <div className="relative">
            <ShoppingBag
              size={20}
              className="text-[#888] group-active:text-[#d4af37] transition-colors duration-200"
              strokeWidth={1.8}
            />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#d4af37] text-[#0f0f0f] text-[9px] font-bold rounded-full min-w-4 h-4 px-0.5 flex items-center justify-center leading-none">
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-[9px] tracking-widest uppercase font-medium text-[#666] group-active:text-[#d4af37] transition-colors duration-200">
            Cart
          </span>
        </button>
      </div>
    </nav>
  );
}
