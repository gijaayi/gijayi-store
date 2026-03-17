'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Product } from '@/lib/types';

interface WishlistContextType {
  items: Product[];
  count: number;
  isWishlisted: (productId: string) => boolean;
  toggleItem: (product: Product) => void;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const STORAGE_KEY = 'gijayi-wishlist';

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored) as Product[]);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [hydrated, items]);

  const value = useMemo<WishlistContextType>(
    () => ({
      items,
      count: items.length,
      isWishlisted: (productId: string) => items.some((item) => item.id === productId),
      toggleItem: (product: Product) => {
        setItems((currentItems) => {
          const exists = currentItems.some((item) => item.id === product.id);
          if (exists) {
            return currentItems.filter((item) => item.id !== product.id);
          }

          return [...currentItems, product];
        });
      },
      clearWishlist: () => setItems([]),
    }),
    [items]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }

  return context;
}