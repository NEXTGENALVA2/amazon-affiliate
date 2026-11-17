import { createClient } from '@supabase/supabase-js';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Product } from '../src/types.js';
import { findProductByRouteSlug, getProductPath, getProductRouteSlug } from '../src/utils/productRoutes.js';
import { getSiteOrigin } from './siteOrigin.js';

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] || character);

const isProduct = (value: unknown): value is Product => {
  if (!value || typeof value !== 'object') return false;
  const product = value as Partial<Product>;
  return typeof product.id === 'string' &&
    typeof product.title === 'string' &&
    typeof product.image === 'string' &&
    typeof product.brand === 'string' &&
    typeof product.category === 'string' &&
    typeof product.description === 'string' &&
    typeof product.dealPrice === 'number' &&
    typeof product.inStock === 'boolean';
};

const getProducts = async (): Promise<Product[]> => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required for product share previews.');
  }

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client
    .from('products')
    .select('payload')
    .order('updated_at', { ascending: false });
  if (error) throw error;

  return (data || [])
    .flatMap((row) => Array.isArray(row.payload) ? row.payload : [row.payload])
    .filter(isProduct);
};

const getShareImage = async (image: string, origin: string): Promise<{ url: string; optimized: boolean }> => {
  const imageUrl = new URL(image, origin);
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) return { url: imageUrl.href, optimized: false };

  const projectUrl = new URL(supabaseUrl);
  const objectPath = '/storage/v1/object/public/';
  if (imageUrl.origin !== projectUrl.origin || !imageUrl.pathname.includes(objectPath)) {
    return { url: imageUrl.href, optimized: false };
  }

  imageUrl.pathname = imageUrl.pathname.replace(objectPath, '/storage/v1/render/image/public/');
  imageUrl.search = '';
  imageUrl.searchParams.set('width', '1200');
  imageUrl.searchParams.set('height', '630');
  imageUrl.searchParams.set('resize', 'contain');
  imageUrl.searchParams.set('quality', '90');
  imageUrl.searchParams.set('format', 'origin');
  try {
    const response = await fetch(imageUrl.href, {
      method: 'HEAD',
      signal: AbortSignal.timeout(3000),
    });
    const contentType = response.headers.get('content-type') || '';
    if (response.ok && contentType.startsWith('image/')) {
      return { url: imageUrl.href, optimized: true };
    }
    console.warn(`Supabase image transformation is unavailable (${response.status}); using the original product image.`);
  } catch (error) {
    console.warn('Could not verify the transformed product image; using the original image.', error);
  }
  imageUrl.pathname = imageUrl.pathname.replace('/storage/v1/render/image/public/', '/storage/v1/object/public/');
  imageUrl.search = '';
  return { url: imageUrl.href, optimized: false };
};

const sendHtml = (response: ServerResponse, status: number, html: string): void => {
  response.statusCode = status;
  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  response.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=3600');
  response.end(html);
};

export default async function handler(request: IncomingMessage, response: ServerResponse): Promise<void> {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.setHeader('Allow', 'GET, HEAD');
    sendHtml(response, 405, '<!doctype html><title>Method not allowed</title>');
    return;
  }

  try {
    const requestUrl = new URL(request.url || '/', 'http://localhost');
    const routeSlug = requestUrl.searchParams.get('slug') || getProductRouteSlug(requestUrl.pathname);
    if (!routeSlug) {
      sendHtml(response, 404, '<!doctype html><title>Product not found</title>');
      return;
    }

    const product = findProductByRouteSlug(await getProducts(), routeSlug);
    if (!product) {
      sendHtml(response, 404, '<!doctype html><title>Product not found</title><meta name="robots" content="noindex">');
      return;
    }

    const origin = getSiteOrigin(request);
    const canonicalUrl = new URL(getProductPath(product), origin).href;
    const title = `${product.title} | Kefayaan`;
    const description = product.description?.trim().slice(0, 300) ||
      `Explore ${product.title}, including product details, pricing, images, and buying options on Kefayaan.`;
    let imageUrl = new URL('/assets/aistudio/DP_af5fa802.png', origin).href;
    let hasOptimizedImage = false;
    try {
      const candidate = await getShareImage(product.image, origin);
      const candidateUrl = new URL(candidate.url);
      if (candidateUrl.protocol === 'http:' || candidateUrl.protocol === 'https:') {
        imageUrl = candidateUrl.href;
        hasOptimizedImage = candidate.optimized;
      }
    } catch (error) {
      console.warn('Product preview image URL is invalid', error);
    }

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.title,
      description,
      image: imageUrl,
      brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
      category: product.category,
      offers: {
        '@type': 'Offer',
        url: canonicalUrl,
        priceCurrency: 'USD',
        price: product.dealPrice,
        availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      },
    };
    const jsonLd = JSON.stringify(structuredData).replace(/</g, '\\u003c');
    const escapedTitle = escapeHtml(title);
    const escapedDescription = escapeHtml(description);
    const escapedImage = escapeHtml(imageUrl);
    const escapedUrl = escapeHtml(canonicalUrl);
    const imageDimensions = hasOptimizedImage
      ? '<meta property="og:image:width" content="1200">\n    <meta property="og:image:height" content="630">'
      : '';
    const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapedTitle}</title>
    <meta name="description" content="${escapedDescription}">
    <meta name="robots" content="index,follow">
    <link rel="canonical" href="${escapedUrl}">
    <meta property="og:site_name" content="Kefayaan">
    <meta property="og:type" content="product">
    <meta property="og:title" content="${escapedTitle}">
    <meta property="og:description" content="${escapedDescription}">
    <meta property="og:url" content="${escapedUrl}">
    <meta property="og:image" content="${escapedImage}">
    ${imageDimensions}
    <meta property="og:image:alt" content="${escapeHtml(product.title)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapedTitle}">
    <meta name="twitter:description" content="${escapedDescription}">
    <meta name="twitter:image" content="${escapedImage}">
    <meta name="twitter:image:alt" content="${escapeHtml(product.title)}">
    <script type="application/ld+json">${jsonLd}</script>
  </head>
  <body><a href="${escapedUrl}">${escapedTitle}</a></body>
</html>`;
    sendHtml(response, 200, request.method === 'HEAD' ? '' : html);
  } catch (error) {
    console.error('Product share preview generation failed', error);
    sendHtml(response, 503, '<!doctype html><title>Product preview unavailable</title>');
  }
}
