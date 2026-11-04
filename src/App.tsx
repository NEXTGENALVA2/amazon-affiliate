import React, { useState, useEffect } from 'react';
import {
  ExternalLink,
  ArrowLeft,
  ShieldCheck,
  Play,
  Sparkles,
  ArrowRight,
  MessageCircle,
  CheckCircle,
  HelpCircle,
  AlertCircle,
  Flame,
  Award,
  Star,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { Product } from './types';
import { getSocialPlatform, SocialPlatformIcon } from './components/SocialPlatformIcon';
import { store } from './services/store';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProductCard } from './components/ProductCard';
import { ProductSearchBar } from './components/ProductSearchBar';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ChatWidget } from './components/ChatWidget';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminLayout } from './components/admin/AdminLayout';
import { BuyerComparisonTable } from './components/BuyerComparisonTable';
import { formatCurrency } from './utils/helpers';
import { pixelService } from './services/pixelService';
import { findProductByRouteSlug, getProductPath, getProductRouteSlug } from './utils/productRoutes';

const setMetaContent = (selector: string, attribute: 'name' | 'property', key: string, content: string) => {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
};

const setCanonicalUrl = (url: string) => {
  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = url;
};

const getSearchQueryFromLocation = (): string | null => {
  if (window.location.pathname.replace(/\/+$/, '') !== '/search') return null;
  return new URLSearchParams(window.location.search).get('q')?.trim() ?? '';
};

const matchesProductQuery = (product: Product, query: string): boolean => {
  const searchTerm = query.trim().toLocaleLowerCase();
  if (!searchTerm) return false;
  return [product.title, product.brand, product.category]
    .some((value) => value.toLocaleLowerCase().includes(searchTerm));
};

