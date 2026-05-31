export type UserRole = 'RESELLER' | 'CUSTOMER';

export interface AppUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  category_id: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  categories?: Category;
  product_images?: ProductImage[];
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  products?: Product;
}

export interface Cart {
  id: string;
  user_id: string;
  cart_items?: CartItem[];
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  total_amount: number;
  status: OrderStatus;
  created_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  products?: Product;
}

export interface GuestCartItem {
  product_id: string;
  quantity: number;
  product?: Product;
}

export interface CheckoutFormData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}
