import { Product } from '../types';

const slugify = (value: string): string =>
  value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'product';

export const getProductPath = (product: Product): string =>
  `/products/${slugify(product.slug || product.title)}-${encodeURIComponent(product.id)}`;

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
    const slug = slugify(product.slug || product.title);
    return routeSlug === `${slug}-${product.id}` || routeSlug === slug;
  });
