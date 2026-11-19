import React from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Clock3 } from 'lucide-react';
import { BLOG_ARTICLES, BlogArticle, getRelatedProducts } from '../data/blog';
import { Product } from '../types';
import { getProductPath } from '../utils/productRoutes';
import { formatCurrency } from '../utils/helpers';
import { store } from '../services/store';
import { getProductCategoryDescription, getProductCategorySections } from '../utils/productCategories';
import type { ProductCategorySection } from '../utils/productCategories';

interface BlogPageProps {
  slug: string | null;
  products: Product[];
  productsReady: boolean;
}

const ArticleCard: React.FC<{ article: BlogArticle; products: Product[] }> = ({ article, products }) => {
  const [product] = getRelatedProducts(article, products, 1);
  return (
    <a
      href={`/blog/${article.slug}`}
      className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-amber-400 hover:shadow-lg sm:p-6"
    >
      <span className="text-xs font-bold uppercase tracking-wider text-amber-700">{article.category}</span>
      <h2 className="mt-2 text-xl font-extrabold leading-snug text-slate-950 group-hover:text-amber-700">{article.title}</h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">{article.description}</p>
      {product && (
        <span className="mt-4 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
          <img src={product.image} alt="" className="h-14 w-14 rounded-lg bg-white object-contain" loading="lazy" />
          <span className="min-w-0">
            <span className="block text-[10px] font-bold uppercase text-slate-500">Product in this guide</span>
            <span className="mt-1 block line-clamp-2 text-xs font-semibold text-slate-800">{product.title}</span>
          </span>
        </span>
      )}
      <span className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-slate-800">
        Read guide and compare product <ArrowRight className="h-4 w-4" />
      </span>
    </a>
  );
};

const ProductRecommendation: React.FC<{ product: Product; retailerName: string }> = ({ product, retailerName }) => (
  <a
    key={product.id}
    href={getProductPath(product)}
    className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-amber-400 hover:shadow-sm"
  >
    <img src={product.image} alt={product.imageAlt || `${product.title} product photo`} className="h-20 w-20 shrink-0 rounded-xl bg-slate-100 object-contain" loading="lazy" />
    <span className="min-w-0 flex-1">
      <span className="block text-xs font-bold uppercase text-slate-500">{product.brand}</span>
      <span className="mt-1 block line-clamp-2 text-sm font-bold text-slate-900">{product.title}</span>
      {product.dealPrice > 0 && (
        <span className="mt-1 block text-xs font-semibold text-slate-700">
          Listed price: {formatCurrency(product.dealPrice)} <span className="font-normal text-slate-500">at {retailerName}</span>
        </span>
      )}
      <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-amber-700">
        View product and buying options <ArrowRight className="h-3 w-3" />
      </span>
    </span>
  </a>
);

const CategoryCollection: React.FC<{ section: ProductCategorySection; retailerName: string }> = ({ section, retailerName }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
    <header className="flex items-start justify-between gap-3">
      <div>
        <h3 className="text-lg font-extrabold text-slate-950">{section.name}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">{getProductCategoryDescription(section.name)}</p>
      </div>
      <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
        {section.count} in stock
      </span>
    </header>
    {section.count > section.products.length && (
      <p className="mt-3 text-xs text-slate-500">Showing the latest {section.products.length} listings.</p>
    )}
    <div className="mt-4 space-y-3">
      {section.products.map((product) => (
        <a
          key={product.id}
          href={getProductPath(product)}
          className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-amber-400 hover:bg-amber-50/40"
        >
          <img
            src={product.image}
            alt={product.imageAlt || `${product.title} product photo`}
            className="h-16 w-16 shrink-0 rounded-lg bg-slate-50 object-contain"
            loading="lazy"
          />
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] font-bold uppercase text-slate-500">{product.brand}</span>
            <span className="mt-1 block line-clamp-2 text-sm font-bold text-slate-900">{product.title}</span>
            {product.dealPrice > 0 && (
              <span className="mt-1 block text-xs text-slate-600">
                Listed price: {formatCurrency(product.dealPrice)} at {retailerName}
              </span>
            )}
            <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-amber-700">
              View product <ArrowRight className="h-3 w-3" />
            </span>
          </span>
        </a>
      ))}
    </div>
  </section>
);

