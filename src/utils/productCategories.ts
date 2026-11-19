import { Product } from '../types';

export interface ProductCategoryCount {
  name: string;
  count: number;
}

export interface ProductCategorySection extends ProductCategoryCount {
  products: Product[];
}

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  'cat food & pet care': 'Pet food and everyday care products from the current catalog.',
  'gym & sports nutrition': 'Nutrition and workout products for active routines.',
  'home & kitchen gadgets': 'Kitchen tools, appliances, and practical home accessories.',
  'tech & smart gadgets': 'Electronics, audio, and smart-home products.',
  'home & workstation': 'Useful products for home, desk, and workstation setups.',
};

const getProductTimestamp = (value: string): number => {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : 0;
};

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

export const getProductCategoryDescription = (category: string): string =>
  CATEGORY_DESCRIPTIONS[category.trim().toLocaleLowerCase()] ||
  `Explore the latest ${category} products in the Kefayaan catalog.`;

export const getProductCategorySections = (
  products: Product[],
  productsPerCategory = 3,
): ProductCategorySection[] => {
  const categories = new Map<string, { name: string; products: Product[] }>();

  products.forEach((product) => {
    const name = product.category.trim();
    if (!name || !product.inStock) return;

    const key = name.toLocaleLowerCase();
    const existing = categories.get(key);
    if (existing) {
      existing.products.push(product);
    } else {
      categories.set(key, { name, products: [product] });
    }
  });

  return Array.from(categories.values())
    .map(({ name, products: categoryProducts }) => {
      const latestProducts = [...categoryProducts].sort((a, b) =>
        getProductTimestamp(b.createdAt) - getProductTimestamp(a.createdAt) ||
        getProductTimestamp(b.updatedAt) - getProductTimestamp(a.updatedAt),
      );
      return {
        name,
        count: categoryProducts.length,
        products: latestProducts.slice(0, productsPerCategory),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
};
