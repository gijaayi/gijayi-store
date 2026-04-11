export interface Product {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  category: string;
  collection: string;
  description: string;
  details: string[];
  sizes?: string[];
  isNew?: boolean;
  isBestseller?: boolean;
  slug: string;
  stock: number;
  mostWanted?: boolean;
  bridalLuxe?: boolean;
  heritage?: boolean;
  everydayMinimal?: boolean;
  nameFont?: 'serif' | 'sans-serif' | 'mono' | 'display' | 'elegant' | 'modern-sans' | 'geometric' | 'bold' | 'light' | 'script' | 'georgia' | 'premium';
  descriptionFont?: 'serif' | 'sans-serif' | 'mono' | 'elegant' | 'modern-sans' | 'geometric' | 'light' | 'premium';
  detailsFont?: 'serif' | 'sans-serif' | 'mono' | 'elegant' | 'modern-sans' | 'light' | 'premium';
}

export interface CartItem {
  product: Product;
  quantity: number;
  size?: string;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  itemCount: number;
}

export interface NavItem {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
}
