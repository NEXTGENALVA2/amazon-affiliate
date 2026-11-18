import { IncomingMessage, ServerResponse } from 'node:http';
import { createClient } from '@supabase/supabase-js';
import { getSiteOrigin } from './siteOrigin.js';
import { slugifyProductTitle } from '../src/utils/productRoutes.js';
import { BLOG_ARTICLES } from '../src/data/blog.js';

const products = [
  ["Nature's Harvest Grain-Free Wild Salmon & Organic Chicken Wet Cat Food (24 Cans)", 'prod-cat-food'],
  ['Optimum Nutrition Gold Standard 100% Whey Protein Isolate (5 lbs, Vanilla Bean)', 'prod-gym-protein'],
  ['Ninja Foodi XL DualZone 10-Qt 2-Basket Digital Smart Air Fryer with Match Cook', 'prod-kitchen-airfryer'],
  ['Samsung Odyssey Neo G9 49" Curved Dual QHD 240Hz Mini-LED Gaming Monitor', 'prod-1'],
  ['Sony WH-1000XM5 Premium Noise Canceling Wireless Headphones', 'prod-2'],
  ['Keychron Q1 Pro Wireless Custom Mechanical Keyboard (QMK/VIA)', 'prod-3'],
  ['Herman Miller Aeron Ergonomic Chair - Graphite Mineral Polished', 'prod-4'],
];

const getProductUrls = async (origin: string): Promise<string[]> => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return products.map(([title]) => `${origin}/products/${slugifyProductTitle(title)}`);
  }

  const client = createClient(supabaseUrl, supabaseAnonKey);
  const { data, error } = await client.from('products').select('payload');
  if (error) throw error;

  const records = (data || [])
    .flatMap((row) => Array.isArray(row.payload) ? row.payload : [row.payload])
    .filter((product): product is { id: string; slug?: string; title?: string } =>
      Boolean(product) &&
      typeof product === 'object' &&
      typeof product.id === 'string' &&
      typeof product.title === 'string');

  const urls = records.map((product) => {
    return `${origin}/products/${slugifyProductTitle(product.title || product.slug || 'product')}`;
  });
  return [...new Set([
    ...products.map(([title]) => `${origin}/products/${slugifyProductTitle(title)}`),
    ...urls,
  ])];
};

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  try {
    const origin = getSiteOrigin(request);
    const urls = [
      `${origin}/`,
      `${origin}/blog`,
      ...BLOG_ARTICLES.map((article) => `${origin}/blog/${article.slug}`),
      ...await getProductUrls(origin),
    ];
    const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url><loc>${url}</loc></url>`).join('\n')}\n</urlset>`;

    response.setHeader('Content-Type', 'application/xml; charset=utf-8');
    response.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    response.statusCode = 200;
    response.end(body);
  } catch (error) {
    console.error('Sitemap generation failed', error);
    response.statusCode = 500;
    response.end('Sitemap generation failed');
  }
}
