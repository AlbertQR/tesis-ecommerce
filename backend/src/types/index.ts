export type ProductCategory = 'cafeteria' | 'pizzeria' | 'despensa' | 'combo';

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

export type Role = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  phone: string;
  avatar?: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  id: string;
  userId: string;
  label: string;
  street: string;
  number: string;
  city: string;
  neighborhood: string;
  instructions?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

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
  stock: number;
  createdAt: Date;
  updatedAt: Date;
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

export interface CartItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  userId: string;
  date: Date;
  status: OrderStatus;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  deliveryAddress: Address;
  invoiceUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Content {
  id: string;
  key: string;
  value: string;
  type: 'text' | 'image' | 'json';
  updatedAt: Date;
}
