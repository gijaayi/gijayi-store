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
