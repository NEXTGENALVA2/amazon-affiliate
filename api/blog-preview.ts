import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Product } from '../src/types.js';
import { getProductPath } from '../src/utils/productRoutes.js';
import { BLOG_ARTICLES, getBlogArticle, getRelatedProducts } from '../src/data/blog.js';
import { getSiteOrigin } from './siteOrigin.js';
import { getProductsForPreview } from './product-data.js';

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] || character);

const getProductImageUrl = (product: Product, origin: string): string | undefined => {
  try {
    const image = new URL(product.image, origin);
    return ['http:', 'https:'].includes(image.protocol) ? image.href : undefined;
  } catch {
    return undefined;
  }
};

const sendHtml = (response: ServerResponse, status: number, html: string, method: string): void => {
  response.statusCode = status;
  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  response.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=3600');
  response.end(method === 'HEAD' ? '' : html);
};

const renderArticle = (article: (typeof BLOG_ARTICLES)[number], origin: string, products: Product[]): string => {
  const url = `${origin}/blog/${article.slug}`;
  const title = `${article.title} | Kefayaan`;
  const description = article.description;
  const relatedProducts = getRelatedProducts(article, products);
  const imageUrl = relatedProducts.map((product) => getProductImageUrl(product, origin)).find(Boolean) ||
    `${origin}/assets/brand/kefayaan-logo.jpg`;
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description,
    image: [imageUrl],
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    author: { '@type': 'Organization', name: 'Kefayaan Editorial Team' },
    publisher: {
      '@type': 'Organization',
      name: 'Kefayaan',
      url: `${origin}/`,
      logo: { '@type': 'ImageObject', url: `${origin}/assets/brand/kefayaan-logo.jpg` },
    },
    mentions: relatedProducts.map((product) => ({
      '@type': 'Product',
      name: product.title,
      url: new URL(getProductPath(product), origin).href,
    })),
    mainEntityOfPage: url,
  }).replace(/</g, '\\u003c');
  const sections = article.sections.map((section) => `
    <section>
      <h2>${escapeHtml(section.heading)}</h2>
      ${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('\n      ')}
      ${section.bullets ? `<ul>${section.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join('')}</ul>` : ''}
    </section>`).join('\n');
  const productCards = relatedProducts.map((product) => {
    const productUrl = new URL(getProductPath(product), origin).href;
    const productImage = getProductImageUrl(product, origin);
    const imageMarkup = productImage
      ? `<img src="${escapeHtml(productImage)}" alt="${escapeHtml(product.title)}" width="160" height="160" loading="lazy">`
      : '';
    const priceMarkup = Number.isFinite(product.dealPrice) && product.dealPrice > 0
      ? `<p>Listed price: $${product.dealPrice.toFixed(2)} USD. Confirm the current price with the retailer.</p>`
      : '';
    return `
      <div>
        ${imageMarkup}
        <p>${escapeHtml(product.brand)}</p>
        <h3><a href="${escapeHtml(productUrl)}">${escapeHtml(product.title)}</a></h3>
        ${priceMarkup}
        <p><a href="${escapeHtml(productUrl)}">View product and buying options</a></p>
      </div>`;
  }).join('\n');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="robots" content="index,follow">
    <link rel="canonical" href="${escapeHtml(url)}">
    <link rel="icon" type="image/png" sizes="96x96" href="/favicon.png">
    <link rel="shortcut icon" href="/favicon.ico">
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    <meta property="og:site_name" content="Kefayaan">
    <meta property="og:type" content="article">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${escapeHtml(url)}">
    <meta property="og:image" content="${escapeHtml(imageUrl)}">
    <meta property="og:image:alt" content="${escapeHtml(relatedProducts[0]?.title || 'Kefayaan buying guide')}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${escapeHtml(imageUrl)}">
    <script type="application/ld+json">${jsonLd}</script>
  </head>
  <body>
    <header>
      <a href="/"><img src="/assets/brand/kefayaan-logo.jpg" width="40" height="40" alt=""> Kefayaan</a>
      <a href="/blog">Buying Guides</a>
      <a href="#ordering-steps">How to order</a>
    </header>
    <main>
      <article>
        <p>${escapeHtml(article.category)}</p>
        <h1>${escapeHtml(article.title)}</h1>
        <p>${escapeHtml(article.description)}</p>
        <p>By Kefayaan Editorial Team · ${escapeHtml(article.publishedAt)} · ${article.readingMinutes} min read</p>
        <aside><strong>Affiliate disclosure:</strong> Kefayaan may earn a commission from qualifying purchases through retailer links. This guide is general shopping information, not a claim of independent product testing. Product details, availability, and prices can change; confirm them with the retailer.</aside>
        <section id="ordering-steps">
          <h2>How to order through Kefayaan</h2>
          <ol>
            <li>Choose a related product below and open its Kefayaan product page.</li>
            <li>Review the details, then select the retailer purchase button.</li>
            <li>Finish checkout, payment, and delivery on the retailer’s website. Kefayaan does not take payment or ship orders.</li>
          </ol>
        </section>
        ${sections}
        ${relatedProducts.length ? `<section><h2>Products related to this guide</h2><p>These are catalog examples to compare, not products we claim to have independently tested.</p>${productCards}</section>` : ''}
        <p><a href="/blog">More buying guides</a></p>
      </article>
    </main>
  </body>
