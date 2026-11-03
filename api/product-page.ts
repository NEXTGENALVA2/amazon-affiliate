import { IncomingMessage, ServerResponse } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { getSiteOrigin } from './siteOrigin';

interface ProductSeoData {
  id: string;
  title: string;
  slug?: string;
  description?: string;
  image?: string;
  gallery?: string[];
  brand?: string;
  category?: string;
  dealPrice?: number;
  price?: number;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
}

const slugify = (value: string): string =>
  value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'product';

const fallbackProducts: ProductSeoData[] = [
  { id: 'prod-cat-food', slug: 'natures-harvest-grain-free-salmon-cat-food', title: "Nature's Harvest Grain-Free Wild Salmon & Organic Chicken Wet Cat Food (24 Cans)", brand: "Nature's Harvest", category: 'Cat Food & Pet Care', description: 'Explore Nature’s Harvest grain-free wet cat food with wild salmon and organic chicken. View product details, pricing, images, and buying options.' },
  { id: 'prod-gym-protein', slug: 'optimum-nutrition-gold-standard-whey-protein', title: 'Optimum Nutrition Gold Standard Whey Protein', brand: 'Optimum Nutrition', category: 'Gym & Sports Nutrition', description: 'Explore Optimum Nutrition Gold Standard whey protein. View product details, pricing, images, and buying options.' },
  { id: 'prod-kitchen-airfryer', slug: 'ninja-foodi-xl-dualzone-smart-air-fryer', title: 'Ninja Foodi XL DualZone Smart Air Fryer', brand: 'Ninja', category: 'Home & Kitchen Gadgets', description: 'Explore the Ninja Foodi XL DualZone Smart Air Fryer. View product details, pricing, images, and buying options.' },
  { id: 'prod-1', slug: 'samsung-odyssey-neo-g9', title: 'Samsung Odyssey Neo G9 49" Curved Dual QHD 240Hz Mini-LED Gaming Monitor', brand: 'Samsung', category: 'Tech & Smart Gadgets', description: 'Explore the Samsung Odyssey Neo G9 curved gaming monitor. View product details, pricing, images, and buying options.' },
  { id: 'prod-2', slug: 'sony-wh-1000xm5-wireless', title: 'Sony WH-1000XM5 Premium Noise Canceling Wireless Headphones', brand: 'Sony', category: 'Tech & Smart Gadgets', description: 'Explore Sony WH-1000XM5 wireless noise-canceling headphones. View product details, pricing, images, and buying options.' },
  { id: 'prod-3', slug: 'keychron-q1-pro-mechanical', title: 'Keychron Q1 Pro Mechanical Keyboard', brand: 'Keychron', category: 'Tech & Smart Gadgets', description: 'Explore the Keychron Q1 Pro mechanical keyboard. View product details, pricing, images, and buying options.' },
  { id: 'prod-4', slug: 'herman-miller-aeron-chair', title: 'Herman Miller Aeron Ergonomic Chair', brand: 'Herman Miller', category: 'Home & Workstation', description: 'Explore the Herman Miller Aeron ergonomic chair. View product details, pricing, images, and buying options.' },
];

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] || character);

const escapeJsonForHtml = (value: unknown): string =>
  JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');

const getProducts = async (): Promise<ProductSeoData[]> => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return fallbackProducts;

  const client = createClient(supabaseUrl, supabaseAnonKey);
  const { data, error } = await client.from('products').select('payload');
  if (error) throw error;

  const remoteProducts = (data || [])
    .flatMap((row) => Array.isArray(row.payload) ? row.payload : [row.payload])
    .filter((product): product is ProductSeoData =>
      Boolean(product) &&
      typeof product === 'object' &&
      typeof product.id === 'string' &&
      typeof product.title === 'string');

  return remoteProducts.length ? remoteProducts : fallbackProducts;
};

const updateMetaTag = (html: string, attribute: 'name' | 'property', key: string, content: string): string => {
  const escapedContent = escapeHtml(content);
  const pattern = new RegExp(`<meta\\s+${attribute}=["']${key}["'][^>]*>`, 'i');
  const replacement = `<meta ${attribute}="${key}" content="${escapedContent}" />`;
  return pattern.test(html)
    ? html.replace(pattern, replacement)
    : html.replace('</head>', `    ${replacement}\n  </head>`);
};

