import type { IncomingMessage, ServerResponse } from 'node:http';
import { getProductPath, getProductRouteSlug } from '../src/utils/productRoutes.js';
import { getYouTubeEmbedUrl } from '../src/utils/helpers.js';
import { getSiteOrigin } from '../server/siteOrigin.js';
import { getProductForPreview } from './product-data.js';

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] || character);

const getSafeImageUrl = (image: string | null | undefined, origin: string): string | undefined => {
  if (typeof image !== 'string' || !image.trim()) return undefined;
  try {
    const url = new URL(image, origin);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : undefined;
  } catch {
    return undefined;
  }
};

const getShareImage = async (image: string, origin: string, routeSlug: string): Promise<{ url: string; optimized: boolean }> => {
  const imageUrl = new URL(image, origin);
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const configuredSiteUrl = process.env.VITE_SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const productPageOrigin = configuredSiteUrl
    ? new URL(configuredSiteUrl.includes('://') ? configuredSiteUrl : `https://${configuredSiteUrl}`).origin
    : origin;
  const supabaseOrigin = supabaseUrl ? new URL(supabaseUrl).origin : null;
  if (imageUrl.origin !== productPageOrigin && imageUrl.origin !== supabaseOrigin) {
    return { url: imageUrl.href, optimized: false };
  }

  const previewImageUrl = new URL('/api/product-preview-image', origin);
  previewImageUrl.searchParams.set('slug', routeSlug);
  return { url: previewImageUrl.href, optimized: true };
};

const sendHtml = (response: ServerResponse, status: number, html: string): void => {
  response.statusCode = status;
  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  response.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=3600');
  response.end(html);
};

