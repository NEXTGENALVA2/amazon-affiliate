import { SocialSettings } from '../types';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function request<T>(options: RequestInit = {}): Promise<T> {
  const response = await fetch('/api/site-settings', {
    ...options,
    credentials: 'same-origin',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });
  if (!response.headers.get('content-type')?.includes('application/json')) {
    throw new Error('Social settings API is unavailable. Check the deployment and try again.');
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
