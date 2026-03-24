'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import SocialContactToggle from '@/components/SocialContactToggle';

export default function StoreChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  if (isAdminRoute) {
    return <main>{children}</main>;
  }

  return (
    <>
      <Suspense fallback={<div className="h-[100px] bg-white" />}>
        <Header />
      </Suspense>
      <main>{children}</main>
      <Footer />
      <CartDrawer />
      <SocialContactToggle />
    </>
  );
}
