import React, { useState, useEffect } from 'react';
import {
  ExternalLink,
  ShieldCheck,
  Video,
  Play,
  Sparkles,
  ArrowRight,
  MessageCircle,
  Instagram,
  Facebook,
  Twitter,
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
import { store } from './services/store';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ChatWidget } from './components/ChatWidget';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminLayout } from './components/admin/AdminLayout';
import { BuyerComparisonTable } from './components/BuyerComparisonTable';
import { formatCurrency } from './utils/helpers';
import { pixelService } from './services/pixelService';

export default function App() {
  const [currentView, setCurrentView] = useState<'storefront' | 'admin'>('storefront');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);

  // Store data
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
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
    const auth = store.getAdminAuth();
    setIsAdminLoggedIn(auth.isAuthenticated);
  };

  useEffect(() => {
    refreshState();
    pixelService.initialize();
    const unsub = store.subscribe(refreshState);
    return unsub;
  }, []);

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
    setSelectedProduct(product);
    pixelService.trackViewContent(product);
  };

  const handleOpenChatWithProduct = (product: Product) => {
    setChatInitialProduct(product);
    setIsChatOpen(true);
  };

  const handleScrollTo = (id: string) => {
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // If in Admin View and logged in
  if (currentView === 'admin' && isAdminLoggedIn) {
    return (
      <AdminLayout
        onBackToStore={() => setCurrentView('storefront')}
        onLogout={() => {
          store.logoutAdmin();
          setCurrentView('storefront');
        }}
      />
    );
  }

  // Key Pillars for US Trending Spotlight
  const catFoodProduct = products.find((p) => p.id === 'prod-cat-food');
  const gymProteinProduct = products.find((p) => p.id === 'prod-gym-protein');
  const kitchenProduct = products.find((p) => p.id === 'prod-kitchen-airfryer');

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
        onScrollToSection={handleScrollTo}
      />

      {/* Hero Section */}
      <Hero
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
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

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">
        
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
          <section id="video-reviews" className="space-y-6 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">
                  Hands-On Video Testing Lab
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                  Watch Video Reviews Before You Buy on Amazon
                </h2>
              </div>
              <p className="text-xs text-slate-500 max-w-sm">
                Acoustic noise tests, cat food taste & nutrition reviews, protein shake mixability tests, and dual-zone air frying demonstrations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videoReviewProducts.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectProduct(item)}
                  className="group bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all cursor-pointer flex flex-col"
                >
                  <div className="relative aspect-video bg-slate-900 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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

                  <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-xs text-slate-500 font-semibold uppercase">{item.brand} · {item.category}</div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-1">
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
        <section className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 space-y-6">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              OmniChannel US Concierge
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Have Questions About a Product or Deal? Ask Us Anywhere.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Knock on our <strong>WhatsApp</strong>, <strong>Facebook Page</strong>, <strong>Instagram</strong>, or message directly on the website live chat. All inquiries synchronize directly to our admin team in real time!
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
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

            <a
              href={store.getSocialUrl('whatsapp')}
              target="_blank"
              rel="noreferrer"
              className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex flex-col items-center justify-center text-center gap-2 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold">WhatsApp</span>
              <span className="text-[10px] text-slate-400">Direct Chat</span>
            </a>

            <a
              href={store.getSocialUrl('instagram')}
              target="_blank"
              rel="noreferrer"
              className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex flex-col items-center justify-center text-center gap-2 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
                <Instagram className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold">Instagram</span>
              <span className="text-[10px] text-slate-400">Direct DM</span>
            </a>

            <a
              href={store.getSocialUrl('facebook')}
              target="_blank"
              rel="noreferrer"
              className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex flex-col items-center justify-center text-center gap-2 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Facebook className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold">Messenger</span>
              <span className="text-[10px] text-slate-400">Facebook Page</span>
            </a>

            <a
              href={store.getSocialUrl('tiktok')}
              target="_blank"
              rel="noreferrer"
              className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex flex-col items-center justify-center text-center gap-2 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-700 text-white flex items-center justify-center">
                <Video className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold">TikTok</span>
              <span className="text-[10px] text-slate-400">Videos & Chat</span>
            </a>

            <a
              href={store.getSocialUrl('twitter')}
              target="_blank"
              rel="noreferrer"
              className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex flex-col items-center justify-center text-center gap-2 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                <Twitter className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold">Twitter / X</span>
              <span className="text-[10px] text-slate-400">Instant DMs</span>
            </a>
          </div>
        </section>
      </main>

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
                    <span className="text-xs text-slate-400 font-serif" dir="rtl">کفایان</span>
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
              © {new Date().getFullYear()} Kefayaan (کفایান). Amazon Associate Partner. Fully compliant with Vercel SPA deployment.
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
        onClose={() => setSelectedProduct(null)}
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
