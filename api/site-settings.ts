import { ServerResponse } from 'node:http';
import { createClient } from '@supabase/supabase-js';
import type { SocialChannel, SocialSettings } from '../src/types.js';
import {
  AdminApiError,
  assertAdminRequestOrigin,
  readAdminRequestBody,
  requireAdmin,
  sendAdminJson,
} from '../server/admin-auth.js';
import type { AdminRequest } from '../server/admin-auth.js';

const SETTING_ID = 'social';
const SOCIAL_CHANNELS = new Set<SocialChannel>([
  'whatsapp',
  'instagram',
  'facebook',
  'tiktok',
  'twitter',
]);
const DEFAULT_SETTINGS: SocialSettings = {
  whatsappNumber: '+8801873785288',
  facebookPageUsername: 'kefayaanofficial',
  instagramUsername: 'kefayaan_official',
  tiktokUsername: 'kefayaan',
  twitterUsername: 'kefayaan',
  visibleChannels: [...SOCIAL_CHANNELS],
  customLinks: [],
};

function validateSettings(input: unknown): SocialSettings {
  if (!input || typeof input !== 'object') {
    throw new AdminApiError(400, 'Social settings are required.');
  }
  const value = input as Record<string, unknown>;
  const visibleChannels = Array.isArray(value.visibleChannels)
    ? value.visibleChannels.filter(
      (channel): channel is SocialChannel => typeof channel === 'string' && SOCIAL_CHANNELS.has(channel as SocialChannel)
    )
    : [];
  const customLinks = Array.isArray(value.customLinks) ? value.customLinks : [];
  if (customLinks.length > 8) throw new AdminApiError(400, 'You can add up to 8 custom social links.');

  const links = customLinks.map((rawLink) => {
    if (!rawLink || typeof rawLink !== 'object') throw new AdminApiError(400, 'Invalid social link.');
    const link = rawLink as Record<string, unknown>;
    const id = typeof link.id === 'string' ? link.id.trim() : '';
    const label = typeof link.label === 'string' ? link.label.trim() : '';
    const rawUrl = typeof link.url === 'string' ? link.url.trim() : '';
    if (!/^[a-zA-Z0-9_-]{1,80}$/.test(id) || !label || label.length > 32 || rawUrl.length > 500) {
      throw new AdminApiError(400, 'Each social link needs a valid ID, a name (up to 32 characters), and a URL.');
    }

    let url: URL;
    try {
      url = new URL(rawUrl);
    } catch {
      throw new AdminApiError(400, `The URL for ${label} is invalid.`);
    }
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
      throw new AdminApiError(400, `The URL for ${label} must be a public HTTP or HTTPS link.`);
    }
    return { id, label, url: url.toString(), enabled: link.enabled !== false };
  });

  const stringValue = (key: string, fallback: string, maxLength: number): string => {
    const candidate = value[key];
    if (candidate === undefined) return fallback;
    if (typeof candidate !== 'string' || candidate.length > maxLength) {
      throw new AdminApiError(400, `Invalid ${key} value.`);
    }
    return candidate.trim();
  };

  return {
    whatsappNumber: stringValue('whatsappNumber', DEFAULT_SETTINGS.whatsappNumber, 40),
    facebookPageUsername: stringValue('facebookPageUsername', DEFAULT_SETTINGS.facebookPageUsername, 120),
    instagramUsername: stringValue('instagramUsername', DEFAULT_SETTINGS.instagramUsername, 120),
    tiktokUsername: stringValue('tiktokUsername', DEFAULT_SETTINGS.tiktokUsername, 120),
    twitterUsername: stringValue('twitterUsername', DEFAULT_SETTINGS.twitterUsername, 120),
    visibleChannels: [...new Set(visibleChannels)],
    customLinks: links,
  };
}

export default async function handler(request: AdminRequest, response: ServerResponse): Promise<void> {
  try {
    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceRoleKey) {
      throw new AdminApiError(503, 'Social settings database is not configured on the server.');
    }
    const client = createClient(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    if (request.method === 'GET') {
      const { data, error } = await client
        .from('storefront_settings')
        .select('payload')
        .eq('id', SETTING_ID)
        .maybeSingle();
      if (error) throw new AdminApiError(502, `Could not load storefront settings: ${error.message}`);
      sendAdminJson(response, 200, { data: data?.payload ? validateSettings(data.payload) : null });
      return;
    }

    if (request.method !== 'POST') {
      response.setHeader('Allow', 'GET, POST');
      throw new AdminApiError(405, 'Method not allowed.');
    }

    assertAdminRequestOrigin(request);
    requireAdmin(request);
    const body = readAdminRequestBody(request);
    const settings = validateSettings(body.settings);
    const { error } = await client
      .from('storefront_settings')
      .upsert(
        { id: SETTING_ID, payload: settings, updated_at: new Date().toISOString() },
        { onConflict: 'id' }
      );
    if (error) throw new AdminApiError(502, `Could not save storefront settings: ${error.message}`);
    sendAdminJson(response, 200, { data: settings });
  } catch (error) {
    if (error instanceof AdminApiError) {
      sendAdminJson(response, error.status, { error: error.message });
      return;
    }
    console.error('Storefront settings request failed', error);
    sendAdminJson(response, 500, { error: 'Could not update storefront settings. Please try again.' });
  }
}