</html>`;
};

const renderIndex = (origin: string, products: Product[]): string => {
  const url = `${origin}/blog`;
  const title = 'Kefayaan Buying Guides | Practical Product Advice';
  const description = 'Product-focused buying guides with catalog examples, practical comparison checklists, and current retailer buying options.';
  const cards = BLOG_ARTICLES.map((article) => {
    const guideUrl = `${origin}/blog/${article.slug}`;
    const [product] = getRelatedProducts(article, products, 1);
    const productUrl = product ? new URL(getProductPath(product), origin).href : null;
    const productLink = product && productUrl
      ? `<p>Compare: <a href="${escapeHtml(productUrl)}">${escapeHtml(product.title)}</a></p>`
      : '';
    return `
      <article>
        <h2><a href="${escapeHtml(guideUrl)}">${escapeHtml(article.title)}</a></h2>
        <p>${escapeHtml(article.description)}</p>
        ${productLink}
        <a href="${escapeHtml(guideUrl)}">Read the guide and compare products</a>
      </article>`;
  }).join('\n');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${title}</title>
    <meta name="description" content="${description}">
    <meta name="robots" content="index,follow">
    <link rel="canonical" href="${url}">
    <link rel="icon" type="image/png" sizes="96x96" href="/favicon.png">
    <link rel="shortcut icon" href="/favicon.ico">
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    <meta property="og:site_name" content="Kefayaan">
    <meta property="og:type" content="website">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${url}">
    <meta property="og:image" content="${origin}/assets/brand/kefayaan-logo.jpg">
    <meta name="twitter:card" content="summary_large_image">
  </head>
  <body>
    <header>
      <a href="/"><img src="/assets/brand/kefayaan-logo.jpg" width="40" height="40" alt=""> Kefayaan</a>
      <a href="#ordering-steps">How to order</a>
    </header>
    <main>
      <h1>Practical guides for better buying decisions</h1>
      <p>Product-focused checklists to compare real catalog options, key specifications, and purchase terms.</p>
      <section id="ordering-steps">
        <h2>How to order through Kefayaan</h2>
        <p>Open a related product page, review the details, then choose its retailer purchase button. Checkout, payment, and delivery happen on the retailer’s website; Kefayaan does not take payment or ship orders.</p>
      </section>
      ${cards}
    </main>
  </body>
</html>`;
};

export default async function handler(request: IncomingMessage, response: ServerResponse): Promise<void> {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.setHeader('Allow', 'GET, HEAD');
    sendHtml(response, 405, '<!doctype html><title>Method not allowed</title>', request.method || 'GET');
    return;
  }

  try {
    const requestUrl = new URL(request.url || '/', 'http://localhost');
    const pathSlug = requestUrl.pathname.match(/^\/blog\/([^/]+)\/?$/)?.[1];
    let slug = requestUrl.searchParams.get('slug') || pathSlug || null;
    if (slug) {
      try {
        slug = decodeURIComponent(slug);
      } catch {
        slug = pathSlug || slug;
      }
    }
    const origin = getSiteOrigin(request);
    if (!slug) {
      const products = await getProductsForPreview();
      sendHtml(response, 200, renderIndex(origin, products), request.method);
      return;
    }

    const article = getBlogArticle(slug);
    if (!article) {
      sendHtml(response, 404, '<!doctype html><title>Guide not found</title><meta name="robots" content="noindex">', request.method);
      return;
    }
    const products = await getProductsForPreview();
    sendHtml(response, 200, renderArticle(article, origin, products), request.method);
  } catch (error) {
    console.error('Blog preview generation failed', error);
    sendHtml(response, 503, '<!doctype html><title>Blog preview unavailable</title>', request.method || 'GET');
  }
}
