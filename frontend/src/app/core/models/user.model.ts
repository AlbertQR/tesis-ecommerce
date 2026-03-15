export interface UserModel {
  id: string;
  name?: string;
  email: string;
  phone?: string;
  avatar?: string;
  role?: 'user' | 'admin';
}

export interface Address {
  id: string;
  label: string;
  street: string;
  number: string;
  city: string;
  neighborhood: string;
  instructions?: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  userId?: string;
  date: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  deliveryAddress: Address;
  invoiceUrl?: string;
  expiresAt?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
}

export interface UserProfile {
  user: UserModel;
  addresses: Address[];
  orders: Order[];
}
