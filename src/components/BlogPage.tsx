import React from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Clock3, ExternalLink } from 'lucide-react';
import { BLOG_ARTICLES, BlogArticle } from '../data/blog';
import { Product } from '../types';
import { getProductPath } from '../utils/productRoutes';

interface BlogPageProps {
  slug: string | null;
  products: Product[];
}

const ArticleCard: React.FC<{ article: BlogArticle }> = ({ article }) => (
  <a
    href={`/blog/${article.slug}`}
    className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-amber-400 hover:shadow-lg sm:p-6"
  >
    <span className="text-xs font-bold uppercase tracking-wider text-amber-700">{article.category}</span>
    <h2 className="mt-2 text-xl font-extrabold leading-snug text-slate-950 group-hover:text-amber-700">{article.title}</h2>
    <p className="mt-3 text-sm leading-6 text-slate-600">{article.description}</p>
    <span className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-slate-800">
      Read the guide <ArrowRight className="h-4 w-4" />
    </span>
  </a>
);

export const BlogPage: React.FC<BlogPageProps> = ({ slug, products }) => {
  const article = slug ? BLOG_ARTICLES.find((item) => item.slug === slug) : undefined;
  const relatedProducts = article
    ? article.relatedProductIds
      .map((id) => products.find((product) => product.id === id))
      .filter((product): product is Product => Boolean(product))
    : [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <a href="/" className="font-extrabold tracking-tight text-slate-950">Kefayaan</a>
          <a href="/blog" className="text-sm font-semibold text-slate-600 hover:text-slate-950">Buying Guides</a>
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
              <strong>Affiliate disclosure:</strong> As an Amazon Associate, Kefayaan earns from qualifying purchases. This guide is for general shopping information, not a claim of independent product testing. Product details, availability, and prices can change; confirm them with the seller.
            </aside>

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
                <h2 className="text-xl font-extrabold text-slate-950">Compare an option from our catalog</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">Open the product page to review current details and buying options.</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {relatedProducts.map((product) => (
                    <a
                      key={product.id}
                      href={getProductPath(product)}
                      className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 hover:border-amber-400"
                    >
                      <img src={product.image} alt="" className="h-20 w-20 rounded-xl bg-slate-100 object-contain" loading="lazy" />
                      <span className="min-w-0">
                        <span className="block text-xs font-bold uppercase text-slate-500">{product.brand}</span>
                        <span className="mt-1 block line-clamp-2 text-sm font-bold text-slate-900">{product.title}</span>
                        <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-amber-700">View details <ExternalLink className="h-3 w-3" /></span>
                      </span>
                    </a>
                  ))}
                </div>
              </section>
            )}

            <nav aria-label="More buying guides" className="mt-10 border-t border-slate-200 pt-6">
              <a href="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-amber-700 hover:text-amber-800">
                <BookOpen className="h-4 w-4" /> Explore more buying guides
              </a>
            </nav>
          </article>
        ) : (
          <section>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Kefayaan Buying Guides</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">Practical guides for better buying decisions</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Clear checklists to help compare product fit, features, and purchase terms. We do not present these guides as independent lab tests.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {BLOG_ARTICLES.map((item) => <ArticleCard key={item.slug} article={item} />)}
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white px-4 py-6 text-center text-xs leading-5 text-slate-500">
        <a href="/" className="font-semibold text-slate-700 hover:text-slate-950">Kefayaan home</a>
        <p className="mx-auto mt-2 max-w-3xl">As an Amazon Associate, Kefayaan earns from qualifying purchases. Product details and prices may change; verify current information on Amazon.</p>
      </footer>
    </div>
  );
};
