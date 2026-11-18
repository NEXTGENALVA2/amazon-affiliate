import React, { useState, useEffect } from 'react';
import { Lock, Menu, X, BarChart3, ExternalLink } from 'lucide-react';
import { store } from '../services/store';
import { CatalogView, StoreSettings } from '../types';

interface NavbarProps {
  isAdminLoggedIn: boolean;
  onOpenAdminLogin: () => void;
  onGoToAdmin: () => void;
  onOpenSocialHub: () => void;
  onGoHome: () => void;
  onScrollToSection: (sectionId: string) => void;
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  selectedCollection: CatalogView;
  onSelectCollection: (collection: CatalogView) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isAdminLoggedIn,
  onOpenAdminLogin,
  onGoToAdmin,
  onOpenSocialHub,
  onGoHome,
  onScrollToSection,
  categories,
  selectedCategory,
  onSelectCategory,
  selectedCollection,
  onSelectCollection,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(store.getStoreSettings());

  useEffect(() => {
    const refresh = () => setStoreSettings(store.getStoreSettings());
    const unsub = store.subscribe(refresh);
    return unsub;
  }, []);

  const handleOfficialStoreClick = () => {
    store.trackOfficialStoreClick();
  };

  const handleNavClick = (sectionId: string) => {
    onScrollToSection(sectionId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-6 px-3 sm:px-6 lg:px-8 h-16 sm:h-18">
        {/* Zone 1: Kefayaan Brand with Official Logo */}
        <a
          href="/"
          onClick={(e) => {
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            e.preventDefault();
            onGoHome();
            setMobileMenuOpen(false);
          }}
          aria-label={`${storeSettings.shopName} home`}
          className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3 group xl:flex-none"
        >
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden bg-slate-900 border border-slate-700 shadow-xs group-hover:border-amber-400 transition-colors shrink-0">
            <img
              src={storeSettings.logoUrl || '/assets/aistudio/DP_af5fa802.png'}
              alt={storeSettings.shopName}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-xl font-extrabold tracking-tight text-slate-950 group-hover:text-amber-600 transition-colors truncate">
                {storeSettings.shopName}
              </span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-slate-500 font-medium tracking-wide uppercase truncate">
              Curated product picks
            </p>
          </div>
        </a>

        {/* Zone 2: Navigation Links (Desktop & Wide Tablet) */}
        <nav className="hidden xl:flex items-center gap-5 text-sm font-medium text-slate-600">
          <button
            onClick={() => {
              onSelectCollection('best-sellers');
              onScrollToSection('deals');
            }}
            className="hover:text-slate-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Best Sellers
          </button>
          <button
            onClick={() => onScrollToSection('departments')}
            className="hover:text-slate-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Categories
          </button>
          <button
            onClick={() => onScrollToSection('comparison')}
            className="hover:text-slate-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Comparison Matrix
          </button>
          <button
            onClick={() => onScrollToSection('video-reviews')}
            className="hover:text-slate-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Video Lab
          </button>
          <a href="/blog" className="hover:text-slate-950 transition-colors whitespace-nowrap shrink-0">
            Buying Guides
          </a>
          <button
            onClick={onOpenSocialHub}
            className="hover:text-slate-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Social Media
          </button>
        </nav>

        {/* Zone 3: Retailer Button + Admin + Mobile Hamburger */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <a
            href={storeSettings.amazonOfficialStoreUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            onClick={handleOfficialStoreClick}
            className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-xs transition-all hover:scale-102 cursor-pointer border border-amber-500/80 shrink-0"
            title={`Browse products at ${storeSettings.retailerName}`}
          >
            <span className="hidden sm:inline">Shop at {storeSettings.retailerName}</span>
            <span className="sm:hidden font-bold">Shop {storeSettings.retailerName}</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-950 shrink-0" />
          </a>

          {isAdminLoggedIn ? (
            <button
              onClick={onGoToAdmin}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-slate-950 rounded-xl hover:bg-slate-800 transition-all shadow-xs whitespace-nowrap shrink-0 cursor-pointer"
            >
              <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Dashboard</span>
            </button>
          ) : (
            <button
              onClick={onOpenAdminLogin}
              className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              title="Admin Login"
            >
              <Lock className="w-3 h-3 text-slate-500" />
              <span className="hidden md:inline">Admin</span>
            </button>
          )}

          {/* Mobile menu toggle button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-xl focus:outline-none cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay & Dropdown Menu */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="xl:hidden fixed inset-0 top-[64px] z-30 bg-slate-950/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="xl:hidden relative z-40 border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-150">
            <a
              href={storeSettings.amazonOfficialStoreUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              onClick={() => {
                handleOfficialStoreClick();
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-between p-3.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs shadow-xs"
            >
              <span>Browse products at {storeSettings.retailerName}</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            <div className="space-y-1 pt-1">
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Categories</p>
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  aria-pressed={selectedCategory.toLowerCase() === category.toLowerCase()}
                  onClick={() => {
                    onSelectCategory(category);
                    handleNavClick('deals');
                  }}
                  className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
                    selectedCategory.toLowerCase() === category.toLowerCase()
                      ? 'bg-slate-950 text-white'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'
                  }`}
                >
                  {category === 'All' ? 'All categories' : category}
                </button>
              ))}
              <p className="px-3 pt-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Collections</p>
              {([
                ['best-sellers', 'Best Sellers'],
                ['all-products', 'All Products'],
                ['new-arrivals', 'New Arrivals'],
              ] as const).map(([collection, label]) => (
                <button
                  key={collection}
                  type="button"
                  aria-pressed={selectedCollection === collection}
                  onClick={() => {
                    onSelectCollection(collection);
                    handleNavClick('deals');
                  }}
                  className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
                    selectedCollection === collection
                      ? 'bg-slate-950 text-white'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'
                  }`}
                >
                  {label}
                </button>
              ))}
              <div className="my-2 border-t border-slate-100" />
              <button
                onClick={() => handleNavClick('comparison')}
                className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-950 transition-colors"
              >
                📊 Comparison Matrix
              </button>
              <button
                onClick={() => handleNavClick('video-reviews')}
                className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-950 transition-colors"
              >
                🎥 Video Lab Reviews
              </button>
              <a
                href="/blog"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full py-2.5 px-3 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-950 transition-colors"
              >
                Buying Guides
              </a>
              <button
                onClick={() => {
                  onOpenSocialHub();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-950 transition-colors"
              >
                Social Media
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100">
              {isAdminLoggedIn ? (
                <button
                  onClick={() => {
                    onGoToAdmin();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-3 px-3 text-center text-xs font-bold text-white bg-slate-950 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Go to Admin Dashboard
                </button>
              ) : (
                <button
                  onClick={() => {
                    onOpenAdminLogin();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-3 px-3 text-center text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Admin Login
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
};
