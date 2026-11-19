import { IncomingMessage, ServerResponse } from 'node:http';
import type { Product } from '../src/types.js';
import { getProductPath } from '../src/utils/productRoutes.js';
import { BLOG_ARTICLES, getRelatedProducts } from '../src/data/blog.js';
import { getProductsForPreview } from './product-data.js';
import { getSiteOrigin } from './siteOrigin.js';

export interface SitemapUrl {
  url: string;
  images: string[];
}

const escapeXml = (value: string): string =>
  value.replace(/[<>&'"]/g, (character) => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    "'": '&apos;',
    '"': '&quot;',
  })[character] || character);

export const getProductImageUrls = (product: Product, origin: string): string[] => {
  const gallery = Array.isArray(product.gallery) ? product.gallery : [];
  const variants = Array.isArray(product.variants) ? product.variants : [];
  const imagePaths = [
    product.image,
    ...gallery,
    ...variants.flatMap((variant) => [
      variant.image,
      ...(Array.isArray(variant.gallery) ? variant.gallery : []),
    ]),
  ];

  return [...new Set(imagePaths.flatMap((image) => {
    if (typeof image !== 'string' || !image.trim()) return [];
    try {
      const url = new URL(image, origin);
      return ['http:', 'https:'].includes(url.protocol) ? [url.href] : [];
    } catch {
      return [];
    }
  }))].slice(0, 1000);
};

export const buildSitemapXml = (urls: SitemapUrl[]): string => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.map(({ url, images }) => `  <url>
    <loc>${escapeXml(url)}</loc>
${images.map((image) => `    <image:image><image:loc>${escapeXml(image)}</image:loc></image:image>`).join('\n')}
  </url>`).join('\n')}
</urlset>`;

export default async function handler(_request: IncomingMessage, response: ServerResponse): Promise<void> {
  try {
    const origin = getSiteOrigin(_request);
    const products = await getProductsForPreview();
    const articles = BLOG_ARTICLES.map((article) => ({
      url: `${origin}/blog/${article.slug}`,
      images: [...new Set(
        getRelatedProducts(article, products).flatMap((product) => getProductImageUrls(product, origin)),
      )],
    }));
    const indexImages = [...new Set(articles.flatMap((article) => article.images))];
    const productPagesByUrl = new Map<string, Set<string>>();
    for (const product of products) {
      const url = new URL(getProductPath(product), origin).href;
      const images = productPagesByUrl.get(url) || new Set<string>();
      getProductImageUrls(product, origin).forEach((image) => images.add(image));
      productPagesByUrl.set(url, images);
    }
    const productPages = [...productPagesByUrl].map(([url, images]) => ({
      url,
      images: [...images],
    }));
    const sitemapUrls: SitemapUrl[] = [
      { url: `${origin}/`, images: [] },
      { url: `${origin}/blog`, images: indexImages },
      ...articles,
      ...productPages,
    ];

    response.setHeader('Content-Type', 'application/xml; charset=utf-8');
    response.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    response.statusCode = 200;
    response.end(buildSitemapXml(sitemapUrls));
  } catch (error) {
    console.error('Sitemap generation failed', error);
    response.statusCode = 500;
    response.end('Sitemap generation failed');
  }
}