const createProductHtml = (template: string, product: ProductSeoData, origin: string, canonicalUrl: string): string => {
  const title = `${product.title} | Kefayaan`;
  const description = (product.description || `Explore ${product.title}, including product details, pricing, images, and buying options on Kefayaan.`)
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 300);
  const imageUrls = [product.image, ...(product.gallery || [])]
    .filter((image): image is string => Boolean(image))
    .map((image) => new URL(image, origin).href);
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description,
    ...(imageUrls.length ? { image: imageUrls } : {}),
    sku: product.id,
    ...(product.brand ? { brand: { '@type': 'Brand', name: product.brand } } : {}),
    ...(product.category ? { category: product.category } : {}),
    ...(Number(product.rating) > 0 && Number(product.reviewCount) > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
          },
        }
      : {}),
    ...(Number.isFinite(Number(product.dealPrice)) && Number(product.dealPrice) > 0
      ? {
          offers: {
            '@type': 'Offer',
            url: canonicalUrl,
            priceCurrency: 'USD',
            price: product.dealPrice,
            availability: product.inStock === false
              ? 'https://schema.org/OutOfStock'
              : 'https://schema.org/InStock',
          },
        }
      : {}),
  };

  let html = template.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  html = updateMetaTag(html, 'name', 'description', description);
  html = updateMetaTag(html, 'name', 'robots', 'index,follow');
  html = updateMetaTag(html, 'property', 'og:title', title);
  html = updateMetaTag(html, 'property', 'og:description', description);
  html = updateMetaTag(html, 'property', 'og:type', 'product');
  html = updateMetaTag(html, 'property', 'og:url', canonicalUrl);
  html = updateMetaTag(html, 'property', 'og:image', imageUrls[0] || '');
  html = updateMetaTag(html, 'name', 'twitter:title', title);
  html = updateMetaTag(html, 'name', 'twitter:description', description);
  html = updateMetaTag(html, 'name', 'twitter:image', imageUrls[0] || '');

  const canonical = `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`;
  const jsonLd = `<script type="application/ld+json">${escapeJsonForHtml(structuredData)}</script>`;
  html = html.replace('</head>', `    ${canonical}\n    ${jsonLd}\n  </head>`);

  const image = imageUrls[0]
    ? `<img src="${escapeHtml(imageUrls[0])}" alt="${escapeHtml(product.title)}" style="max-width:100%;height:auto" />`
    : '';
  const fallbackContent = `<main id="seo-fallback"><article><h1>${escapeHtml(product.title)}</h1><p>${escapeHtml(description)}</p>${image}<p>Brand: ${escapeHtml(product.brand || 'Kefayaan')} · Category: ${escapeHtml(product.category || 'Products')}</p><a href="/">Browse more products</a></article></main>`;
  return html.replace('<div id="root"></div>', `<div id="root">${fallbackContent}</div>`);
};

const createNotFoundHtml = (template: string): string => {
  let html = template.replace(/<title>[\s\S]*?<\/title>/i, '<title>Product not found | Kefayaan</title>');
  html = updateMetaTag(html, 'name', 'robots', 'noindex,follow');
  return html.replace('<div id="root"></div>', '<div id="root"><main><h1>Product not found</h1><p>This product may have been removed or its link may be incorrect.</p><a href="/">Browse all products</a></main></div>');
};

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  try {
    const requestUrl = new URL(request.url || '/', 'https://internal.invalid');
    const requestedSlug = requestUrl.searchParams.get('slug') || '';
    let decodedSlug: string;
    try {
      decodedSlug = decodeURIComponent(requestedSlug);
    } catch {
      response.statusCode = 404;
      response.end('Product not found');
      return;
    }
    const products = await getProducts();
    const product = products.find((candidate) =>
      decodedSlug === `${slugify(candidate.slug || candidate.title)}-${candidate.id}`);
    const template = await readFile(path.join(process.cwd(), 'dist', 'index.html'), 'utf8');

    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=3600');
    if (!product) {
      response.statusCode = 404;
      response.end(createNotFoundHtml(template));
      return;
    }

    const origin = getSiteOrigin(request);
    const canonicalUrl = `${origin}/products/${slugify(product.slug || product.title)}-${encodeURIComponent(product.id)}`;
    response.statusCode = 200;
    response.end(createProductHtml(template, product, origin, canonicalUrl));
  } catch (error) {
    console.error('Server-rendered product page failed', error);
    response.statusCode = 500;
    response.setHeader('Content-Type', 'text/plain; charset=utf-8');
    response.end('Unable to render product page');
  }
}
