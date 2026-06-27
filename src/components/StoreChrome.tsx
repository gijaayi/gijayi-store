'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import SocialContactToggle from '@/components/SocialContactToggle';
import MobileBottomNav from '@/components/MobileBottomNav';

export default function StoreChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');
  const isAuthRoute = pathname?.startsWith('/login') || pathname?.startsWith('/register');

  if (isAdminRoute || isAuthRoute) {
    return <main>{children}</main>;
  }

  return (
    <>
      <Suspense fallback={<div className="h-[100px] bg-white" />}>
        <Header />
      </Suspense>
      {/* pb-16 on mobile adds space so content is never hidden behind the sticky bottom nav */}
      <main className="pb-16 md:pb-0">{children}</main>
      <Footer />
      <CartDrawer />
      <SocialContactToggle />
      <MobileBottomNav />
    </>
  );
}
