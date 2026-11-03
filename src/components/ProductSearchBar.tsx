import React, { useState } from 'react';
import { ArrowRight, Search, X } from 'lucide-react';
import { Product } from '../types';

interface ProductSearchBarProps {
  query: string;
  results: Product[];
  onQueryChange: (query: string) => void;
  onClear: () => void;
  onSubmit: (query: string) => void;
  onSelectProduct: (product: Product) => void;
  isSearchPage: boolean;
}

export const ProductSearchBar: React.FC<ProductSearchBarProps> = ({
  query,
  results,
  onQueryChange,
  onClear,
  onSubmit,
  onSelectProduct,
  isSearchPage,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const showResults = isFocused && Boolean(query.trim());
  const suggestions = results.slice(0, 5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsFocused(false);
    onSubmit(query);
  };

  return (
    <div className="relative z-30 border-b border-slate-200 bg-white px-3 py-3 shadow-sm sm:px-6 sm:py-4">
      <form onSubmit={handleSubmit} className="relative mx-auto flex max-w-3xl gap-2">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            role="combobox"
            aria-label="Search products"
            aria-expanded={showResults}
            aria-controls="product-search-suggestions"
            autoComplete="off"
            value={query}
            onFocus={() => setIsFocused(true)}
            onBlur={() => window.setTimeout(() => setIsFocused(false), 120)}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search products by name, brand, or category..."
            className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50 pl-10 pr-10 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-400/30 sm:h-14 sm:text-base"
          />
          {query && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={onClear}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {showResults && (
            <div
              id="product-search-suggestions"
              role="listbox"
              className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
            >
              {suggestions.length > 0 ? (
                <>
                  {suggestions.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      role="option"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setIsFocused(false);
                        onSelectProduct(product);
                      }}
                      className="flex w-full min-w-0 items-center gap-3 border-b border-slate-100 px-3 py-2.5 text-left last:border-b-0 hover:bg-amber-50 sm:px-4"
                    >
                      <img
                        src={product.image}
                        alt=""
                        className="h-11 w-11 shrink-0 rounded-lg border border-slate-200 bg-white object-contain p-1"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-bold text-slate-900 sm:text-sm">{product.title}</span>
                        <span className="mt-0.5 block truncate text-[10px] text-slate-500 sm:text-xs">
                          {product.brand} · {product.category}
                        </span>
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
                    </button>
                  ))}
                  {results.length > suggestions.length && (
                    <p className="px-4 py-2 text-center text-[11px] text-slate-500">
                      {results.length - suggestions.length} more exact matches
                    </p>
                  )}
                  <button
                    type="submit"
                    onMouseDown={(e) => e.preventDefault()}
                    className="w-full border-t border-slate-200 bg-slate-50 px-4 py-2.5 text-left text-xs font-bold text-amber-800 hover:bg-amber-50"
                  >
                    View all {results.length} results for “{query.trim()}”
                  </button>
                </>
              ) : (
                <p className="px-4 py-4 text-sm text-slate-500">
                  No exact product matches for “{query.trim()}”.
                </p>
              )}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 text-xs font-extrabold text-slate-950 transition hover:bg-amber-500 sm:h-14 sm:px-6 sm:text-sm"
        >
          <Search className="h-4 w-4" />
          <span className="hidden min-[380px]:inline">Search</span>
        </button>
      </form>
      <p className="mx-auto mt-1.5 max-w-3xl px-1 text-[10px] text-slate-500 sm:text-xs">
        {isSearchPage ? 'Press Enter to search again.' : 'Type to see exact matches, then press Enter for all results.'}
      </p>
    </div>
  );
};
