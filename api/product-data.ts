import { createClient } from '@supabase/supabase-js';
import type { Product } from '../src/types.js';
import { findProductByRouteSlug } from '../src/utils/productRoutes.js';

const isProduct = (value: unknown): value is Product => {
  if (!value || typeof value !== 'object') return false;
  const product = value as Partial<Product>;
  return typeof product.id === 'string' &&
    typeof product.title === 'string' &&
    typeof product.image === 'string' &&
    typeof product.brand === 'string' &&
    typeof product.category === 'string' &&
    typeof product.description === 'string' &&
    typeof product.dealPrice === 'number' &&
    typeof product.inStock === 'boolean';
};

export const getProductsForPreview = async (): Promise<Product[]> => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required for product previews.');
  }

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client
    .from('products')
    .select('payload')
    .order('updated_at', { ascending: false });
  if (error) throw error;

  const products = (data || [])
    .flatMap((row) => Array.isArray(row.payload) ? row.payload : [row.payload])
    .filter(isProduct);
  return products;
};

export const getProductForPreview = async (routeSlug: string): Promise<Product | undefined> =>
  findProductByRouteSlug(await getProductsForPreview(), routeSlug);
