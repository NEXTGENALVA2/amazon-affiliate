import type { IncomingMessage, ServerResponse } from 'node:http';
import sharp from 'sharp';
import { getProductRouteSlug } from '../src/utils/productRoutes.js';
import { getProductForPreview } from './product-data.js';
import { getSiteOrigin } from '../server/siteOrigin.js';

const sendError = (response: ServerResponse, status: number, message: string): void => {
  response.statusCode = status;
  response.setHeader('Content-Type', 'text/plain; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.end(message);
};

export default async function handler(request: IncomingMessage, response: ServerResponse): Promise<void> {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.setHeader('Allow', 'GET, HEAD');
    sendError(response, 405, 'Method not allowed.');
    return;
  }

  try {
    const requestUrl = new URL(request.url || '/', 'http://localhost');
    const routeSlug = requestUrl.searchParams.get('slug') || getProductRouteSlug(requestUrl.pathname);
    if (!routeSlug) {
      sendError(response, 404, 'Product not found.');
      return;
    }

    const product = await getProductForPreview(routeSlug);
    if (!product) {
      sendError(response, 404, 'Product not found.');
      return;
    }

    const origin = getSiteOrigin(request);
    const variantId = requestUrl.searchParams.get('variant');
    const variant = variantId ? product.variants?.find((item) => item.id === variantId) : undefined;
    if (variantId && !variant) {
      sendError(response, 404, 'Product variant not found.');
      return;
    }
    const imageUrl = new URL(variant?.image || product.image, origin);
    const allowedOrigins = new Set([origin]);
    if (process.env.VITE_SUPABASE_URL) {
      allowedOrigins.add(new URL(process.env.VITE_SUPABASE_URL).origin);
    }
    const configuredSiteUrl = process.env.VITE_SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL;
    if (configuredSiteUrl) {
      allowedOrigins.add(new URL(
        configuredSiteUrl.includes('://') ? configuredSiteUrl : `https://${configuredSiteUrl}`,
      ).origin);
    }
    if (!allowedOrigins.has(imageUrl.origin) || !['http:', 'https:'].includes(imageUrl.protocol)) {
      sendError(response, 415, 'Product image host is not supported.');
      return;
    }

    const imageResponse = await fetch(imageUrl, {
      redirect: 'error',
      signal: AbortSignal.timeout(8000),
    });
    const contentType = imageResponse.headers.get('content-type') || '';
    if (!imageResponse.ok || !contentType.startsWith('image/')) {
      sendError(response, 502, 'Could not load product image.');
      return;
    }
    const contentLength = Number(imageResponse.headers.get('content-length'));
    if (Number.isFinite(contentLength) && contentLength > 15 * 1024 * 1024) {
      sendError(response, 413, 'Product image is too large to process.');
      return;
    }

    const image = Buffer.from(await imageResponse.arrayBuffer());
    const pinterestImage = await sharp(image, { limitInputPixels: 40_000_000 })
      .rotate()
      .resize(1000, 1500, {
        fit: 'contain',
        background: '#ffffff',
      })
      .jpeg({ quality: 90 })
      .toBuffer();

    response.statusCode = 200;
    response.setHeader('Content-Type', 'image/jpeg');
    response.setHeader('Content-Length', pinterestImage.byteLength);
    response.setHeader('Cache-Control', 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800');
    response.end(request.method === 'HEAD' ? undefined : pinterestImage);
  } catch (error) {
    console.error('Pinterest product image generation failed', error);
    sendError(response, 503, 'Pinterest product image unavailable.');
  }
}
