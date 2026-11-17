import { Product } from '../types';

export const slugifyProductTitle = (value: string): string =>
  value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'product';

export const getProductPath = (product: Product): string =>
  `/products/${slugifyProductTitle(product.title)}`;

export const getProductRouteSlug = (pathname: string): string | null => {
  const match = pathname.match(/^\/products\/([^/]+)\/?$/);
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
};

export const findProductByRouteSlug = (products: Product[], routeSlug: string): Product | undefined =>
  products.find((product) => {
    const titleSlug = slugifyProductTitle(product.title);
    const savedSlug = slugifyProductTitle(product.slug || product.title);
    const legacySlug = `${savedSlug}-${encodeURIComponent(product.id)}`;
    return routeSlug === titleSlug || routeSlug === savedSlug || routeSlug === legacySlug;
  });
