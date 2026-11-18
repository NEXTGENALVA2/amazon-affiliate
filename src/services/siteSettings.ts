import type { PublicStoreSettings, SocialSettings } from '../types';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function request<T>(options: RequestInit = {}, query = ''): Promise<T> {
  const response = await fetch(`/api/site-settings${query}`, {
    ...options,
    credentials: 'same-origin',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });
  if (!response.headers.get('content-type')?.includes('application/json')) {
    throw new Error('Site settings API is unavailable. Check the deployment and try again.');
  }
  const result = await response.json() as ApiResponse<T>;
  if (!response.ok) throw new Error(result.error || `Social settings request failed (${response.status}).`);
  return result.data as T;
}

export function getPublicSocialSettings(): Promise<SocialSettings | null> {
  return request();
}

export function savePublicSocialSettings(settings: SocialSettings): Promise<SocialSettings> {
  return request({
    method: 'POST',
    body: JSON.stringify({ settings }),
  });
}

export function getPublicStoreSettings(): Promise<PublicStoreSettings | null> {
  return request({ method: 'GET' }, '?type=storefront');
}

export function savePublicStoreSettings(settings: PublicStoreSettings): Promise<PublicStoreSettings> {
  return request({
    method: 'POST',
    body: JSON.stringify({ type: 'storefront', settings }),
  });
}