export default function App() {
  const [currentView, setCurrentView] = useState<'storefront' | 'admin'>('storefront');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);

  // Store data
  const [products, setProducts] = useState<Product[]>([]);
  const [isProductsReady, setIsProductsReady] = useState(store.areProductsReady());
  const initialSearchQuery = getSearchQueryFromLocation();
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery ?? '');
  const [activeSearchQuery, setActiveSearchQuery] = useState<string | null>(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Modals & Chat
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInitialProduct, setChatInitialProduct] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // US Amazon Retail Categories
  const categories = [
    'All',
    'Cat Food & Pet Care',
    'Gym & Sports Nutrition',
    'Home & Kitchen Gadgets',
    'Tech & Smart Gadgets',
    'Home & Workstation',
  ];

  // Refresh products & auth on change
  const refreshState = () => {
    setProducts(store.getProducts());
    setIsProductsReady(store.areProductsReady());
    const auth = store.getAdminAuth();
    setIsAdminLoggedIn(auth.isAuthenticated);
  };

  useEffect(() => {
    refreshState();
    pixelService.initialize();
    const unsub = store.subscribe(refreshState);
    void store.verifyAdminSession().catch((error: unknown) => {
      console.error('Could not verify the admin session', error);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const query = getSearchQueryFromLocation();
      setActiveSearchQuery(query);
      setSearchQuery(query ?? '');
      setSelectedProduct(null);
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const socialSettings = store.getSocialSettings();
  const socialHubLinks = [
    ...(socialSettings.visibleChannels.includes('whatsapp')
      ? [{
          id: 'whatsapp',
          label: 'WhatsApp',
          description: 'Direct Chat',
          url: store.getSocialUrl('whatsapp'),
          platform: 'whatsapp' as const,
        }]
      : []),
    ...(socialSettings.visibleChannels.includes('instagram')
      ? [{
          id: 'instagram',
          label: 'Instagram',
          description: 'Direct DM',
          url: store.getSocialUrl('instagram'),
          platform: 'instagram' as const,
        }]
      : []),
    ...(socialSettings.visibleChannels.includes('facebook')
      ? [{
          id: 'facebook',
          label: 'Messenger',
          description: 'Facebook Page',
          url: store.getSocialUrl('facebook'),
          platform: 'facebook' as const,
        }]
      : []),
    ...(socialSettings.visibleChannels.includes('tiktok')
      ? [{
          id: 'tiktok',
          label: 'TikTok',
          description: 'Videos & Chat',
          url: store.getSocialUrl('tiktok'),
          platform: 'tiktok' as const,
        }]
      : []),
    ...(socialSettings.visibleChannels.includes('twitter')
      ? [{
          id: 'twitter',
          label: 'Twitter / X',
          description: 'Instant DMs',
          url: store.getSocialUrl('twitter'),
          platform: 'twitter' as const,
        }]
      : []),
    ...socialSettings.customLinks
      .filter((link) => link.enabled)
      .map((link) => ({
        id: link.id,
        label: link.label,
        description: 'Visit our profile',
        url: link.url,
        platform: getSocialPlatform(link.id, link.label, link.url),
      })),
  ];

  const productRouteSlug = getProductRouteSlug(window.location.pathname);
  const routeProduct = productRouteSlug ? findProductByRouteSlug(products, productRouteSlug) : undefined;
  const isProductPage = productRouteSlug !== null;

  useEffect(() => {
    const origin = window.location.origin;
    const pageUrl = new URL(window.location.pathname, origin).href;
    let title = 'Kefayaan | Curated Amazon US Product Deals & Reviews';
    let description = 'Discover curated Amazon US products, verified deals, detailed product information, and affiliate links from Kefayaan.';
    let image = '/assets/aistudio/DP_af5fa802.png';
    let robots = 'index,follow';
    let structuredData: Record<string, unknown> | null = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Kefayaan',
      url: `${origin}/`,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${origin}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    };

    if (isProductPage) {
      robots = routeProduct ? 'index,follow' : 'noindex,follow';
      title = routeProduct ? `${routeProduct.title} | Kefayaan` : 'Product | Kefayaan';
      description = routeProduct?.description?.trim().slice(0, 300) ||
        (routeProduct ? `Explore ${routeProduct.title}, including product details, pricing, images, and buying options on Kefayaan.` : 'Loading product details on Kefayaan.');
      image = routeProduct?.image || '';
      structuredData = routeProduct ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: routeProduct.title,
        description,
        image: [routeProduct.image, ...(routeProduct.gallery || [])]
          .filter(Boolean)
          .map((url) => new URL(url, origin).href),
        sku: routeProduct.id,
        brand: { '@type': 'Brand', name: routeProduct.brand },
        category: routeProduct.category,
        ...(routeProduct.rating > 0 && routeProduct.reviewCount > 0
          ? {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: routeProduct.rating,
                reviewCount: routeProduct.reviewCount,
              },
            }
          : {}),
        offers: {
          '@type': 'Offer',
          url: pageUrl,
          priceCurrency: 'USD',
          price: routeProduct.dealPrice,
          availability: routeProduct.inStock
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
        },
      } : null;
    } else if (activeSearchQuery !== null) {
      title = `Search results for ${activeSearchQuery || 'products'} | Kefayaan`;
      description = activeSearchQuery
        ? `Products matching "${activeSearchQuery}" in the Kefayaan Amazon US storefront.`
        : 'Search curated Amazon US products in the Kefayaan storefront.';
      robots = 'noindex,follow';
      structuredData = null;
    }

    document.title = title;
    setMetaContent('meta[name="description"]', 'name', 'description', description);
    setMetaContent('meta[name="robots"]', 'name', 'robots', robots);
    setMetaContent('meta[property="og:title"]', 'property', 'og:title', title);
    setMetaContent('meta[property="og:description"]', 'property', 'og:description', description);
    setMetaContent('meta[property="og:type"]', 'property', 'og:type', routeProduct ? 'product' : 'website');
    setMetaContent('meta[property="og:url"]', 'property', 'og:url', pageUrl);
    setMetaContent('meta[property="og:image"]', 'property', 'og:image', image ? new URL(image, origin).href : '');
    setMetaContent('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    setMetaContent('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    setMetaContent('meta[name="twitter:image"]', 'name', 'twitter:image', image ? new URL(image, origin).href : '');
    setCanonicalUrl(pageUrl);

    let script = document.getElementById('page-structured-data');
    if (structuredData) {
      if (!script) {
        script = document.createElement('script');
        script.id = 'page-structured-data';
        script.setAttribute('type', 'application/ld+json');
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    } else {
      script?.remove();
    }
  }, [activeSearchQuery, isProductPage, routeProduct]);

  const handleSearchSubmit = (value: string) => {
    const query = value.trim();
    if (!query) {
      handleClearSearch();
      return;
    }

    window.history.pushState({}, '', `/search?q=${encodeURIComponent(query)}`);
    setSelectedProduct(null);
    setSearchQuery(query);
    setActiveSearchQuery(query);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearSearch = () => {
    if (activeSearchQuery !== null) {
      window.history.pushState({}, '', '/');
      setActiveSearchQuery(null);
    }
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoHome = () => {
    if (window.location.pathname !== '/' || window.location.search) {
      window.location.assign('/');
      return;
    }
    setSelectedProduct(null);
    setActiveSearchQuery(null);
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesCategory = Boolean(searchQuery.trim()) || selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = !searchQuery.trim() || matchesProductQuery(p, searchQuery);
    return matchesCategory && matchesSearch;
  });
  const liveSearchResults = searchQuery.trim()
    ? products.filter((product) => matchesProductQuery(product, searchQuery))
    : [];
  const committedSearchResults = activeSearchQuery === null
    ? []
    : products.filter((product) => matchesProductQuery(product, activeSearchQuery));

  // Dedicated Video Reviews list
  const videoReviewProducts = products.filter((p) => p.videoType !== 'none' && p.videoUrl);

  // Show Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Direct Buy Now Interceptor with Outbound Tracking and Ad Pixel Conversions
  const handleBuyNow = (
    product: Product,
    eOrUrl?: React.MouseEvent | string,
    variantUrl?: string
  ) => {
    let finalUrl: string | undefined = variantUrl;
    if (eOrUrl) {
      if (typeof eOrUrl === 'string') {
        finalUrl = eOrUrl;
      } else if (typeof (eOrUrl as React.MouseEvent).stopPropagation === 'function') {
        (eOrUrl as React.MouseEvent).stopPropagation();
      }
    }

    const targetUrl = finalUrl || product.amazonUrl || store.getStoreSettings().amazonOfficialStoreUrl;

    // 1. Log click in store for analytics & product counter
    store.trackAmazonClick(product.id, targetUrl);

    // 2. Fire Ad Pixels (Meta, TikTok, Google Tag) - Treats Buy Now as Purchase / Order
    pixelService.trackBuyNow(product, targetUrl);

    // 3. Display non-intrusive redirection toast
    showToast(`Redirecting to official Amazon deal for "${product.title}"...`);

    // 4. Open Amazon URL in new tab safely
    window.open(targetUrl, '_blank', 'noopener,noreferrer,nofollow');
  };

  const handleSelectProduct = (product: Product) => {
    const currentPath = `${window.location.pathname}${window.location.search}`;
    if (window.location.pathname !== getProductPath(product)) {
      window.history.pushState({ previousPath: currentPath }, '', getProductPath(product));
    }
    setActiveSearchQuery(null);
    setSearchQuery('');
    setSelectedProduct(product);
    pixelService.trackViewContent(product);
  };

  const handleCloseProductPage = () => {
    const previousPath = window.history.state?.previousPath;
    if (typeof previousPath === 'string' && previousPath.startsWith('/')) {
      window.history.back();
      return;
    }
    handleGoHome();
  };

  const handleOpenChatWithProduct = (product: Product) => {
    setChatInitialProduct(product);
    setIsChatOpen(true);
  };

  const handleScrollTo = (id: string) => {
    const scrollToSection = () => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    if (isProductPage) {
      handleGoHome();
      window.setTimeout(scrollToSection, 0);
      return;
    }
    if (activeSearchQuery !== null) {
      window.history.pushState({}, '', '/');
      setActiveSearchQuery(null);
      setSearchQuery('');
      window.setTimeout(scrollToSection, 0);
      return;
    }
    scrollToSection();
  };

  // If in Admin View and logged in
  if (currentView === 'admin' && isAdminLoggedIn) {
    return (
      <AdminLayout
        onBackToStore={() => setCurrentView('storefront')}
        onLogout={() => {
          void store.logoutAdmin()
            .then(() => setCurrentView('storefront'))
            .catch((error: unknown) => {
              window.alert(error instanceof Error ? error.message : 'Could not log out. Please try again.');
            });
        }}
      />
    );
  }

  // Key Pillars for US Trending Spotlight
  const catFoodProduct = products.find((p) => p.id === 'prod-cat-food');
  const gymProteinProduct = products.find((p) => p.id === 'prod-gym-protein');
  const kitchenProduct = products.find((p) => p.id === 'prod-kitchen-airfryer');

  if (isProductPage) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        {toastMessage && (
          <div className="fixed top-20 right-6 z-50 bg-slate-950 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-800 text-xs flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}
        <Navbar
          isAdminLoggedIn={isAdminLoggedIn}
          onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
          onGoToAdmin={() => setCurrentView('admin')}
          onOpenSocialHub={() => setIsChatOpen(true)}
          onGoHome={handleGoHome}
          onScrollToSection={handleScrollTo}
        />
        <ProductSearchBar
          query={searchQuery}
          results={liveSearchResults}
          onQueryChange={setSearchQuery}
          onClear={handleClearSearch}
          onSubmit={handleSearchSubmit}
          onSelectProduct={handleSelectProduct}
          isSearchPage={activeSearchQuery !== null}
        />
        {routeProduct ? (
          <ProductDetailModal
            product={routeProduct}
            isPage
            onClose={handleCloseProductPage}
            onBuyNow={(prod, customUrl) => handleBuyNow(prod, undefined, customUrl)}
            onOpenChatWithProduct={handleOpenChatWithProduct}
          />
        ) : (
          <main className="flex-1 flex items-center justify-center px-6 py-20 text-center">
            {!isProductsReady ? (
              <p role="status" className="text-sm font-medium text-slate-500">Loading product details...</p>
            ) : (
              <div className="max-w-md">
                <h1 className="text-2xl font-bold text-slate-900">Product not found</h1>
                <p className="mt-2 text-sm text-slate-600">This product may have been removed or its link may be incorrect.</p>
                <button type="button" onClick={handleGoHome} className="mt-5 rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-amber-500">
                  Browse all products
                </button>
              </div>
            )}
          </main>
        )}
        <footer className="border-t border-slate-200 bg-white px-4 py-5 text-center text-xs text-slate-500">
          Kefayaan participates in the Amazon Associates program and may earn from qualifying purchases.
        </footer>
        <ChatWidget
          isOpen={isChatOpen}
          onToggle={() => setIsChatOpen(!isChatOpen)}
          initialProduct={chatInitialProduct}
          onClearInitialProduct={() => setChatInitialProduct(null)}
        />
        <AdminLoginModal
          isOpen={isAdminLoginModalOpen}
          onClose={() => setIsAdminLoginModalOpen(false)}
          onSuccess={() => {
            setIsAdminLoggedIn(true);
            setCurrentView('admin');
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-950 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-800 text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <ExternalLink className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar Navigation */}
      <Navbar
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
        onGoToAdmin={() => setCurrentView('admin')}
        onOpenSocialHub={() => setIsChatOpen(true)}
        onGoHome={handleGoHome}
        onScrollToSection={handleScrollTo}
      />

      {activeSearchQuery === null && socialHubLinks.length > 0 && (
        <nav aria-label="Our social media" className="border-b border-slate-200 bg-white px-3 py-2 sm:px-6">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-2 sm:gap-3">
            {socialHubLinks.map((link) => (
              <a
                key={`top-${link.id}`}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit our ${link.label} profile`}
                title={link.label}
                className="inline-flex min-w-0 items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-amber-400 hover:bg-amber-50 sm:gap-2 sm:px-3"
              >
                <SocialPlatformIcon platform={link.platform} className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                <span className="max-w-24 truncate sm:max-w-none">{link.label}</span>
              </a>
            ))}
          </div>
        </nav>
      )}

      <ProductSearchBar
        query={searchQuery}
        results={liveSearchResults}
        onQueryChange={setSearchQuery}
        onClear={handleClearSearch}
        onSubmit={handleSearchSubmit}
        onSelectProduct={handleSelectProduct}
        isSearchPage={activeSearchQuery !== null}
      />

      {/* Hero Section */}
      {activeSearchQuery === null && (
        <Hero
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          categories={categories}
          trendingProduct={products[0]}
          onBuyFeatured={handleBuyNow}
          onOpenFeaturedVideo={(prod) => {
            const target = prod || products[0];
            if (target) setSelectedProduct(target);
          }}
        />
      )}

      {/* Main Content Body */}
      {activeSearchQuery !== null ? (
        <main className="flex-1 min-w-0 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12">
          <section aria-labelledby="search-results-title" className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to store
                </button>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Product search</p>
                <h1 id="search-results-title" className="mt-1 break-words text-2xl font-extrabold text-slate-950 sm:text-3xl">
                  Results for “{activeSearchQuery || ' '}”
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                  {committedSearchResults.length} exact text match{committedSearchResults.length === 1 ? '' : 'es'} in product name, brand, or category.
                </p>
              </div>
            </div>

            {committedSearchResults.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
                {committedSearchResults.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={handleSelectProduct}
                    onBuyNow={handleBuyNow}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-3 rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center">
                <p className="text-base font-bold text-slate-800">
                  {activeSearchQuery ? `No exact matches found for “${activeSearchQuery}”.` : 'Enter a product name to search.'}
                </p>
                <p className="text-sm text-slate-500">
                  Search matches the exact text you type in product names, brands, and categories—no fuzzy results.
                </p>
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="mt-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  Browse all products
                </button>
              </div>
            )}
          </section>
        </main>
      ) : (
      <main className="flex-1 min-w-0 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 sm:space-y-20">
        
        {/* Section 1: US Flagship Trending Department Pillars (Cat Food, Gym Food, Smart Gadgets) */}
        <section id="departments" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-600">
                <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span>America's #1 Trending Retail Pillars</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                Top Rated by 100,000+ US Amazon Shoppers
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              Independent Austin & Seattle Lab Tests
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pillar 1: Cat Food / Pet Nutrition */}
            {catFoodProduct && (
              <div
                onClick={() => setSelectedProduct(catFoodProduct)}
                className="group relative bg-white border border-slate-200 rounded-3xl p-5 hover:border-amber-400 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-md">
                      🐱 #1 Pet Food Bestseller
                    </span>
                    <div className="flex items-center gap-1 text-slate-900 font-bold text-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{catFoodProduct.rating}</span>
                      <span className="text-slate-400 font-normal">({catFoodProduct.reviewCount.toLocaleString()})</span>
                    </div>
                  </div>

                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100">
                    <img
                      src={catFoodProduct.image}
                      alt={catFoodProduct.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-slate-950/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      Grain-Free Wild Salmon
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-xs font-bold uppercase text-slate-400">{catFoodProduct.brand}</span>
                    <h3 className="text-base font-bold text-slate-950 group-hover:text-amber-600 transition-colors line-clamp-2 leading-snug">
                      {catFoodProduct.title}
                    </h3>
                  </div>

                  <ul className="space-y-1.5 text-xs text-slate-600 pt-1">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Real wild-caught Alaskan salmon</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Zero corn, wheat, soy or carrageenan</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-5 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-extrabold text-slate-950 font-mono tabular-nums">
                        {formatCurrency(catFoodProduct.dealPrice)}
                      </span>
                      <span className="text-xs text-slate-400 line-through font-mono ml-2">
                        {formatCurrency(catFoodProduct.price)}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600">Save 26% Today</span>
                  </div>

                  <button
                    onClick={(e) => handleBuyNow(catFoodProduct, e)}
                    className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Buy on Amazon (Prime)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Pillar 2: Gym & Sports Nutrition */}
            {gymProteinProduct && (
              <div
                onClick={() => setSelectedProduct(gymProteinProduct)}
                className="group relative bg-white border border-slate-200 rounded-3xl p-5 hover:border-amber-400 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-800 px-2.5 py-1 rounded-md">
                      🏋️ #1 Workout Supplement
                    </span>
                    <div className="flex items-center gap-1 text-slate-900 font-bold text-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{gymProteinProduct.rating}</span>
                      <span className="text-slate-400 font-normal">({gymProteinProduct.reviewCount.toLocaleString()})</span>
                    </div>
                  </div>

                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100">
                    <img
                      src={gymProteinProduct.image}
                      alt={gymProteinProduct.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-slate-950/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      24g Isolate · 5.5g BCAAs
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-xs font-bold uppercase text-slate-400">{gymProteinProduct.brand}</span>
                    <h3 className="text-base font-bold text-slate-950 group-hover:text-amber-600 transition-colors line-clamp-2 leading-snug">
                      {gymProteinProduct.title}
                    </h3>
                  </div>

                  <ul className="space-y-1.5 text-xs text-slate-600 pt-1">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Instantized micro-filtered powder</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Informed Choice banned-substance tested</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-5 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-extrabold text-slate-950 font-mono tabular-nums">
                        {formatCurrency(gymProteinProduct.dealPrice)}
                      </span>
                      <span className="text-xs text-slate-400 line-through font-mono ml-2">
                        {formatCurrency(gymProteinProduct.price)}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600">Save 20% Today</span>
                  </div>

                  <button
                    onClick={(e) => handleBuyNow(gymProteinProduct, e)}
                    className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Buy on Amazon (Prime)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Pillar 3: Kitchen & Home Gadgets */}
            {kitchenProduct && (
              <div
                onClick={() => setSelectedProduct(kitchenProduct)}
                className="group relative bg-white border border-slate-200 rounded-3xl p-5 hover:border-amber-400 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider bg-orange-50 text-orange-800 px-2.5 py-1 rounded-md">
                      🍳 #1 Smart Kitchen Tech
                    </span>
                    <div className="flex items-center gap-1 text-slate-900 font-bold text-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{kitchenProduct.rating}</span>
                      <span className="text-slate-400 font-normal">({kitchenProduct.reviewCount.toLocaleString()})</span>
                    </div>
                  </div>

                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100">
                    <img
                      src={kitchenProduct.image}
                      alt={kitchenProduct.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-slate-950/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      Dual 5-Qt Baskets · Match Cook
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-xs font-bold uppercase text-slate-400">{kitchenProduct.brand}</span>
                    <h3 className="text-base font-bold text-slate-950 group-hover:text-amber-600 transition-colors line-clamp-2 leading-snug">
                      {kitchenProduct.title}
                    </h3>
                  </div>

                  <ul className="space-y-1.5 text-xs text-slate-600 pt-1">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Cook 2 foods 2 ways, finish together</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Cuts up to 75% fat vs deep frying</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-5 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-extrabold text-slate-950 font-mono tabular-nums">
                        {formatCurrency(kitchenProduct.dealPrice)}
                      </span>
                      <span className="text-xs text-slate-400 line-through font-mono ml-2">
                        {formatCurrency(kitchenProduct.price)}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600">Save 22% Today</span>
                  </div>

                  <button
                    onClick={(e) => handleBuyNow(kitchenProduct, e)}
                    className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Buy on Amazon (Prime)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Section 2: Complete Curated Amazon US Bestsellers Grid */}
        <section id="deals" className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">
                Verified Benchmark Collection
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                All Curated Products & Direct Amazon US Deals
              </h2>
            </div>
            <div className="text-xs text-slate-500 font-mono">
              Showing {filteredProducts.length} verified products · 100% Prime Eligible
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
              <p className="text-base font-bold text-slate-700">No products found matching your search</p>
              <p className="text-xs text-slate-500">Try searching for "Cat Food", "Whey Protein", "Air Fryer", or "Monitor".</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Reset Department Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={handleSelectProduct}
                  onBuyNow={handleBuyNow}
                />
              ))}
            </div>
          )}
        </section>

        {/* Section 3: US Buyer's Comparison Matrix, Methodologies & FAQs */}
        <div id="comparison">
          <BuyerComparisonTable
            products={products}
            onSelectProduct={handleSelectProduct}
            onBuyNow={handleBuyNow}
          />
        </div>

        {/* Section 4: Video Lab Reviews Spotlight */}
        {videoReviewProducts.length > 0 && (
          <section id="video-reviews" className="space-y-5 pt-4 sm:space-y-6">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_minmax(220px,360px)] md:items-end md:gap-6">
              <div className="min-w-0">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">
                  Hands-On Video Testing Lab
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-950 tracking-tight leading-tight">
                  Watch Video Reviews Before You Buy on Amazon
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 md:justify-self-end">
                Acoustic noise tests, cat food taste & nutrition reviews, protein shake mixability tests, and dual-zone air frying demonstrations.
              </p>
            </div>

            <div className={`grid grid-cols-1 gap-4 sm:gap-6 ${
              videoReviewProducts.length === 1
                ? ''
                : videoReviewProducts.length === 2
                  ? 'md:grid-cols-2'
                  : 'md:grid-cols-2 xl:grid-cols-3'
            }`}>
              {videoReviewProducts.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectProduct(item)}
                  className={`group w-full bg-white rounded-2xl sm:rounded-3xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all cursor-pointer flex flex-col ${
                    videoReviewProducts.length === 1 ? 'mx-auto max-w-2xl' : ''
                  }`}
                >
                  <div className="relative aspect-video min-h-0 bg-slate-950 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-contain p-1 sm:p-2"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/20 transition-colors flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
                      </div>
                    </div>
                    <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-slate-950/80 text-[10px] font-mono text-white">
                      Full Lab Test
                    </span>
                  </div>

                  <div className="p-3.5 sm:p-5 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] sm:text-xs text-slate-500 font-semibold uppercase line-clamp-1">{item.brand} · {item.category}</div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 font-mono">
                        {formatCurrency(item.dealPrice)}
                      </span>
                      <span className="text-xs font-semibold text-amber-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        <span>Watch Review</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 5: OmniChannel Social Concierge & Customer Inquiries */}
        <section className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-12 border border-slate-800 space-y-6">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              OmniChannel US Concierge
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Have Questions About a Product or Deal? Ask Us Anywhere.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Message us through your preferred platform or contact us directly through the website live chat.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            <button
              onClick={() => setIsChatOpen(true)}
              className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold">Website Chat</span>
              <span className="text-[10px] text-slate-400">Live on page</span>
            </button>
            {socialHubLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex flex-col items-center justify-center text-center gap-2 transition-all"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
                  <SocialPlatformIcon platform={link.platform} className="h-6 w-6" />
                </div>
                <span className="text-xs font-bold">{link.label}</span>
                <span className="text-[10px] text-slate-400">{link.description}</span>
              </a>
            ))}
          </div>
        </section>
      </main>
      )}

      {/* Footer */}
      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-3 text-base font-extrabold text-slate-950">
                <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-900 border border-slate-700 shrink-0">
                  <img
                    src="/assets/aistudio/DP_af5fa802.png"
                    alt="Kefayaan"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">Kefayaan</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-500 max-w-lg">
                Kefayaan is an official Amazon Associate storefront curated with premium pet food, sports nutrition, smart home gadgets, and tech electronics with verified Amazon Prime delivery.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600">
              <a
                href={store.getStoreSettings().amazonOfficialStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => store.trackOfficialStoreClick()}
                className="font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
              >
                <span>Amazon Official Store</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => handleScrollTo('departments')}
                className="hover:text-slate-950 cursor-pointer"
              >
                Trending Departments
              </button>
              <button
                onClick={() => handleScrollTo('deals')}
                className="hover:text-slate-950 cursor-pointer"
              >
                Best Sellers
              </button>
              <button
                onClick={() => handleScrollTo('comparison')}
                className="hover:text-slate-950 cursor-pointer"
              >
                Comparison Matrix
              </button>
              <button
                onClick={() => handleScrollTo('video-reviews')}
                className="hover:text-slate-950 cursor-pointer"
              >
                Video Lab
              </button>
              {isAdminLoggedIn ? (
                <button
                  onClick={() => setCurrentView('admin')}
                  className="font-bold text-slate-900 hover:text-amber-600 cursor-pointer"
                >
                  Admin Panel
                </button>
              ) : (
                <button
                  onClick={() => setIsAdminLoginModalOpen(true)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  Admin Login
                </button>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
            <p>
              © {new Date().getFullYear()} Kefayaan. Amazon Associate Partner. Fully compliant with Vercel SPA deployment.
            </p>
            <p className="text-center sm:text-right max-w-md">
              FTC Disclosure: Kefayaan is an Amazon Associate. We earn from qualifying purchases with zero price markup to you. Amazon and Amazon Prime are registered trademarks of Amazon.com, Inc.
            </p>
          </div>
        </div>
      </footer>

      {/* Product Detail & Video Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={handleCloseProductPage}
        onBuyNow={(prod, customUrl) => handleBuyNow(prod, undefined, customUrl)}
        onOpenChatWithProduct={handleOpenChatWithProduct}
      />


      {/* OmniChannel Customer Chat Widget */}
      <ChatWidget
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
        initialProduct={chatInitialProduct}
        onClearInitialProduct={() => setChatInitialProduct(null)}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        onSuccess={() => {
          setIsAdminLoggedIn(true);
          setCurrentView('admin');
        }}
      />
    </div>
  );
}
