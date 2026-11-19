import { supabase } from './supabase';

const isBrowser = typeof window !== 'undefined';

const getImageExtension = (file: File): string => {
  const filenameExtension = file.name.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase();
  if (filenameExtension && ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'svg', 'bmp'].includes(filenameExtension)) {
    return filenameExtension;
  }
  const mimeExtensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/avif': 'avif',
    'image/svg+xml': 'svg',
    'image/bmp': 'bmp',
  };
  return mimeExtensions[file.type] || 'jpg';
};

export async function uploadImageToSupabase(file: File, descriptiveName?: string): Promise<string | null> {
  if (!supabase || !isBrowser) return null;

  const baseName = (descriptiveName || file.name.replace(/\.[^.]+$/, ''))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || 'product-image';
  const safeName = `${baseName}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${getImageExtension(file)}`;
  const filePath = `products/images/${safeName}`;

  const { error } = await supabase.storage.from('product-images').upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) {
    console.error('Supabase image upload failed', error);
    throw new Error(`Image upload failed: ${error.message}`);
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
