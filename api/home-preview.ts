import type { IncomingMessage, ServerResponse } from 'node:http';
import { createClient } from '@supabase/supabase-js';
import type { Product } from '../src/types.js';
import { getProductPath } from '../src/utils/productRoutes.js';
import { BLOG_ARTICLES } from '../src/data/blog.js';
import { getProductCategoryDescription, getProductCategorySections } from '../src/utils/productCategories.js';
import { getSiteOrigin } from '../server/siteOrigin.js';
import { getProductsForPreview } from './product-data.js';

const DEFAULT_IMAGE = 'https://www.kefayaan.com/assets/social/kefayaan-share.jpg';
const escapeHtml = (value: string): string => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const getSafeImageUrl = (image: string, origin: string): string | undefined => {
  try {
    const url = new URL(image, origin);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
};

const renderProduct = (product: Product, origin: string): string => {
  const productUrl = new URL(getProductPath(product), origin).href;
  const imageUrl = getSafeImageUrl(product.image, origin);
  const imageMarkup = imageUrl
    ? `<a href="${escapeHtml(productUrl)}"><img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(product.imageAlt || `${product.title} product photo`)}" width="320" height="240" loading="lazy"></a>`
    : '';
  const features = Array.isArray(product.features) ? product.features.slice(0, 2) : [];
  const featureMarkup = features.length
    ? `<ul>${features.map((feature) => `<li>${escapeHtml(feature)}</li>`).join('')}</ul>`
    : '';
  const description = product.description.trim().replace(/\s+/g, ' ').slice(0, 320);
  const priceMarkup = Number.isFinite(product.dealPrice) && product.dealPrice > 0
    ? `<p>Listed price: $${product.dealPrice.toFixed(2)} USD. Confirm the current price with the retailer.</p>`
    : '';

  return `<article>
    ${imageMarkup}
    <p>${escapeHtml(product.category)} · ${escapeHtml(product.brand)}</p>
    <h3><a href="${escapeHtml(productUrl)}">${escapeHtml(product.title)}</a></h3>
    ${description ? `<p>${escapeHtml(description)}</p>` : ''}
    ${featureMarkup}
    ${priceMarkup}
  </article>`;
};

export default async function handler(request: IncomingMessage, response: ServerResponse): Promise<void> {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.setHeader('Allow', 'GET, HEAD');
    response.statusCode = 405;
    response.end('Method not allowed.');
    return;
  }

  response.setHeader('Vary', 'User-Agent');

  try {
    const origin = getSiteOrigin(request);
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

    const products = await getProductsForPreview();
    const categorySections = getProductCategorySections(products);
    const availableProducts = categorySections.flatMap((section) => section.products);
    const title = 'Kefayaan | Curated Products & Buying Guides';
    const description = 'Browse curated products by category, compare useful details, and read practical buying guides from Kefayaan.';
    const canonicalUrl = `${origin}/`;
    const imageUrl = escapeHtml(parsedImage.href);
    const secureImageTag = parsedImage.protocol === 'https:'
      ? `<meta property="og:image:secure_url" content="${imageUrl}">`
      : '';
    const safeTitle = escapeHtml(title);
    const safeDescription = escapeHtml(description);
    const safeCanonicalUrl = escapeHtml(canonicalUrl);
    const websiteJsonLd = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Kefayaan',
      url: canonicalUrl,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${origin}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    }).replace(/</g, '\\u003c');
    const categoriesMarkup = categorySections.map((section) => `
      <section>
        <h2>${escapeHtml(section.name)}</h2>
        <p>${escapeHtml(getProductCategoryDescription(section.name))}</p>
        ${section.products.map((product) => renderProduct(product, origin)).join('\n')}
      </section>`).join('\n');
    const guidesMarkup = BLOG_ARTICLES.map((article) => `
      <article>
        <h3><a href="${escapeHtml(`${origin}/blog/${article.slug}`)}">${escapeHtml(article.title)}</a></h3>
        <p>${escapeHtml(article.description)}</p>
      </article>`).join('\n');
    const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${safeTitle}</title>
    <meta name="description" content="${safeDescription}">
    <meta name="robots" content="index,follow">
    <meta name="theme-color" content="#0f172a">
    <link rel="canonical" href="${safeCanonicalUrl}">
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
    <link rel="icon" type="image/png" sizes="96x96" href="/favicon.png">
    <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico">
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    <link rel="manifest" href="/site.webmanifest">
    <meta property="og:site_name" content="Kefayaan">
    <meta property="og:locale" content="en_US">
    <meta property="og:type" content="website">
    <meta property="og:title" content="${safeTitle}">
    <meta property="og:description" content="${safeDescription}">
    <meta property="og:url" content="${safeCanonicalUrl}">
    <meta property="og:image" content="${imageUrl}">
    ${secureImageTag}
    <meta property="og:image:alt" content="Kefayaan — curated products and buying guides">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${safeTitle}">
    <meta name="twitter:description" content="${safeDescription}">
    <meta name="twitter:image" content="${imageUrl}">
    <meta name="twitter:image:alt" content="Kefayaan — curated products and buying guides">
    <script type="application/ld+json">${websiteJsonLd}</script>
  </head>
  <body>
    <header>
      <a href="${safeCanonicalUrl}"><strong>Kefayaan</strong></a>
      <a href="${escapeHtml(`${origin}/blog`)}">Buying guides</a>
    </header>
    <main>
      <h1>Discover products that fit your everyday needs.</h1>
      <p>Browse curated products by category, compare useful product details and key features, then continue to the retailer to check current price and availability.</p>
      ${availableProducts.length
        ? `<h2>Browse products by category</h2>${categoriesMarkup}`
        : '<p>Product selections are being updated. Please check back soon.</p>'}
      <section>
        <h2>Practical buying guides</h2>
        <p>Explore product-focused advice and compare items from the current catalog.</p>
        ${guidesMarkup}
      </section>
      <p>Purchases are completed on the retailer’s website. Kefayaan may earn a commission from qualifying purchases.</p>
    </main>
  </body>
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
