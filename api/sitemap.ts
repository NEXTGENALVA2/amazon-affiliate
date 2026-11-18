import { IncomingMessage, ServerResponse } from 'node:http';
import { createClient } from '@supabase/supabase-js';
import { getSiteOrigin } from './siteOrigin.js';
import { slugifyProductTitle } from '../src/utils/productRoutes.js';
import { BLOG_ARTICLES } from '../src/data/blog.js';

const getProductUrls = async (origin: string): Promise<string[]> => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required to generate product sitemap URLs.');
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

  return [...new Set(records.map((product) =>
    `${origin}/products/${slugifyProductTitle(product.title || product.slug || 'product')}`,
  ))];
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
