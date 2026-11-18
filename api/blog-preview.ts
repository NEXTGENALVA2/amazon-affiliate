import type { IncomingMessage, ServerResponse } from 'node:http';
import { BLOG_ARTICLES, getBlogArticle } from '../src/data/blog.js';
import { getSiteOrigin } from './siteOrigin.js';

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] || character);

const sendHtml = (response: ServerResponse, status: number, html: string, method: string): void => {
  response.statusCode = status;
  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  response.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=3600');
  response.end(method === 'HEAD' ? '' : html);
};

const renderArticle = (article: (typeof BLOG_ARTICLES)[number], origin: string): string => {
  const url = `${origin}/blog/${article.slug}`;
  const title = `${article.title} | Kefayaan`;
  const description = article.description;
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    author: { '@type': 'Organization', name: 'Kefayaan Editorial Team' },
    publisher: {
      '@type': 'Organization',
      name: 'Kefayaan',
      url: `${origin}/`,
      logo: { '@type': 'ImageObject', url: `${origin}/assets/aistudio/DP_af5fa802.png` },
    },
    mainEntityOfPage: url,
  }).replace(/</g, '\\u003c');
  const sections = article.sections.map((section) => `
    <section>
      <h2>${escapeHtml(section.heading)}</h2>
      ${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('\n      ')}
      ${section.bullets ? `<ul>${section.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join('')}</ul>` : ''}
    </section>`).join('\n');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="robots" content="index,follow">
    <link rel="canonical" href="${escapeHtml(url)}">
    <meta property="og:site_name" content="Kefayaan">
    <meta property="og:type" content="article">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${escapeHtml(url)}">
    <meta property="og:image" content="${origin}/assets/aistudio/DP_af5fa802.png">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${origin}/assets/aistudio/DP_af5fa802.png">
    <script type="application/ld+json">${jsonLd}</script>
  </head>
  <body>
    <header><a href="/">Kefayaan</a> <a href="/blog">Buying Guides</a></header>
    <main>
      <article>
        <p>${escapeHtml(article.category)}</p>
        <h1>${escapeHtml(article.title)}</h1>
        <p>${escapeHtml(article.description)}</p>
        <p>By Kefayaan Editorial Team · ${escapeHtml(article.publishedAt)} · ${article.readingMinutes} min read</p>
        <aside><strong>Affiliate disclosure:</strong> Kefayaan may earn a commission from qualifying purchases through retailer links. This guide is general shopping information, not a claim of independent product testing. Product details, availability, and prices can change; confirm them with the retailer.</aside>
        ${sections}
        <p><a href="/blog">More buying guides</a></p>
      </article>
    </main>
  </body>
</html>`;
};

const renderIndex = (origin: string): string => {
  const url = `${origin}/blog`;
  const title = 'Kefayaan Buying Guides | Practical Product Advice';
  const description = 'Practical checklists for comparing products, features, fit, and purchase terms.';
  const cards = BLOG_ARTICLES.map((article) => `
    <article>
      <h2><a href="/blog/${article.slug}">${escapeHtml(article.title)}</a></h2>
      <p>${escapeHtml(article.description)}</p>
      <a href="/blog/${article.slug}">Read the guide</a>
    </article>`).join('\n');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${title}</title>
    <meta name="description" content="${description}">
    <meta name="robots" content="index,follow">
    <link rel="canonical" href="${url}">
    <meta property="og:site_name" content="Kefayaan">
    <meta property="og:type" content="website">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${url}">
    <meta property="og:image" content="${origin}/assets/aistudio/DP_af5fa802.png">
    <meta name="twitter:card" content="summary_large_image">
  </head>
  <body>
    <header><a href="/">Kefayaan</a></header>
    <main>
      <h1>Practical guides for better buying decisions</h1>
      <p>Clear checklists to help compare product fit, features, and purchase terms.</p>
      ${cards}
    </main>
  </body>
</html>`;
};

export default function handler(request: IncomingMessage, response: ServerResponse): void {
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
      sendHtml(response, 200, renderIndex(origin), request.method);
      return;
    }

    const article = getBlogArticle(slug);
    if (!article) {
      sendHtml(response, 404, '<!doctype html><title>Guide not found</title><meta name="robots" content="noindex">', request.method);
      return;
    }
    sendHtml(response, 200, renderArticle(article, origin), request.method);
  } catch (error) {
    console.error('Blog preview generation failed', error);
    sendHtml(response, 503, '<!doctype html><title>Blog preview unavailable</title>', request.method || 'GET');
  }
}
