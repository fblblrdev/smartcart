import { supabase } from '../lib/supabase';
import { CheckoutFormData, GuestCartItem, Order } from '../types';

async function sendOrderEmailViaEdgeFunction(order: Order, items: GuestCartItem[]) {
  const emailItems = items.map((item) => ({
    product_id: item.product_id,
    quantity: item.quantity,
    price: item.product?.price ?? 0,
    product: { name: item.product?.name ?? item.product_id },
  }));

  await supabase.functions.invoke('send-order-email', {
    body: { order, items: emailItems },
  });
}

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

  const items = cartItems.map((item) => ({
    product_id: item.product_id,
    quantity: item.quantity,
    price: item.product?.price ?? 0,
  }));

  const { data, error } = await supabase.rpc('place_order', {
    p_customer_name: formData.customer_name,
    p_customer_email: formData.customer_email,
    p_customer_phone: formData.customer_phone,
    p_address: formData.address,
    p_city: formData.city,
    p_state: formData.state,
    p_pincode: formData.pincode,
    p_total_amount: total,
    p_items: items,
  });

  if (error) throw error;
  const order = data as Order;

  // Send email via Edge Function (server-side, no CORS issues)
  sendOrderEmailViaEdgeFunction(order, cartItems).catch((e) =>
    console.error('Email notification failed:', e)
  );

  return order;
}

export async function updateOrderStatus(id: string, status: string) {
  const { error } = await supabase.from('orders').update({ status }).eq('id', id);
  if (error) throw error;
}
