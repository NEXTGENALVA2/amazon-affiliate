import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, ExternalLink, Star, Play, CheckCircle2, MessageCircle, ShieldCheck, Truck, ChevronLeft, ChevronRight, Images, ArrowLeft, Share2, Check } from 'lucide-react';
import { Product } from '../types';
import { formatCurrency, getYouTubeEmbedUrl } from '../utils/helpers';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onBuyNow: (product: Product, customUrl?: string) => void;
  onOpenChatWithProduct: (product: Product) => void;
  isPage?: boolean;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onBuyNow,
  onOpenChatWithProduct,
  isPage = false,
}) => {
  const hasVariants = Boolean(product?.variants?.length);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState<number>(0);
  const activeVariant = hasVariants ? product?.variants?.[selectedVariantIdx] : null;
  const currentPrice = activeVariant?.price !== undefined ? activeVariant.price : product?.price ?? 0;
  const currentDealPrice = activeVariant?.dealPrice !== undefined ? activeVariant.dealPrice : product?.dealPrice ?? 0;
  const currentAmazonUrl = activeVariant?.amazonUrl || product?.amazonUrl || '';

  const allImages = useMemo(() => {
    if (!product) return [];
    const variantImages = activeVariant
      ? [activeVariant.image, ...(activeVariant.gallery || [])].filter((img): img is string => Boolean(img))
      : [];
    if (variantImages.length) return [...new Set(variantImages.filter(Boolean))].slice(0, 20);

    return [...new Set([product.image, ...(Array.isArray(product.gallery) ? product.gallery : [])].filter(Boolean))].slice(0, 20);
  }, [activeVariant, product]);

  const [activeMedia, setActiveMedia] = useState<'image' | 'video'>('image');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [shareCopied, setShareCopied] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setSelectedVariantIdx(0);
    setActiveImageIndex(0);
    setActiveMedia(product?.videoType !== 'none' && Boolean(product?.videoUrl) ? 'video' : 'image');
  }, [product?.id]);

  if (!product) return null;

  const discountPercent =
    currentPrice > currentDealPrice
      ? Math.round(((currentPrice - currentDealPrice) / currentPrice) * 100)
      : 0;

  const youtubeEmbedUrl = product.videoUrl ? getYouTubeEmbedUrl(product.videoUrl) : null;
  const isDirectVideo = product.videoType === 'direct' || (!youtubeEmbedUrl && product.videoUrl?.includes('.mp4'));

  const handleNextPhoto = () => {
    setActiveMedia('image');
    setActiveImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const handlePrevPhoto = () => {
    setActiveMedia('image');
    setActiveImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const selectedImage = allImages[activeImageIndex] || product.image;
  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: product.title, text: product.description, url });
        return;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 2500);
    } catch {
      window.prompt('Copy this product link to share it:', url);
    }
  };

  const handleGalleryTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || allImages.length < 2) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    if (Math.abs(deltaX) < 40 || Math.abs(deltaX) < Math.abs(deltaY)) return;
    if (deltaX < 0) handleNextPhoto();
    else handlePrevPhoto();
  };


  return (
    <div className={isPage ? 'w-full flex-1 bg-slate-50 px-3 py-5 sm:px-6 sm:py-8' : 'fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm overflow-y-auto p-0 sm:p-4 md:p-6'}>
      <div className={isPage ? 'relative w-full max-w-6xl mx-auto bg-white rounded-2xl md:rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col' : 'relative w-full max-w-4xl bg-white rounded-none sm:rounded-2xl md:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto h-[100dvh] sm:h-auto max-h-[100dvh] sm:max-h-[92vh] flex flex-col'}>
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 bg-slate-50/70 gap-2 shrink-0">
          {isPage && (
            <button type="button" onClick={onClose} aria-label="Back to products" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-950">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to products</span>
            </button>
          )}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs min-w-0">
            <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-900 font-bold uppercase tracking-wider text-[10px] truncate max-w-[140px] sm:max-w-none">
              {product.category}
            </span>
            <span className="text-slate-300">·</span>
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] truncate max-w-[120px] sm:max-w-none">{product.brand}</span>
            {product.badge && (
              <>
                <span className="text-slate-300 hidden xs:inline">·</span>
                <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-bold text-[10px] hidden xs:inline">
                  {product.badge}
                </span>
              </>
            )}
          </div>
          {isPage ? (
            <button type="button" onClick={handleShare} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 shrink-0" aria-label="Share product link">
              {shareCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              <span>{shareCopied ? 'Link copied' : 'Share'}</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className={isPage ? 'grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 p-3 sm:p-6' : 'grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 p-3 sm:p-6 overflow-y-auto'}>
          {/* Left Column: Media Player (Images & Video Gallery) */}
          <div className="order-2 space-y-3 md:order-none md:col-span-7">
            {/* Main Stage */}
            <div
              className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center p-2 sm:p-4 touch-pan-y"
              onTouchStart={(e) => {
                const touch = e.touches[0];
                touchStart.current = { x: touch.clientX, y: touch.clientY };
              }}
              onTouchEnd={handleGalleryTouchEnd}
            >
              {activeMedia === 'video' && product.videoUrl ? (
                youtubeEmbedUrl ? (
                  <iframe
                    src={`${youtubeEmbedUrl}?autoplay=1&modestbranding=1&rel=0`}
                    title={`Video review for ${product.title}`}
                    className="w-full h-full border-0 rounded-lg bg-black"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : isDirectVideo ? (
                  <video
                    src={product.videoUrl}
                    controls
                    autoPlay
                    className="w-full h-full object-contain rounded-lg bg-black"
                  />
                ) : (
                  <div className="p-6 text-center text-slate-900">
                    <p className="text-sm">Video format not recognized. You can view the review on YouTube directly.</p>
                    <a
                      href={product.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 text-slate-950 text-xs font-semibold rounded-lg"
                    >
                      Open Video Link
                    </a>
                  </div>
                )
              ) : (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={selectedImage}
                    alt={product.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain transition-all duration-300"
                  />

                  {/* Navigation Arrows if more than 1 image */}
                  {allImages.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={handlePrevPhoto}
                        aria-label="Previous product image"
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md border border-slate-200 transition-colors"
                        title="Previous photo"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleNextPhoto}
                        aria-label="Next product image"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md border border-slate-200 transition-colors"
                        title="Next photo"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 right-2 px-2.5 py-1 bg-slate-950/80 backdrop-blur-xs text-white text-[11px] font-mono font-medium rounded-md">
                        Photo {activeImageIndex + 1} / {allImages.length}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Media Switcher Thumbnails - Supports up to 20 Photos */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 px-0.5">
                <span className="font-semibold flex items-center gap-1">
                  <Images className="w-3.5 h-3.5 text-amber-500" />
                  Gallery ({allImages.length} {allImages.length === 1 ? 'photo' : 'photos'})
                </span>
                <span className="text-[11px] text-slate-400">Click any image to enlarge</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin">
                {allImages.map((imgUrl, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setActiveMedia('image');
                      setActiveImageIndex(i);
                    }}
                    className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 bg-white p-1 transition-all ${
                      activeMedia === 'image' && activeImageIndex === i
                        ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                        : 'border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-400'
                    }`}
                  >
                    <img src={imgUrl} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-contain" />
                  </button>
                ))}

                {/* Video Button */}
                {product.videoUrl && (
                  <button
                    onClick={() => setActiveMedia('video')}
                    className={`flex items-center justify-center gap-1.5 w-24 h-14 rounded-lg bg-slate-900 text-white text-xs font-semibold shrink-0 border-2 transition-all ${
                      activeMedia === 'video'
                        ? 'border-amber-400 ring-2 ring-amber-400/20 text-amber-400'
                        : 'border-transparent hover:bg-slate-800'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Video</span>
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Contiguous Purchase Module (PDP) */}
          <div className="order-1 flex flex-col gap-6 self-start md:order-none md:col-span-5">
            <div className="space-y-4">
              {/* Product Title */}
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-950 leading-snug">
                {product.title}
              </h2>

              {/* Rating */}
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1 text-slate-900 font-semibold">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-mono tabular-nums">
                    {product.rating !== undefined ? Number(product.rating).toFixed(1) : '4.8'}
                  </span>
                </div>
                <span className="text-slate-400">·</span>
                <span className="text-slate-500 font-medium">
                  {product.reviewCount !== undefined ? Number(product.reviewCount).toLocaleString() : '1,500'} Amazon customer ratings
                </span>
              </div>

              {/* Price Display */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-xs text-slate-500">Amazon Verified Deal Price:</div>
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-mono tabular-nums">
                    {formatCurrency(currentDealPrice)}
                  </span>
                  {currentPrice > currentDealPrice && (
                    <span className="text-sm text-slate-400 line-through font-mono tabular-nums">
                      {formatCurrency(currentPrice)}
                    </span>
                  )}
                </div>
                {discountPercent > 0 && (
                  <p className="text-xs font-semibold text-emerald-600">
                    Instant discount: You save {discountPercent}% today ({formatCurrency(currentPrice - currentDealPrice)})
                  </p>
                )}
              </div>

              {/* Variant Selector (Sizes, Flavors, Capacity, Models) */}
              {hasVariants && (
                <div className="space-y-2 p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/60">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                      Select Option / Variant:
                    </span>
                    <span className="font-semibold text-amber-900 bg-amber-100 px-2 py-0.5 rounded text-[11px]">
                      {activeVariant?.name}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {product.variants!.map((v, idx) => {
                      const isSelected = selectedVariantIdx === idx;
                      return (
                        <button
                          key={v.id || idx}
                          type="button"
                          onClick={() => {
                            setSelectedVariantIdx(idx);
                            setActiveImageIndex(0);
                            setActiveMedia('image');
                          }}
                          className={`flex items-center justify-between p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-amber-400 border-amber-500 text-slate-950 shadow-xs font-bold ring-2 ring-amber-400/30'
                              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <div className="truncate pr-1">
                            <p className="text-xs font-bold truncate leading-tight">{v.name}</p>
                            <span className="text-[10px] text-slate-500 uppercase">{v.optionType || 'Option'}</span>
                          </div>
                          <span className={`text-xs font-mono shrink-0 font-extrabold ${isSelected ? 'text-slate-950' : 'text-amber-800'}`}>
                            ${(v.dealPrice || product.dealPrice).toFixed(2)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Purchase actions stay near price and variants instead of the end of long page content. */}
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => onBuyNow(product, currentAmazonUrl)}
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-slate-950 font-bold text-sm rounded-xl shadow-sm transition-colors cursor-pointer group"
                >
                  <span>Buy Now on Amazon</span>
                  <ExternalLink className="w-4 h-4 text-slate-950 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onOpenChatWithProduct(product);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-slate-500" />
                  <span>Ask Question on Live Chat or WhatsApp</span>
                </button>

                <p className="text-[10px] text-slate-400 text-center leading-tight">
                  Clicking opens official Amazon page in a secure new tab. Affiliate tracking applies without altering your purchase price.
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Key Specifications:
                </span>
                <ul className="space-y-2">
                  {product.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Free Amazon Prime Delivery</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Official Warranty Coverage</span>
                </div>
              </div>
            </div>

          </div>

          {/* Keep long-form copy below the media and purchase module on every screen size. */}
          <div className="order-3 space-y-2 border-t border-slate-100 pt-4 md:order-none md:col-span-12">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Product Description & US Buying Guide
            </h4>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {product.description ||
                  'Verified authentic US stock. Sourced directly from Amazon-certified suppliers with verified serial numbers, factory-sealed packaging, and full manufacturer warranty.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
