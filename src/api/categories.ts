import { supabase } from '../lib/supabase';
import { Category } from '../types';

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from('categories').select('*').order('name');
  if (error) throw error;
  return data ?? [];
}

export async function createCategory(category: Pick<Category, 'name' | 'description'>) {
  const { data, error } = await supabase.from('categories').insert(category).select().single();
  if (error) throw error;
  return data;
}

export async function updateCategory(id: string, category: Pick<Category, 'name' | 'description'>) {
  const { data, error } = await supabase.from('categories').update(category).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteCategory(id: string) {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}
