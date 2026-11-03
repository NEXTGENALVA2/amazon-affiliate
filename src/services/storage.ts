import { supabase } from './supabase';

const isBrowser = typeof window !== 'undefined';

export async function uploadImageToSupabase(file: File): Promise<string | null> {
  if (!supabase || !isBrowser) return null;

  const fileExt = file.name.split('.').pop() || 'jpg';
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
  const filePath = `products/images/${safeName}`;

  const { error } = await supabase.storage.from('product-images').upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) {
    console.warn('Supabase image upload failed', error);
    return null;
  }

  const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
  return data.publicUrl || null;
}

export async function uploadVideoToSupabase(file: File): Promise<string | null> {
  if (!supabase || !isBrowser) return null;

  const fileExt = file.name.split('.').pop() || 'mp4';
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
  const filePath = `products/videos/${safeName}`;

  const { error } = await supabase.storage.from('product-videos').upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) {
    console.warn('Supabase video upload failed', error);
    return null;
  }

  const { data } = supabase.storage.from('product-videos').getPublicUrl(filePath);
  return data.publicUrl || null;
}
