import type { IncomingMessage, ServerResponse } from 'node:http';
import { createClient } from '@supabase/supabase-js';
import { getSiteOrigin } from './siteOrigin.js';

const DEFAULT_IMAGE = 'https://www.kefayaan.com/assets/social/kefayaan-share.jpg';
const escapeHtml = (value: string): string => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

export default async function handler(request: IncomingMessage, response: ServerResponse): Promise<void> {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.setHeader('Allow', 'GET, HEAD');
    response.statusCode = 405;
    response.end('Method not allowed.');
    return;
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Supabase storefront settings are not configured on the server.');
    }

    const client = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await client
      .from('storefront_settings')
      .select('payload')
      .eq('id', 'storefront')
      .maybeSingle();
    if (error) throw new Error(`Could not load social preview settings: ${error.message}`);

    const configuredImage = data?.payload &&
      typeof data.payload === 'object' &&
      typeof data.payload.socialPreviewImageUrl === 'string'
      ? data.payload.socialPreviewImageUrl
      : DEFAULT_IMAGE;
    const parsedImage = new URL(configuredImage);
    if (!['http:', 'https:'].includes(parsedImage.protocol) || parsedImage.username || parsedImage.password) {
      throw new Error('The configured social preview image URL is invalid.');
    }

    const origin = getSiteOrigin(request);
    const title = 'Kefayaan | Curated Products & Buying Guides';
    const description = 'Browse curated products by category, compare useful details, and read practical buying guides from Kefayaan.';
    const canonicalUrl = `${origin}/`;
    const imageUrl = escapeHtml(parsedImage.href);
    const safeTitle = escapeHtml(title);
    const safeDescription = escapeHtml(description);
    const safeCanonicalUrl = escapeHtml(canonicalUrl);
    const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${safeTitle}</title>
    <meta name="description" content="${safeDescription}">
    <link rel="canonical" href="${safeCanonicalUrl}">
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <link rel="icon" type="image/png" sizes="96x96" href="/favicon.png">
    <link rel="shortcut icon" href="/favicon.ico">
    <meta property="og:site_name" content="Kefayaan">
    <meta property="og:type" content="website">
    <meta property="og:title" content="${safeTitle}">
    <meta property="og:description" content="${safeDescription}">
    <meta property="og:url" content="${safeCanonicalUrl}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:image:secure_url" content="${imageUrl}">
    <meta property="og:image:alt" content="Kefayaan — curated products and buying guides">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${safeTitle}">
    <meta name="twitter:description" content="${safeDescription}">
    <meta name="twitter:image" content="${imageUrl}">
  </head>
  <body><a href="${safeCanonicalUrl}">${safeTitle}</a></body>
</html>`;

    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60, stale-while-revalidate=300');
    response.end(request.method === 'HEAD' ? '' : html);
  } catch (error) {
    console.error('Homepage social preview generation failed', error);
    response.statusCode = 503;
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.setHeader('Cache-Control', 'no-store');
    response.end('<!doctype html><title>Social preview unavailable</title>');
  }
}
