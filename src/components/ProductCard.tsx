import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Star, Play, Check, Images } from 'lucide-react';
import { Product } from '../types';
import { formatCurrency } from '../utils/helpers';
import { getProductPath } from '../utils/productRoutes';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onBuyNow: (product: Product, e: React.MouseEvent, variantUrl?: string) => void;
  retailerName: string;
  purchaseButtonLabel: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onBuyNow,
  retailerName,
  purchaseButtonLabel,
}) => {
  const hasVariants = product.variants && product.variants.length > 0;
  const [selectedVariantIdx, setSelectedVariantIdx] = useState<number>(0);

  const activeVariant = hasVariants ? product.variants![selectedVariantIdx] : null;

  const currentPrice = activeVariant?.price !== undefined ? activeVariant.price : product.price;
  const currentDealPrice = activeVariant?.dealPrice !== undefined ? activeVariant.dealPrice : product.dealPrice;
  const currentRetailerUrl = activeVariant?.amazonUrl || product.amazonUrl;
  const buttonLabel = product.productButtonLabel?.trim() || purchaseButtonLabel;
  const isAmazonRetailer = retailerName.trim().toLowerCase() === 'amazon';
  const isAmazonSpecificBadge = /amazon|prime/i.test(product.badge || '');
  const isBestSellerBadge = /best seller/i.test(product.badge || '');
  const showBadge = Boolean(
    product.badge &&
    (!isAmazonSpecificBadge || isAmazonRetailer) &&
    (!isBestSellerBadge || product.isBestSeller)
  );

  const discountPercent =
    currentPrice > currentDealPrice
      ? Math.round(((currentPrice - currentDealPrice) / currentPrice) * 100)
      : 0;

  const hasVideo = product.videoType !== 'none' && Boolean(product.videoUrl);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [isImageHovered, setIsImageHovered] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const didSwipe = useRef(false);

  const allImages = React.useMemo(() => {
    const variantImages = activeVariant
      ? [activeVariant.image, ...(activeVariant.gallery || [])].filter((img): img is string => Boolean(img))
      : [];
    if (variantImages.length) return [...new Set(variantImages.filter(Boolean))].slice(0, 20);

    const list = [product.image];
    if (product.gallery) {
      product.gallery.forEach((img) => {
        if (img && !list.includes(img)) list.push(img);
      });
    }
    return list.slice(0, 20);
  }, [activeVariant, product.image, product.gallery]);

  const activeImage = allImages[isImageHovered && currentImgIndex === 0 ? 1 : currentImgIndex] || product.image;

  const showPreviousImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIndex((index) => (index - 1 + allImages.length) % allImages.length);
  };

  const showNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIndex((index) => (index + 1) % allImages.length);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || allImages.length < 2) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    if (Math.abs(deltaX) < 40 || Math.abs(deltaX) < Math.abs(deltaY)) return;

    didSwipe.current = true;
    setCurrentImgIndex((index) => (index + (deltaX < 0 ? 1 : -1) + allImages.length) % allImages.length);
    window.setTimeout(() => {
      didSwipe.current = false;
    }, 350);
  };

  return (
    <div
      onClick={() => {
        if (didSwipe.current) return;
        onSelect(product);
      }}
      className="group relative flex h-full min-h-0 snap-start flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-amber-400 hover:shadow-lg transition-all duration-200 cursor-pointer"
    >
      {/* Top Media Container - responsive aspect-square with object-contain so vertical bags (cat food, gym protein) are NEVER cropped */}
      <div
        className="relative aspect-[4/3] sm:aspect-square w-full bg-white p-3 sm:p-4 flex items-center justify-center overflow-hidden border-b border-slate-100"
        onMouseEnter={() => setIsImageHovered(true)}
        onMouseLeave={() => setIsImageHovered(false)}
        onTouchStart={(e) => {
          const touch = e.touches[0];
          touchStart.current = { x: touch.clientX, y: touch.clientY };
        }}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={activeImage}
          alt={product.imageAlt || `${product.title} product photo`}
          referrerPolicy="no-referrer"
          className="w-full h-full max-h-full object-contain object-center transition-transform duration-300 drop-shadow-xs"
          onError={(e) => {
            (e.currentTarget as HTMLElement).style.display = 'none';
          }}
        />

        {allImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={showPreviousImage}
              aria-label="Previous product image"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 rounded-full border border-slate-200 bg-white/90 p-1.5 text-slate-800 shadow-md transition-opacity sm:p-2 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={showNextImage}
              aria-label="Next product image"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 rounded-full border border-slate-200 bg-white/90 p-1.5 text-slate-800 shadow-md transition-opacity sm:p-2 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        {/* Video Available Badge */}
        {hasVideo && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-slate-950/85 backdrop-blur-xs text-white text-[11px] font-medium rounded-md shadow-xs z-10">
            <Play className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>Video Review</span>
          </div>
        )}

        {/* Multi-Photo Gallery Badge (supports up to 20 images) */}
        {allImages.length > 1 && (
          <div
            className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2 py-0.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-semibold rounded-md shadow-xs z-10"
            title={`${allImages.length} photos available`}
          >
            <Images className="w-3 h-3 text-amber-400" />
            <span>{allImages.length} Photos</span>
          </div>
        )}

        {/* Badge (e.g. Amazon's Choice, Best Seller) */}
        {showBadge && (
          <div className="absolute top-3 right-3 px-2.5 py-1 bg-amber-400 text-slate-950 text-[11px] font-bold rounded-md shadow-xs z-10">
            {product.badge}
          </div>
        )}

        {/* Quick Gallery Dots if multiple images */}
        {allImages.length > 1 && (
          <div
            className="absolute bottom-3 right-3 flex items-center gap-1 z-10 bg-white/90 backdrop-blur-xs px-2 py-1 rounded-full border border-slate-200 shadow-xs opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            {allImages.slice(0, 5).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImgIndex(idx);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  currentImgIndex === idx ? 'bg-amber-500 w-3' : 'bg-slate-300 hover:bg-slate-500'
                }`}
                title={`View photo ${idx + 1}`}
              />
            ))}
            {allImages.length > 5 && (
              <span className="text-[9px] font-mono text-slate-500 ml-0.5">+{allImages.length - 5}</span>
            )}
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="flex flex-col flex-1 p-2.5 sm:p-5">
        {/* Category & Rating Row */}
        <div className="flex items-center justify-between gap-1.5 mb-1.5">
          <span className="inline-block px-1.5 sm:px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200/70 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider truncate max-w-[85px] sm:max-w-[170px]">
            {product.category || 'General'}
          </span>
          {product.rating > 0 && <div className="flex items-center gap-1 text-slate-700 text-xs shrink-0">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
            <span className="font-bold tabular-nums">
              {Number(product.rating).toFixed(1)}
            </span>
            {product.reviewCount > 0 && (
              <span className="text-slate-400 text-[11px]">
                ({Number(product.reviewCount).toLocaleString()})
              </span>
            )}
          </div>}
        </div>

        {/* Brand Name */}
        <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider truncate mb-1">
          {product.brand}
        </p>

        {/* Title */}
        <h3 className="min-h-[2.75rem] text-[13px] break-words sm:min-h-[2.5rem] sm:text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-2 leading-snug mb-2">
          <a
            href={getProductPath(product)}
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
                e.stopPropagation();
                return;
              }
              e.preventDefault();
              e.stopPropagation();
              onSelect(product);
            }}
            className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500"
          >
            {product.title}
          </a>
        </h3>

        {product.features?.length > 0 && (
          <ul aria-label="Key features" className="mb-2 min-h-[3.25rem] space-y-1 text-[11px] leading-snug text-slate-600 sm:mb-3 sm:min-h-[3.5rem] sm:text-xs sm:leading-relaxed">
            {product.features.slice(0, 2).map((feature, index) => (
              <li key={index} className="flex items-start gap-1.5">
                <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" />
                <span className="line-clamp-2">{feature}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Product Variants Selector Chips (If variants exist) */}
        {hasVariants && (
          <div className="mb-2 space-y-1 sm:mb-3 sm:space-y-1.5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-1 text-[10px] text-slate-500 sm:text-[11px]">
              <span className="font-semibold text-slate-700">Options / Sizes:</span>
              <span className="text-amber-700 font-medium truncate max-w-[82px] sm:max-w-[150px]">{activeVariant?.name}</span>
            </div>
            <div className="flex flex-nowrap gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {product.variants!.slice(0, 4).map((variant, vIdx) => {
                const isSelected = selectedVariantIdx === vIdx;
                return (
                  <button
                    key={variant.id || vIdx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedVariantIdx(vIdx);
                      setCurrentImgIndex(0);
                    }}
                    className={`shrink-0 px-1.5 sm:px-2 py-1 rounded-lg text-[10px] sm:text-[11px] font-semibold transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-2xs font-bold'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                    title={variant.name}
                  >
                    <span className="truncate max-w-[70px] sm:max-w-[120px] inline-block">{variant.name}</span>
                  </button>
                );
              })}
              {product.variants!.length > 4 && (
                <span className="text-[10px] text-slate-400 flex items-center px-1">
                  +{product.variants!.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Price & Buy Now Container */}
        <div className="pt-3 border-t border-slate-100 mt-auto space-y-3">
          <div className="flex items-baseline justify-between">
            <div className="space-y-0.5">
              <div className="flex items-baseline gap-2">
                <span className="text-base sm:text-xl font-extrabold text-slate-950 font-mono tabular-nums">
                  {formatCurrency(currentDealPrice)}
                </span>
                {currentPrice > currentDealPrice && (
                  <span className="text-xs text-slate-400 line-through font-mono tabular-nums">
                    {formatCurrency(currentPrice)}
                  </span>
                )}
              </div>
              {discountPercent > 0 && (
                <span className="text-[11px] font-bold text-emerald-600 block">
                  Save {discountPercent}% at the listed price
                </span>
              )}
            </div>

          </div>

          {/* Retailer checkout is handled on the external product page. */}
          <div className="grid grid-cols-1 gap-2 pt-1">
            <button
              onClick={(e) => onBuyNow(product, e, currentRetailerUrl)}
              className="w-full min-h-[42px] flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer group/btn"
              title={`Open product page at ${retailerName}`}
            >
              <span>{buttonLabel}</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-900 group-hover/btn:translate-x-0.5 transition-transform shrink-0" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