export const BlogPage: React.FC<BlogPageProps> = ({ slug, products, productsReady }) => {
  const storeSettings = store.getStoreSettings();
  const affiliateDisclosure = storeSettings.retailerName.toLowerCase() === 'amazon'
    ? `As an Amazon Associate, ${storeSettings.shopName} earns from qualifying purchases.`
    : `${storeSettings.shopName} may earn a commission from qualifying purchases through ${storeSettings.retailerName} links.`;
  const article = slug ? BLOG_ARTICLES.find((item) => item.slug === slug) : undefined;
  const relatedProducts = article ? getRelatedProducts(article, products) : [];
  const categorySections = getProductCategorySections(products);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <a href="/" className="inline-flex items-center gap-2.5 font-extrabold tracking-tight text-slate-950">
            <img src="/assets/brand/kefayaan-logo.jpg" alt="" className="h-9 w-9 rounded-lg object-cover" />
            Kefayaan
          </a>
          <nav className="flex items-center gap-4 text-sm font-semibold">
            <a href={slug ? '/blog#shop-by-category' : '#shop-by-category'} className="text-slate-600 hover:text-slate-950">Shop categories</a>
            <a href="#ordering-steps" className="text-amber-700 hover:text-amber-800">How to order</a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        {slug && !article ? (
          <section className="rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center">
            <h1 className="text-2xl font-extrabold">Guide not found</h1>
            <a href="/blog" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-amber-700">
              <ArrowLeft className="h-4 w-4" /> Browse all buying guides
            </a>
          </section>
        ) : article ? (
          <article>
            <a href="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900">
              <ArrowLeft className="h-4 w-4" /> All buying guides
            </a>
            <header className="mt-7 border-b border-slate-200 pb-7">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-700">{article.category}</p>
              <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-5xl">{article.title}</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">{article.description}</p>
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
                <span>By Kefayaan Editorial Team</span>
                <time dateTime={article.publishedAt}>{new Date(`${article.publishedAt}T12:00:00Z`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</time>
                <span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" /> {article.readingMinutes} min read</span>
              </div>
            </header>

            <aside className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
              <strong>Affiliate disclosure:</strong> {affiliateDisclosure} This guide is for general shopping information, not a claim of independent product testing. Product details, availability, and prices can change; confirm them with the retailer.
            </aside>

            <section id="ordering-steps" className="mt-5 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
              <h2 className="font-extrabold text-slate-950">How to order from Kefayaan</h2>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm leading-6 text-slate-700">
                <li>Choose a product below and open its Kefayaan product page.</li>
                <li>Review the details, then select the retailer purchase button.</li>
                <li>Finish checkout, payment, and delivery with {storeSettings.retailerName}. The retailer handles your order; Kefayaan does not take payment or ship it.</li>
              </ol>
            </section>

            <div className="mt-8 space-y-8">
              {article.sections.map((section) => (
                <section key={section.heading}>
                  <h2 className="text-xl font-extrabold text-slate-950 sm:text-2xl">{section.heading}</h2>
                  <div className="mt-3 space-y-4 text-sm leading-7 text-slate-700 sm:text-base">
                    {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  </div>
                  {section.bullets && (
                    <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700 sm:text-base">
                      {section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                    </ul>
                  )}
                </section>
              ))}
            </div>

            {relatedProducts.length > 0 && (
              <section className="mt-10 border-t border-slate-200 pt-8">
                <h2 className="text-xl font-extrabold text-slate-950">Products related to this guide</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">These are catalog examples to compare, not products we claim to have independently tested.</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {relatedProducts.map((product) => (
                    <ProductRecommendation key={product.id} product={product} retailerName={storeSettings.retailerName} />
                  ))}
                </div>
              </section>
            )}

            <nav aria-label="More buying guides" className="mt-10 flex flex-wrap gap-5 border-t border-slate-200 pt-6">
              <a href="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-amber-700 hover:text-amber-800">
                <BookOpen className="h-4 w-4" /> Explore more buying guides
              </a>
              <a href="#ordering-steps" className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-slate-950">
                How to order <ArrowRight className="h-4 w-4" />
              </a>
            </nav>
          </article>
        ) : (
          <section>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Kefayaan Buying Guides</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">Practical guides for better buying decisions</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Product-focused checklists to help compare real catalog options, key specifications, and purchase terms. We do not present these guides as independent lab tests.
            </p>
            <section id="shop-by-category" className="mt-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Shop the Kefayaan catalog</p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">Useful finds, all in one place</h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
                  Browse pet food and care, kitchen and home accessories, technology, nutrition, and more. These sections follow the live catalog: new in-stock products appear under the category saved for them, with the newest listings shown first.
                </p>
              </div>
              {categorySections.length > 0 ? (
                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  {categorySections.map((section) => (
                    <CategoryCollection key={section.name} section={section} retailerName={storeSettings.retailerName} />
                  ))}
                </div>
              ) : (
                <p role="status" className="mt-5 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                  {productsReady ? 'There are no in-stock products to show right now.' : 'Loading the latest catalog products…'}
                </p>
              )}
            </section>
            <section id="ordering-steps" className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 sm:p-5">
              <h2 className="font-extrabold text-slate-950">How to order from Kefayaan</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                Open a related product page, review the details, then choose its retailer purchase button. Checkout and delivery happen on {storeSettings.retailerName}; Kefayaan does not take payment or ship orders.
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-600">{affiliateDisclosure} Product prices and availability can change; confirm them with the retailer.</p>
            </section>
            <div id="buying-guides" className="mt-10">
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-950">Product buying guides</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Practical checklists linked to relevant products in the current catalog.</p>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {BLOG_ARTICLES.map((item) => <ArticleCard key={item.slug} article={item} products={products} />)}
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white px-4 py-6 text-center text-xs leading-5 text-slate-500">
        <a href="/" className="font-semibold text-slate-700 hover:text-slate-950">Kefayaan home</a>
        <p className="mx-auto mt-2 max-w-3xl">{affiliateDisclosure} Product details and prices may change; verify current information on the retailer's website.</p>
      </footer>
    </div>
  );
};
