import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { GuestCartItem, Product } from '../types';
import { useAuth } from './AuthContext';

const GUEST_CART_KEY = 'smartcart_guest_cart';

interface CartContextType {
  items: GuestCartItem[];
  itemCount: number;
  addItem: (product: Product, quantity?: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<GuestCartItem[]>([]);

  // Load cart on mount / user change
  useEffect(() => {
    if (user) {
      syncGuestCartToDb().then(() => loadDbCart());
    } else {
      loadGuestCart();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  function loadGuestCart() {
    try {
      const stored = localStorage.getItem(GUEST_CART_KEY);
      setItems(stored ? JSON.parse(stored) : []);
    } catch {
      setItems([]);
    }
  }

  function saveGuestCart(newItems: GuestCartItem[]) {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(newItems));
    setItems(newItems);
  }

  async function getOrCreateCart(userId: string): Promise<string> {
    let { data } = await supabase.from('carts').select('id').eq('user_id', userId).single();
    if (!data) {
      const { data: created } = await supabase.from('carts').insert({ user_id: userId }).select('id').single();
      data = created;
    }
    return data!.id;
  }

  async function loadDbCart() {
    if (!user) return;
    const { data: cart } = await supabase
      .from('carts')
      .select('id, cart_items(id, cart_id, product_id, quantity, products(*, product_images(*), categories(*)))')
      .eq('user_id', user.id)
      .single();

    if (!cart || !cart.cart_items) { setItems([]); return; }

    const mapped: GuestCartItem[] = (cart.cart_items as any[]).map((ci) => ({
      product_id: ci.product_id,
      quantity: ci.quantity,
      product: ci.products,
    }));
    setItems(mapped);
  }

  async function syncGuestCartToDb() {
    if (!user) return;
    const stored = localStorage.getItem(GUEST_CART_KEY);
    if (!stored) return;
    const guestItems: GuestCartItem[] = JSON.parse(stored);
    if (!guestItems.length) return;

    const cartId = await getOrCreateCart(user.id);

    for (const item of guestItems) {
      const { data: existing } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('cart_id', cartId)
        .eq('product_id', item.product_id)
        .single();

      if (existing) {
        await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + item.quantity })
          .eq('id', existing.id);
      } else {
        await supabase.from('cart_items').insert({ cart_id: cartId, product_id: item.product_id, quantity: item.quantity });
      }
    }
    localStorage.removeItem(GUEST_CART_KEY);
  }

  async function addItem(product: Product, quantity = 1) {
    if (user) {
      const cartId = await getOrCreateCart(user.id);
      const { data: existing } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('cart_id', cartId)
        .eq('product_id', product.id)
        .single();

      if (existing) {
        await supabase.from('cart_items').update({ quantity: existing.quantity + quantity }).eq('id', existing.id);
      } else {
        await supabase.from('cart_items').insert({ cart_id: cartId, product_id: product.id, quantity });
      }
      await loadDbCart();
    } else {
      const current = [...items];
      const idx = current.findIndex((i) => i.product_id === product.id);
      if (idx >= 0) {
        current[idx] = { ...current[idx], quantity: current[idx].quantity + quantity };
      } else {
        current.push({ product_id: product.id, quantity, product });
      }
      saveGuestCart(current);
    }
  }

  async function removeItem(productId: string) {
    if (user) {
      const { data: cart } = await supabase.from('carts').select('id').eq('user_id', user.id).single();
      if (cart) {
        await supabase.from('cart_items').delete().eq('cart_id', cart.id).eq('product_id', productId);
      }
      await loadDbCart();
    } else {
      saveGuestCart(items.filter((i) => i.product_id !== productId));
    }
  }

  async function updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) { await removeItem(productId); return; }
    if (user) {
      const { data: cart } = await supabase.from('carts').select('id').eq('user_id', user.id).single();
      if (cart) {
        await supabase.from('cart_items').update({ quantity }).eq('cart_id', cart.id).eq('product_id', productId);
      }
      await loadDbCart();
    } else {
      saveGuestCart(items.map((i) => i.product_id === productId ? { ...i, quantity } : i));
    }
  }

  async function clearCart() {
    if (user) {
      const { data: cart } = await supabase.from('carts').select('id').eq('user_id', user.id).single();
      if (cart) await supabase.from('cart_items').delete().eq('cart_id', cart.id);
      setItems([]);
    } else {
      localStorage.removeItem(GUEST_CART_KEY);
      setItems([]);
    }
  }

  const total = items.reduce((sum, item) => sum + (item.product?.price ?? 0) * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, itemCount, addItem, removeItem, updateQuantity, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
