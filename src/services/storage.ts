import { supabase } from './supabase';

const isBrowser = typeof window !== 'undefined';
const MAX_IMAGE_DIMENSION = 1600;

const optimizeProductImage = async (file: File): Promise<File> => {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || typeof createImageBitmap !== 'function') {
    return file;
  }

  const bitmap = await createImageBitmap(file);
  try {
    if (bitmap.width * bitmap.height > 40_000_000) {
      throw new Error('Image is too large to safely process. Resize it and upload it again.');
    }

    const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not prepare the image for upload.');
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    const optimizedBlob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/webp', 0.84),
    );
    if (!optimizedBlob || optimizedBlob.type !== 'image/webp' || optimizedBlob.size >= file.size) {
      return file;
    }

    return new File(
      [optimizedBlob],
      `${file.name.replace(/\.[^.]+$/, '')}.webp`,
      { type: 'image/webp', lastModified: file.lastModified },
    );
  } finally {
    bitmap.close();
  }
};

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

  const uploadFile = await optimizeProductImage(file);
  const baseName = (descriptiveName || file.name.replace(/\.[^.]+$/, ''))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || 'product-image';
  const safeName = `${baseName}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${getImageExtension(uploadFile)}`;
  const filePath = `products/images/${safeName}`;

  const { error } = await supabase.storage.from('product-images').upload(filePath, uploadFile, {
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
