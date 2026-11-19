import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Product, ProductVariant } from '../src/types.js';
import { getProductPath } from '../src/utils/productRoutes.js';
import { getProductsForPreview } from './product-data.js';
import { getSiteOrigin } from './siteOrigin.js';

const COLUMNS = [
  'id',
  'title',
  'description',
  'link',
  'image_link',
  'price',
  'availability',
  'item_group_id',
  'brand',
  'product_type',
  'sale_price',
  'condition',
  'average_review_rating',
  'number_of_ratings',
  'video_link',
];

const escapeCsv = (value: string | number): string =>
  `"${String(value).replace(/"/g, '""')}"`;

const toPlainText = (value: string): string =>
  value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();

const getHttpUrl = (value: string, origin: string): URL | undefined => {
  try {
    const url = new URL(value, origin);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url : undefined;
  } catch {
    return undefined;
  }
};

const getAllowedImageOrigins = (origin: string): Set<string> => {
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
  return allowedOrigins;
};

const getPinterestImageUrl = (product: Product, origin: string, variantId?: string): string | undefined => {
  const variant = product.variants?.find((item) => item.id === variantId);
  const source = getHttpUrl(variant?.image || product.image, origin);
  if (!source) return undefined;

  if (!getAllowedImageOrigins(origin).has(source.origin)) {
    return source.href.replace(/,/g, '%2C');
  }

  const imageUrl = new URL('/api/pinterest-product-image', origin);
  imageUrl.searchParams.set('slug', getProductPath(product).split('/').pop() || '');
  if (variantId) imageUrl.searchParams.set('variant', variantId);
  const version = product.updatedAt || product.createdAt;
  if (version) imageUrl.searchParams.set('v', version);
  return imageUrl.href;
};

const getDirectVideoUrl = (product: Product): string => {
  if (product.videoType !== 'direct' || !product.videoUrl) return '';
  const videoUrl = getHttpUrl(product.videoUrl, 'https://www.kefayaan.com');
  return videoUrl && /\.(mp4|mov|m4v)$/i.test(videoUrl.pathname) ? videoUrl.href : '';
};

const getFeedRow = (
  product: Product,
  origin: string,
  variant?: ProductVariant,
): Array<string | number> | undefined => {
  const productUrl = new URL(getProductPath(product), origin);
  if (variant) productUrl.searchParams.set('variant', variant.id);
  const baseTitle = toPlainText(product.title);
  const title = toPlainText(variant ? `${baseTitle} - ${variant.name}` : baseTitle).slice(0, 500);
  const description = toPlainText(product.description || `Explore ${title} on Kefayaan and check current details with the retailer.`).slice(0, 10_000);
  const imageUrl = getPinterestImageUrl(product, origin, variant?.id);
  const regularPrice = variant?.price ?? product.price;
  const currentPrice = variant?.dealPrice ?? product.dealPrice;
  const price = Number.isFinite(regularPrice) && regularPrice > 0 ? regularPrice : currentPrice;
  const salePrice = Number.isFinite(currentPrice) && currentPrice > 0 && currentPrice < price
    ? currentPrice
    : '';
  const inStock = product.inStock && variant?.inStock !== false;
  const itemGroupId = product.variants && product.variants.length > 1 ? product.id : '';
  const feedId = variant ? `${product.id}-${variant.id}` : product.id;

  if (!feedId || feedId.length > 127 || !title || !description ||
      productUrl.href.length > 511 || !imageUrl || imageUrl.length > 2000 ||
      !Number.isFinite(price) || price <= 0) {
    console.warn(`Skipping Pinterest catalog item with invalid required fields: ${product.id || '(missing id)'}`);
    return undefined;
  }

  return [
    feedId,
    title,
    description,
    productUrl.href,
    imageUrl,
    `${price.toFixed(2)} USD`,
    inStock ? 'in stock' : 'out of stock',
    itemGroupId,
    toPlainText(product.brand).slice(0, 1000),
    toPlainText(product.category).slice(0, 1000),
    salePrice === '' ? '' : `${salePrice.toFixed(2)} USD`,
    'new',
    product.rating > 0 ? product.rating : '',
    product.reviewCount > 0 ? product.reviewCount : '',
    getDirectVideoUrl(product),
  ];
};

export const buildPinterestCatalogCsv = (products: Product[], origin: string): string => {
  const rows = products
    .flatMap((product) => {
      const variants = Array.isArray(product.variants)
        ? product.variants.filter((variant) => typeof variant.id === 'string' && variant.id.trim())
        : [];
      return variants.length
        ? variants.map((variant) => getFeedRow(product, origin, variant))
        : [getFeedRow(product, origin)];
    })
    .filter((row): row is Array<string | number> => Boolean(row));
  return [
    COLUMNS.map(escapeCsv).join(','),
    ...rows.map((row) => row.map(escapeCsv).join(',')),
  ].join('\r\n') + '\r\n';
};

export default async function handler(request: IncomingMessage, response: ServerResponse): Promise<void> {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.setHeader('Allow', 'GET, HEAD');
    response.statusCode = 405;
    response.setHeader('Content-Type', 'text/plain; charset=utf-8');
    response.end('Method not allowed.');
    return;
  }

  try {
    const [products, origin] = await Promise.all([
      getProductsForPreview(),
      Promise.resolve(getSiteOrigin(request)),
    ]);
    const csv = buildPinterestCatalogCsv(products, origin);
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/csv; charset=utf-8');
    response.setHeader('Content-Disposition', 'attachment; filename="kefayaan-pinterest-catalog.csv"');
    response.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=3600');
    response.end(request.method === 'HEAD' ? '' : csv);
  } catch (error) {
    console.error('Pinterest catalog feed generation failed', error);
    response.statusCode = 503;
    response.setHeader('Content-Type', 'text/plain; charset=utf-8');
    response.setHeader('Cache-Control', 'no-store');
    response.end('Pinterest catalog feed is temporarily unavailable.');
  }
}
