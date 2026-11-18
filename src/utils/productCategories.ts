import { Product } from '../types';

export interface ProductCategoryCount {
  name: string;
  count: number;
}

export const getProductCategoryCounts = (products: Product[]): ProductCategoryCount[] => {
  const categories = new Map<string, ProductCategoryCount>();

  products.forEach((product) => {
    const name = product.category.trim();
    if (!name) return;

    const key = name.toLocaleLowerCase();
    const existing = categories.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      categories.set(key, { name, count: 1 });
    }
  });

  return Array.from(categories.values()).sort((a, b) => a.name.localeCompare(b.name));
};