export default async function handler(request: IncomingMessage, response: ServerResponse): Promise<void> {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.setHeader('Allow', 'GET, HEAD');
    sendHtml(response, 405, '<!doctype html><title>Method not allowed</title>');
    return;
  }

  try {
    const requestUrl = new URL(request.url || '/', 'http://localhost');
    const routeSlug = requestUrl.searchParams.get('slug') || getProductRouteSlug(requestUrl.pathname);
    if (!routeSlug) {
      sendHtml(response, 404, '<!doctype html><title>Product not found</title>');
      return;
    }

    const product = await getProductForPreview(routeSlug);
    if (!product) {
      sendHtml(response, 404, '<!doctype html><title>Product not found</title><meta name="robots" content="noindex">');
      return;
    }

    const origin = getSiteOrigin(request);
    const variantId = requestUrl.searchParams.get('variant');
    const selectedVariant = variantId
      ? product.variants?.find((variant) => variant.id === variantId)
      : undefined;
    const canonicalUrl = new URL(getProductPath(product), origin).href;
    const title = `${product.title} | Kefayaan`;
    const productDescription = product.description?.trim() || '';
    const description = productDescription.replace(/\s+/g, ' ').slice(0, 300) ||
      `Explore ${product.title}, including product details, pricing, images, and buying options on Kefayaan.`;
    const productImageUrls = [...new Set(
      [product.image, ...(Array.isArray(product.gallery) ? product.gallery : [])]
        .map((image) => getSafeImageUrl(image, origin))
        .filter((image): image is string => Boolean(image)),
    )];
    const currentPrice = selectedVariant?.dealPrice ?? product.dealPrice;
    const safePrice = Number.isFinite(currentPrice) && currentPrice > 0
      ? currentPrice.toFixed(2)
      : null;
    let imageUrl = new URL('/assets/brand/kefayaan-logo.jpg', origin).href;
    let shareImageAlt = 'Kefayaan logo';
    let hasOptimizedImage = false;
    try {
      const candidate = await getShareImage(product.image, origin, routeSlug);
      const candidateUrl = new URL(candidate.url);
      if (candidateUrl.protocol === 'http:' || candidateUrl.protocol === 'https:') {
        imageUrl = candidateUrl.href;
        shareImageAlt = product.imageAlt || product.title;
        hasOptimizedImage = candidate.optimized;
      }
    } catch (error) {
      console.warn('Product preview image URL is invalid', error);
    }

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.title,
      description: productDescription || description,
      image: productImageUrls.length ? productImageUrls : undefined,
      brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
      category: product.category,
      offers: safePrice ? {
        '@type': 'Offer',
        url: canonicalUrl,
        priceCurrency: 'USD',
        price: safePrice,
        availability: product.inStock && selectedVariant?.inStock !== false
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      } : undefined,
    };
    const jsonLd = JSON.stringify([
      structuredData,
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
          { '@type': 'ListItem', position: 2, name: product.title, item: canonicalUrl },
        ],
      },
    ]).replace(/</g, '\\u003c');
    const escapedTitle = escapeHtml(title);
    const escapedDescription = escapeHtml(description);
    const escapedImage = escapeHtml(imageUrl);
    const escapedUrl = escapeHtml(canonicalUrl);
    const escapedProductImage = productImageUrls[0] ? escapeHtml(productImageUrls[0]) : '';
    const productImagePreload = escapedProductImage
      ? `<link rel="preload" as="image" href="${escapedProductImage}" fetchpriority="high">`
      : '';
    const productImages = productImageUrls.slice(1).map((image, index) =>
      `<img src="${escapeHtml(image)}" alt="${escapeHtml(product.imageAlt || `${product.title} product photo`)} ${index + 2}" loading="lazy" width="800" height="600">`,
    ).join('\n      ');
    const youtubeEmbedUrl = product.videoType === 'youtube' && product.videoUrl
      ? getYouTubeEmbedUrl(product.videoUrl)
      : null;
    const safeYoutubeEmbedUrl = youtubeEmbedUrl
      ? getSafeImageUrl(youtubeEmbedUrl, origin)
      : undefined;
    const directVideoUrl = product.videoType === 'direct' && product.videoUrl
      ? getSafeImageUrl(product.videoUrl, origin)
      : undefined;
    const productVideoMarkup = safeYoutubeEmbedUrl
      ? `<section><h2>Product video</h2><iframe src="${escapeHtml(safeYoutubeEmbedUrl)}" title="Product video for ${escapeHtml(product.title)}" width="560" height="315" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></section>`
      : directVideoUrl
        ? `<section><h2>Product video</h2><video controls preload="metadata" width="560" height="315"><source src="${escapeHtml(directVideoUrl)}" type="video/mp4"></video></section>`
        : '';
    const price = safePrice ? `$${safePrice}` : '';
    const listPrice = Number.isFinite(product.price) && product.price > product.dealPrice
      ? `<del>$${product.price.toFixed(2)}</del> `
      : '';
    const affiliateUrl = getSafeImageUrl(selectedVariant?.amazonUrl || product.amazonUrl, origin);
    const purchaseLink = affiliateUrl
      ? `<p><a href="${escapeHtml(affiliateUrl)}" rel="sponsored nofollow noopener" target="_blank">Check price and availability at the retailer</a></p>`
      : '';
    const safeBrand = product.brand ? `<p><strong>Brand:</strong> ${escapeHtml(product.brand)}</p>` : '';
    const safeCategory = product.category ? `<p><strong>Category:</strong> ${escapeHtml(product.category)}</p>` : '';
    const availability = product.inStock ? 'In stock' : 'Currently unavailable';
    const productImageMarkup = escapedProductImage
      ? `<img src="${escapedProductImage}" alt="${escapeHtml(product.imageAlt || `${product.title} product photo`)}" width="800" height="600" fetchpriority="high">`
      : '';
    const imageDimensions = hasOptimizedImage
      ? '<meta property="og:image:secure_url" content="' + escapeHtml(imageUrl) + '">\n    <meta property="og:image:type" content="image/jpeg">\n    <meta property="og:image:width" content="1200">\n    <meta property="og:image:height" content="630">'
      : '';
    const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapedTitle}</title>
    <meta name="description" content="${escapedDescription}">
    <meta name="theme-color" content="#0f172a">
    <meta name="robots" content="index,follow">
    <link rel="canonical" href="${escapedUrl}">
    ${productImagePreload}
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
    <link rel="icon" type="image/png" sizes="96x96" href="/favicon.png">
    <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico">
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    <link rel="manifest" href="/site.webmanifest">
    <meta property="og:site_name" content="Kefayaan">
    <meta property="og:locale" content="en_US">
    <meta property="og:type" content="product">
    <meta property="og:title" content="${escapedTitle}">
    <meta property="og:description" content="${escapedDescription}">
    <meta property="og:url" content="${escapedUrl}">
    <meta property="og:image" content="${escapedImage}">
    ${imageDimensions}
    <meta property="og:image:alt" content="${escapeHtml(shareImageAlt)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapedTitle}">
    <meta name="twitter:description" content="${escapedDescription}">
    <meta name="twitter:image" content="${escapedImage}">
    <meta name="twitter:image:alt" content="${escapeHtml(shareImageAlt)}">
    <script type="application/ld+json">${jsonLd}</script>
  </head>
  <body>
    <header><a href="/">Kefayaan</a> <a href="/blog">Buying Guides</a></header>
    <main>
      <nav aria-label="Breadcrumb"><a href="/">Home</a> &rsaquo; <a href="/">Products</a> &rsaquo; ${escapeHtml(product.title)}</nav>
      <article>
        <h1>${escapeHtml(product.title)}</h1>
        ${safeBrand}
        ${safeCategory}
        ${selectedVariant ? `<p><strong>Option:</strong> ${escapeHtml(selectedVariant.name)}</p>` : ''}
        ${productVideoMarkup}
        ${productImageMarkup}
        ${productImages}
        <p>${escapeHtml(productDescription || description)}</p>
        ${price ? `<p><strong>${listPrice}${price}</strong></p>` : ''}
        <p>Availability: ${availability}. Price and availability can change; confirm current details with the retailer.</p>
        ${purchaseLink}
        <p>Affiliate disclosure: Kefayaan may earn a commission from qualifying purchases through retailer links.</p>
      </article>
    </main>
  </body>
</html>`;
    sendHtml(response, 200, request.method === 'HEAD' ? '' : html);
  } catch (error) {
    console.error('Product share preview generation failed', error);
    sendHtml(response, 503, '<!doctype html><title>Product preview unavailable</title>');
  }
}
