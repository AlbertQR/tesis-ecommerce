export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  image: string;
  isFeatured?: boolean;
  isHot?: boolean;
  isCombo?: boolean;
  stock?: number;
}

export type ProductCategory = 'cafeteria' | 'pizzeria' | 'despensa' | 'combo';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartItemResponse {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
}

export interface Category {
  id: ProductCategory;
  name: string;
  description: string;
  image: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  comment: string;
  rating: number;
  initials: string;
}

export interface Combo {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  includes: string[];
  isFeatured?: boolean;
  discount?: number;
}
