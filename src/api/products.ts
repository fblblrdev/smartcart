import { supabase } from '../lib/supabase';
import { Product } from '../types';

export interface ProductFilters {
  categoryId?: string;
  search?: string;
  sort?: 'newest' | 'price_asc' | 'price_desc';
  activeOnly?: boolean;
}

export async function fetchProducts(filters: ProductFilters = {}): Promise<Product[]> {
  let query = supabase
    .from('products')
    .select('*, categories(*), product_images(*)');

  if (filters.activeOnly !== false) query = query.eq('active', true);
  if (filters.categoryId) query = query.eq('category_id', filters.categoryId);
  if (filters.search) query = query.ilike('name', `%${filters.search}%`);

  if (filters.sort === 'price_asc') query = query.order('price', { ascending: true });
  else if (filters.sort === 'price_desc') query = query.order('price', { ascending: false });
  else query = query.order('created_at', { ascending: false });

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(*), product_images(*)')
    .eq('id', id)
    .single();
  if (error) return null;
  return data;
}

export async function createProduct(product: Partial<Product>) {
  const { data, error } = await supabase.from('products').insert(product).select().single();
  if (error) throw error;
  return data;
}

export async function updateProduct(id: string, product: Partial<Product>) {
  const { data, error } = await supabase.from('products').update({ ...product, updated_at: new Date().toISOString() }).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

export async function addProductImages(productId: string, imageUrls: string[]) {
  const records = imageUrls.map((url) => ({ product_id: productId, image_url: url }));
  const { error } = await supabase.from('product_images').insert(records);
  if (error) throw error;
}

export async function deleteProductImage(imageId: string) {
  const { error } = await supabase.from('product_images').delete().eq('id', imageId);
  if (error) throw error;
}

export async function uploadProductImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from('smartcart-product-images').upload(fileName, file);
  if (error) throw error;
  const { data } = supabase.storage.from('smartcart-product-images').getPublicUrl(fileName);
  return data.publicUrl;
}
