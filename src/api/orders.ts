import { supabase } from '../lib/supabase';
import { CheckoutFormData, GuestCartItem, Order } from '../types';
import { sendOrderEmail } from './email';

export async function fetchOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(name, product_images(*)))')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchOrdersByEmail(email: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(name, product_images(*)))')
    .eq('customer_email', email)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createOrder(
  formData: CheckoutFormData,
  cartItems: GuestCartItem[]
): Promise<Order> {
  const total = cartItems.reduce((sum, item) => sum + (item.product?.price ?? 0) * item.quantity, 0);

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({ ...formData, total_amount: total, status: 'pending' })
    .select()
    .single();

  if (orderError) throw orderError;

  const orderItems = cartItems.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    price: item.product?.price ?? 0,
  }));

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
  if (itemsError) throw itemsError;

  // Reduce inventory
  for (const item of cartItems) {
    await supabase.rpc('decrement_product_quantity', {
      p_id: item.product_id,
      p_quantity: item.quantity,
    });
  }

  // Fire email without awaiting — don't block order completion
  sendOrderEmail(order, cartItems).catch((e) => console.error('Email notification failed:', e));

  return order;
}

export async function updateOrderStatus(id: string, status: string) {
  const { error } = await supabase.from('orders').update({ status }).eq('id', id);
  if (error) throw error;
}
