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

export async function uploadChatAttachment(
  file: File,
  visitorId: string,
  type: 'image' | 'audio'
): Promise<import('../types').ChatAttachment> {
  if (!supabase || !isBrowser) {
    throw new Error('Chat attachment storage is not configured.');
  }

  const response = await fetch('/api/chat?action=upload-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({
      visitorId,
      type,
      name: file.name,
      mimeType: file.type,
      size: file.size,
    }),
  });
  const result = await response.json() as {
    error?: string;
    path?: string;
    token?: string;
  };
  if (!response.ok || !result.path || !result.token) {
    throw new Error(result.error || 'Could not prepare chat attachment upload.');
  }

  const { error } = await supabase.storage
    .from('chat-attachments')
    .uploadToSignedUrl(result.path, result.token, file, {
      contentType: file.type,
      upsert: false,
    });
  if (error) {
    throw new Error(`Chat attachment upload failed: ${error.message}`);
  }

  return {
    path: result.path,
    type,
    name: file.name,
    mimeType: file.type,
    size: file.size,
  };
}
