import { IncomingMessage, ServerResponse } from 'node:http';
import { createClient } from '@supabase/supabase-js';
import { getSiteOrigin } from './siteOrigin';

const products = [
  ['natures-harvest-grain-free-salmon-cat-food', 'prod-cat-food'],
  ['optimum-nutrition-gold-standard-whey-protein', 'prod-gym-protein'],
  ['ninja-foodi-xl-dualzone-smart-air-fryer', 'prod-kitchen-airfryer'],
  ['samsung-odyssey-neo-g9', 'prod-1'],
  ['sony-wh-1000xm5-wireless', 'prod-2'],
  ['keychron-q1-pro-mechanical', 'prod-3'],
  ['herman-miller-aeron-chair', 'prod-4'],
];

const slugify = (value: string): string =>
  value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'product';

const getProductUrls = async (origin: string): Promise<string[]> => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return products.map(([slug, id]) => `${origin}/products/${slug}-${encodeURIComponent(id)}`);
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
      (typeof product.slug === 'string' || typeof product.title === 'string'));

  const urls = records.map((product) => {
    const slug = slugify(product.slug || product.title || 'product');
    return `${origin}/products/${slug}-${encodeURIComponent(product.id)}`;
  });
  return [...new Set([
    ...products.map(([slug, id]) => `${origin}/products/${slug}-${encodeURIComponent(id)}`),
    ...urls,
  ])];
};

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  try {
    const origin = getSiteOrigin(request);
    const urls = [
      `${origin}/`,
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
