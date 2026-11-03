import React, { useState, useEffect } from 'react';
import {
  X,
  Video,
  Image as ImageIcon,
  Link,
  Plus,
  Trash2,
  CheckCircle,
  Upload,
  Star,
  Check,
  AlertCircle,
  FileText,
  Layers,
  Sparkles,
  Tag,
} from 'lucide-react';
import { Product, ProductVariant } from '../../types';
import { getYouTubeEmbedUrl, formatAmazonAffiliateUrl } from '../../utils/helpers';
import { uploadImageToSupabase, uploadVideoToSupabase } from '../../services/storage';
import premiumCatFood from '../../assets/images/premium_cat_food_1793635553336.jpg';
import gymWheyProtein from '../../assets/images/gym_whey_protein_1793635553376.jpg';
import smartAirFryer from '../../assets/images/smart_air_fryer_1793635553057.jpg';
import curvedMonitor from '../../assets/images/curved_gaming_monitor_1793432526940.jpg';
import ancHeadphones from '../../assets/images/wireless_anc_headphones_1793432526819.jpg';
import mechanicalKeyboard from '../../assets/images/mechanical_keyboard_1793432527212.jpg';
import ergonomicChair from '../../assets/images/ergonomic_smart_chair_1793432527087.jpg';

interface AdminProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Partial<Product> & { title: string; price: number; dealPrice: number; amazonUrl: string; variants?: ProductVariant[] }) => void;
  productToEdit?: Product | null;
}

const PRESET_IMAGES = [
  { label: 'Organic Salmon Cat Food', url: premiumCatFood },
  { label: 'Whey Protein Isolate Gym', url: gymWheyProtein },
  { label: 'Smart Dual Air Fryer', url: smartAirFryer },
  { label: 'Curved Gaming Monitor', url: curvedMonitor },
  { label: 'ANC Wireless Headphones', url: ancHeadphones },
  { label: 'Custom Mechanical Keyboard', url: mechanicalKeyboard },
  { label: 'Ergonomic Mesh Chair', url: ergonomicChair },
];

const getVariantImages = (variant?: ProductVariant): string[] =>
  [...new Set([variant?.image, ...(variant?.gallery || [])].filter((image): image is string => Boolean(image)))].slice(0, 20);

export const AdminProductFormModal: React.FC<AdminProductFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  productToEdit,
}) => {
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('Cat Food & Pet Care');
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  
  const [price, setPrice] = useState('46.99');
  const [dealPrice, setDealPrice] = useState('34.99');
  const [amazonUrl, setAmazonUrl] = useState('');
  const [affiliateTag, setAffiliateTag] = useState('kefayaan-20');
  
  // Up to 20 Images Gallery State
  const [gallery, setGallery] = useState<string[]>([PRESET_IMAGES[0].url]);
  const [coverIndex, setCoverIndex] = useState<number>(0);
  const [singleImageUrlInput, setSingleImageUrlInput] = useState('');
  
  // Product Variants State
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [newVarName, setNewVarName] = useState('');
  const [newVarOptionType, setNewVarOptionType] = useState('Size & Flavor');
  const [newVarDealPrice, setNewVarDealPrice] = useState('');
  const [newVarPrice, setNewVarPrice] = useState('');
  const [newVarUrl, setNewVarUrl] = useState('');
  const [newVarImages, setNewVarImages] = useState<string[]>([]);
  const [isUploadingVariantImages, setIsUploadingVariantImages] = useState(false);

  const [videoType, setVideoType] = useState<'youtube' | 'direct' | 'none'>('youtube');
  const [videoUrl, setVideoUrl] = useState('');
  
  // Badges & Ratings
  const [badge, setBadge] = useState("Amazon's Choice");
  const [rating, setRating] = useState('4.8');
  const [reviewCount, setReviewCount] = useState('1500');
  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState<string[]>([
    'Real animal protein formulation with zero filler grains',
    'Certified Amazon Prime 2-day delivery eligible'
  ]);
  const [newFeatureText, setNewFeatureText] = useState('');
  const [draggedGalleryIndex, setDraggedGalleryIndex] = useState<number | null>(null);

  useEffect(() => {
    if (productToEdit) {
      setTitle(productToEdit.title);
      setBrand(productToEdit.brand);
      
      const standardCats = [
        'Cat Food & Pet Care',
        'Gym & Sports Nutrition',
        'Home & Kitchen Gadgets',
        'Tech & Smart Gadgets',
        'Home & Workstation',
      ];
      if (standardCats.includes(productToEdit.category)) {
        setCategory(productToEdit.category);
        setIsCustomCategory(false);
      } else {
        setCategory('custom');
        setCustomCategory(productToEdit.category);
        setIsCustomCategory(true);
      }

      setPrice(productToEdit.price.toString());
      setDealPrice(productToEdit.dealPrice.toString());
      setAmazonUrl(productToEdit.amazonUrl);
      setAffiliateTag(productToEdit.affiliateTag || 'kefayaan-20');
      
      // Load gallery
      const existingGallery = productToEdit.gallery && productToEdit.gallery.length > 0
        ? productToEdit.gallery
        : [productToEdit.image];
      setGallery(existingGallery);
      setCoverIndex(0);

      // Load variants
      setVariants(productToEdit.variants && Array.isArray(productToEdit.variants) ? productToEdit.variants : []);
      setNewVarImages([]);

      setVideoType(productToEdit.videoType || 'none');
      setVideoUrl(productToEdit.videoUrl || '');
      setBadge(productToEdit.badge || '');
      setRating(productToEdit.rating.toString());
      setReviewCount(productToEdit.reviewCount.toString());
      setDescription(productToEdit.description || '');
      setFeatures(productToEdit.features || []);
    } else {
      setTitle('');
      setBrand('');
      setCategory('Cat Food & Pet Care');
      setIsCustomCategory(false);
      setCustomCategory('');
      setPrice('46.99');
      setDealPrice('34.99');
      setAmazonUrl('https://link.amazon/B0dbjUEFY');
      setAffiliateTag('kefayaan-20');
      setGallery([PRESET_IMAGES[0].url]);
      setCoverIndex(0);
      setVariants([]);
      setNewVarImages([]);
      setVideoType('youtube');
      setVideoUrl('https://www.youtube.com/watch?v=kYJv6uS8Vnk');
      setBadge("Amazon's Choice");
      setRating('4.8');
      setReviewCount('1500');
      setDescription(
        'Top bestselling formulation crafted with pure, unadulterated ingredients. Formulated by specialists to ensure maximum absorption, health vitality, and Amazon Prime satisfaction.'
      );
      setFeatures([
        'Real natural protein with zero filler grains',
        'Official manufacturer warranty included'
      ]);
    }
  }, [productToEdit, isOpen]);


  if (!isOpen) return null;

  const handleAddFeature = () => {
    if (newFeatureText.trim()) {
      setFeatures([...features, newFeatureText.trim()]);
      setNewFeatureText('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleFeatureChange = (index: number, value: string) => {
    setFeatures((prev) => prev.map((feature, i) => (i === index ? value : feature)));
  };

  const handleGalleryMove = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;

    setGallery((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });

    setCoverIndex((prevCover) => {
      if (prevCover === fromIndex) return toIndex;
      if (fromIndex < prevCover && toIndex >= prevCover) return prevCover - 1;
      if (fromIndex > prevCover && toIndex <= prevCover) return prevCover + 1;
      return prevCover;
    });
  };

  const handleGalleryDrop = (targetIndex: number) => {
    if (draggedGalleryIndex === null) return;
    handleGalleryMove(draggedGalleryIndex, targetIndex);
    setDraggedGalleryIndex(null);
  };

  // Multi-Image File Upload (Up to 20 Photos)
  const handleMultipleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 20 - gallery.length;
    if (remainingSlots <= 0) {
      alert('You have already added the maximum limit of 20 images.');
      return;
    }

    const filesToLoad = Array.from(files).slice(0, remainingSlots);
    setIsUploadingImages(true);

    try {
      const uploadedUrls: string[] = [];
      for (const file of filesToLoad) {
        const uploadedUrl = await uploadImageToSupabase(file);
        if (uploadedUrl) {
          uploadedUrls.push(uploadedUrl);
        } else {
          const reader = new FileReader();
          const result = await new Promise<string | null>((resolve) => {
            reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : null);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(file);
          });
          if (result) uploadedUrls.push(result);
        }
      }

      if (uploadedUrls.length > 0) {
        setGallery((prev) => [...prev, ...uploadedUrls].slice(0, 20));
      }
    } catch (error) {
      console.warn('Image upload failed', error);
      alert('One or more images could not be uploaded. Please try again or use image URLs.');
    } finally {
      setIsUploadingImages(false);
      e.target.value = '';
    }
  };

  // Add Image via URL
  const handleAddImageUrl = () => {
    if (!singleImageUrlInput.trim()) return;
    if (gallery.length >= 20) {
      alert('Maximum 20 images limit reached.');
      return;
    }
    setGallery([...gallery, singleImageUrlInput.trim()]);
    setSingleImageUrlInput('');
  };

  // Remove individual image from gallery
  const handleRemoveImage = (indexToRemove: number) => {
    if (gallery.length <= 1) {
      alert('Product must have at least 1 image.');
      return;
    }
    const updated = gallery.filter((_, i) => i !== indexToRemove);
    setGallery(updated);
    if (coverIndex === indexToRemove) {
      setCoverIndex(0);
    } else if (coverIndex > indexToRemove) {
      setCoverIndex(coverIndex - 1);
    }
  };

  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingVideo(true);
    try {
      const uploadedUrl = await uploadVideoToSupabase(file);
      if (uploadedUrl) {
        setVideoUrl(uploadedUrl);
        setVideoType('direct');
      } else {
        const reader = new FileReader();
        const result = await new Promise<string | null>((resolve) => {
          reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : null);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(file);
        });
        if (result) {
          setVideoUrl(result);
          setVideoType('direct');
        }
      }
    } catch (error) {
      console.warn('Video upload failed', error);
      alert('Video upload failed. Please try again or paste a direct video URL instead.');
    } finally {
      setIsUploadingVideo(false);
      e.target.value = '';
    }
  };

  const handleAddVariant = () => {
    if (!newVarName.trim()) {
      alert('Please enter a variant name (e.g. "5 lbs / Vanilla Bean").');
      return;
    }
    const newVariant: ProductVariant = {
      id: `var-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: newVarName.trim(),
      optionType: newVarOptionType.trim() || 'Option',
      dealPrice: parseFloat(newVarDealPrice) || parseFloat(dealPrice) || 0,
      price: parseFloat(newVarPrice) || parseFloat(price) || 0,
      amazonUrl: newVarUrl.trim() ? formatAmazonAffiliateUrl(newVarUrl.trim(), affiliateTag) : undefined,
      image: newVarImages[0],
      gallery: newVarImages.slice(0, 20),
      inStock: true,
    };
    setVariants([...variants, newVariant]);
    setNewVarName('');
    setNewVarDealPrice('');
    setNewVarPrice('');
    setNewVarUrl('');
    setNewVarImages([]);
  };

  const handleRemoveVariant = (idToRemove: string) => {
    setVariants(variants.filter((v) => v.id !== idToRemove));
  };

  const handleVariantImageUpload = async (
    variantId: string | null,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const input = e.currentTarget;
    const files = Array.from(input.files || []);
    if (!files.length) return;

    const targetVariant = variantId ? variants.find((variant) => variant.id === variantId) : null;
    const currentImages = variantId ? getVariantImages(targetVariant) : newVarImages;
    const remainingSlots = 20 - currentImages.length;
    if (remainingSlots <= 0) {
      alert('This variant already has the maximum of 20 images.');
      input.value = '';
      return;
    }

    setIsUploadingVariantImages(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of files.slice(0, remainingSlots)) {
        const uploadedUrl = await uploadImageToSupabase(file);
        if (uploadedUrl) {
          uploadedUrls.push(uploadedUrl);
          continue;
        }

        const reader = new FileReader();
        const result = await new Promise<string | null>((resolve) => {
          reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : null);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(file);
        });
        if (result) uploadedUrls.push(result);
      }

      if (variantId) {
        setVariants((previous) => previous.map((variant) => {
          if (variant.id !== variantId) return variant;
          const gallery = [...currentImages, ...uploadedUrls].slice(0, 20);
          return { ...variant, image: gallery[0], gallery };
        }));
      } else {
        setNewVarImages((previous) => [...previous, ...uploadedUrls].slice(0, 20));
      }
    } catch (error) {
      console.warn('Variant image upload failed', error);
      alert('Variant image upload failed. Please try again.');
    } finally {
      setIsUploadingVariantImages(false);
      input.value = '';
    }
  };

  const handleRemoveVariantImage = (variantId: string, imageIndex: number) => {
    setVariants((previous) => previous.map((variant) => {
      if (variant.id !== variantId) return variant;
      const currentImages = getVariantImages(variant);
      const gallery = currentImages.filter((_, index) => index !== imageIndex);
      return { ...variant, image: gallery[0], gallery };
    }));
  };

  const handleRemoveNewVariantImage = (imageIndex: number) => {
    setNewVarImages((previous) => previous.filter((_, index) => index !== imageIndex));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amazonUrl.trim()) return;

    const resolvedCategory = isCustomCategory ? customCategory.trim() || 'General' : category;
    const formattedAmazonUrl = formatAmazonAffiliateUrl(amazonUrl, affiliateTag);
    const primaryImage = gallery[coverIndex] || gallery[0] || PRESET_IMAGES[0].url;

    const parsedRating = parseFloat(rating);
    const parsedReviewCount = parseInt(reviewCount.replace(/[^0-9]/g, ''), 10);

    onSave({
      ...(productToEdit ? { id: productToEdit.id } : {}),
      title: title.trim(),
      brand: brand.trim() || 'Featured Brand',
      category: resolvedCategory,
      price: parseFloat(price) || 0,
      dealPrice: parseFloat(dealPrice) || parseFloat(price) || 0,
      amazonUrl: formattedAmazonUrl,
      affiliateTag: affiliateTag.trim(),
      image: primaryImage,
      gallery: gallery.slice(0, 20),
      variants: variants.map((variant) => {
        const variantImages = getVariantImages(variant);
        return {
          ...variant,
          amazonUrl: variant.amazonUrl?.trim()
            ? formatAmazonAffiliateUrl(variant.amazonUrl.trim(), affiliateTag)
            : undefined,
          image: variantImages[0],
          gallery: variantImages,
        };
      }),
      videoType,
      videoUrl: videoUrl.trim(),
      badge,
      rating: !isNaN(parsedRating) ? Math.min(5, Math.max(1, parsedRating)) : 4.8,
      reviewCount: !isNaN(parsedReviewCount) ? Math.max(0, parsedReviewCount) : 1500,
      description: description.trim(),
      features,
    });

    onClose();
  };


  const youtubeEmbed = videoType === 'youtube' && videoUrl ? getYouTubeEmbedUrl(videoUrl) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm overflow-y-auto p-0 sm:p-6">
      <div className="relative w-full max-w-4xl bg-white rounded-none sm:rounded-2xl md:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto h-[100dvh] sm:h-auto max-h-[100dvh] sm:max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-3 sm:px-6 py-3 sm:py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-extrabold text-slate-950">
              {productToEdit ? 'Edit Amazon Product Details' : 'Upload New Amazon Trending Product'}
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-500">
              Add up to 20 images, detailed description, video review, and direct Amazon affiliate link
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="min-h-0 p-3 sm:p-6 overflow-y-auto space-y-6 sm:space-y-7 text-xs">
          {/* Section 1: Product Identity & Proper Category */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-900">
              <span className="w-6 h-6 rounded-full bg-slate-950 text-white flex items-center justify-center font-bold text-[11px]">1</span>
              <h4 className="font-bold text-sm">Product Identity & Department</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-1">
                <label className="font-semibold text-slate-700">Product Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Blue Buffalo Wilderness Salmon Adult Dry Cat Food, 11-lb Bag"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-950"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Brand / Manufacturer *</label>
                <input
                  type="text"
                  required
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Blue Buffalo, Optimum Nutrition, Ninja"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-950"
                />
              </div>

              <div className="md:col-span-3 space-y-2">
                <label className="font-semibold text-slate-700">
                  Department / Category (Select the exact category to avoid Desk & Displays) *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {[
                    { id: 'Cat Food & Pet Care', label: '🐱 Cat Food & Pet' },
                    { id: 'Gym & Sports Nutrition', label: '🏋️ Gym & Protein' },
                    { id: 'Home & Kitchen Gadgets', label: '🍳 Kitchen & Home' },
                    { id: 'Tech & Smart Gadgets', label: '⚡ Tech & Gadgets' },
                    { id: 'Home & Workstation', label: '🪑 Workstation' },
                    { id: 'custom', label: '✏️ Custom Category' },
                  ].map((catOption) => (
                    <button
                      key={catOption.id}
                      type="button"
                      onClick={() => {
                        if (catOption.id === 'custom') {
                          setIsCustomCategory(true);
                          setCategory('custom');
                        } else {
                          setIsCustomCategory(false);
                          setCategory(catOption.id);
                        }
                      }}
                      className={`p-2.5 rounded-xl border text-left font-semibold text-xs transition-all cursor-pointer ${
                        (isCustomCategory && catOption.id === 'custom') || (!isCustomCategory && category === catOption.id)
                          ? 'bg-slate-950 text-white border-slate-950 shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {catOption.label}
                    </button>
                  ))}
                </div>

                {isCustomCategory && (
                  <input
                    type="text"
                    required
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Enter your custom department name (e.g. Baby Care, Outdoor Gear)..."
                    className="w-full px-3.5 py-2 text-xs bg-amber-50/50 border border-amber-300 rounded-xl focus:bg-white focus:outline-none"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Product Images & Multi-Image Gallery (Up to 20 Photos) */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-slate-900">
                <span className="w-6 h-6 rounded-full bg-slate-950 text-white flex items-center justify-center font-bold text-[11px]">2</span>
                <h4 className="font-bold text-sm">
                  Product Images & Photo Gallery (Upload Up to 20 Images)
                </h4>
              </div>
              <span className="font-bold font-mono text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md">
                Images Added: {gallery.length} / 20 Max
              </span>
            </div>

            {/* Actions: Batch Upload or URL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Batch Upload from device */}
              <div className="p-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-amber-500 bg-slate-50/60 hover:bg-amber-50/30 transition-colors flex flex-col items-center justify-center text-center space-y-2">
                <Upload className="w-6 h-6 text-amber-600" />
                <div>
                  <label className="cursor-pointer font-bold text-slate-900 hover:text-amber-600 underline">
                    {isUploadingImages ? 'Uploading images...' : 'Choose multiple images from your device'}
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleMultipleImageUpload}
                      disabled={isUploadingImages}
                    />
                  </label>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Select 1 to 20 photos at once (.jpg, .png, .webp).
                  </p>
                </div>
              </div>

              {/* Add by image URL */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between space-y-2">
                <label className="font-semibold text-slate-700">Or Paste Image URL:</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={singleImageUrlInput}
                    onChange={(e) => setSingleImageUrlInput(e.target.value)}
                    placeholder="https://images-na.ssl-images-amazon.com/..."
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl cursor-pointer"
                  >
                    Add URL
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">
                  Paste Amazon high-res image link or any web photo link.
                </p>
              </div>
            </div>

            {/* Quick 1-Click Presets */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-500">Quick 1-Click Studio Presets:</span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_IMAGES.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (gallery.length >= 20) {
                        alert('Max 20 images limit reached.');
                        return;
                      }
                      setGallery([...gallery, p.url]);
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3 text-slate-400" />
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Gallery Grid (Showing All Up to 20 Photos) */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">
                  Uploaded Gallery Thumbnails ({gallery.length} items):
                </span>
                <span className="text-[11px] text-slate-500">
                  Click <strong>"Set as Cover"</strong> to choose which image shows on the homepage card.
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 max-h-64 overflow-y-auto">
                {gallery.map((imgUrl, index) => {
                  const isCover = coverIndex === index;
                  return (
                    <div
                      key={`${imgUrl}-${index}`}
                      draggable
                      onDragStart={() => setDraggedGalleryIndex(index)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => handleGalleryDrop(index)}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 bg-white flex flex-col justify-between group transition-all ${
                        isCover ? 'border-amber-500 ring-2 ring-amber-400/40 shadow-sm' : 'border-slate-200 hover:border-slate-400'
                      } ${draggedGalleryIndex === index ? 'opacity-60 scale-[0.98]' : ''}`}
                    >
                      <img
                        src={imgUrl}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-contain p-1"
                      />

                      {/* Cover Badge */}
                      {isCover && (
                        <div className="absolute top-1 left-1 bg-amber-500 text-slate-950 font-extrabold text-[9px] px-1.5 py-0.5 rounded shadow">
                          ★ Cover
                        </div>
                      )}

                      {/* Photo Index Number */}
                      <span className="absolute bottom-1 left-1 bg-slate-950/70 text-white text-[9px] px-1 rounded font-mono">
                        #{index + 1}
                      </span>

                      {/* Hover action overlay */}
                      <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                        {!isCover && (
                          <button
                            type="button"
                            onClick={() => setCoverIndex(index)}
                            className="w-full py-1 px-1 bg-amber-400 hover:bg-amber-300 text-slate-950 text-[10px] font-bold rounded shadow cursor-pointer text-center"
                          >
                            Set Cover
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="w-full py-1 px-1 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded shadow cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleGalleryMove(index, index === 0 ? 1 : index - 1)}
                          className="w-full py-1 px-1 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold rounded shadow cursor-pointer"
                        >
                          Move Left
                        </button>
                        <button
                          type="button"
                          onClick={() => handleGalleryMove(index, Math.min(gallery.length - 1, index + 1))}
                          className="w-full py-1 px-1 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold rounded shadow cursor-pointer"
                        >
                          Move Right
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 3: Prominent Product Description & US Buying Guide */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900">
                <span className="w-6 h-6 rounded-full bg-slate-950 text-white flex items-center justify-center font-bold text-[11px]">3</span>
                <h4 className="font-bold text-sm">
                  Product Description & US Buying Guide (পণ্যের বিস্তারিত বিবরণ) *
                </h4>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {description.length} characters
              </span>
            </div>

            <p className="text-[11px] text-slate-500">
              Enter the full detailed description here. This will be prominently shown on the product card snippet and inside the full modal view for US buyers.
            </p>

            <textarea
              rows={5}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write comprehensive product description here (e.g. key ingredients, nutritional profile, dimensions, warranty, why this product stands out on Amazon US, and how it was benchmarked)..."
              className="w-full p-4 text-xs bg-slate-50 border border-slate-300 rounded-2xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-950 leading-relaxed font-sans"
            />
          </div>

          {/* Section 4: Amazon Affiliate & Direct Buy Now Link */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2 text-slate-900">
              <span className="w-6 h-6 rounded-full bg-slate-950 text-white flex items-center justify-center font-bold text-[11px]">4</span>
              <h4 className="font-bold text-sm text-amber-600">
                Amazon Affiliate Direct Link & Pricing
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-1">
                <label className="font-semibold text-slate-700">
                  Amazon Product URL * (Paste clean or tagged link)
                </label>
                <div className="relative">
                  <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="url"
                    required
                    value={amazonUrl}
                    onChange={(e) => setAmazonUrl(e.target.value)}
                    placeholder="https://www.amazon.com/dp/B084G26X19?tag=auragear-20"
                    className="w-full pl-9 pr-3.5 py-2 text-xs bg-amber-50/40 border border-amber-300/80 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Amazon Associate Tag</label>
                <input
                  type="text"
                  value={affiliateTag}
                  onChange={(e) => setAffiliateTag(e.target.value)}
                  placeholder="e.g. auragear-20"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Original List Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Amazon Deal Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={dealPrice}
                  onChange={(e) => setDealPrice(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Highlight Badge</label>
                <select
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none"
                >
                  <option value="Amazon's Choice">Amazon's Choice</option>
                  <option value="#1 Best Seller">#1 Best Seller</option>
                  <option value="Editor's Choice">Editor's Choice</option>
                  <option value="Trending Deal">Trending Deal</option>
                  <option value="Top Rated">Top Rated</option>
                  <option value="Prime Day Deal">Prime Day Deal</option>
                  <option value="">No Badge</option>
                </select>
              </div>

              {/* Customer Review Rating & Total Reviewers Count (User requested manual inputs) */}
              <div className="md:col-span-3 p-4 rounded-2xl bg-gradient-to-r from-amber-50/70 via-amber-50/40 to-slate-50 border border-amber-300/80 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                    <div className="w-6 h-6 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                      <Star className="w-3.5 h-3.5 fill-slate-950" />
                    </div>
                    <div>
                      <span>Customer Star Rating & Reviewers Count</span>
                      <span className="block text-[10px] text-slate-500 font-normal">
                        রিভিউ রেটিং (যেমন 4.8, 5.0) এবং মোট রিভিউয়ার সংখ্যা (যেমন 1000, 1500) লিখে দিন
                      </span>
                    </div>
                  </div>

                  {/* Live Storefront Preview Badge */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-xl border border-amber-300 text-xs shadow-xs self-start sm:self-auto">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Live Preview:</span>
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    <span className="font-extrabold text-slate-900 font-mono">
                      {parseFloat(rating) ? parseFloat(rating).toFixed(1) : '4.8'}
                    </span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      ({parseInt(reviewCount) ? parseInt(reviewCount).toLocaleString() : '1,500'})
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {/* Rating Input Field */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                        <span>Star Rating (1.0 to 5.0) *</span>
                      </label>
                      <span className="text-[10px] text-amber-700 font-mono font-medium">e.g. 4.8, 5.0</span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="1.0"
                        max="5.0"
                        required
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                        placeholder="4.8"
                        className="w-full px-3.5 py-2 text-xs bg-white border border-amber-300 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-2xs"
                      />
                    </div>
                    {/* Quick Rating Presets */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-400 font-medium">Quick Choice:</span>
                      {['5.0', '4.9', '4.8', '4.7', '4.6'].map((rVal) => (
                        <button
                          key={rVal}
                          type="button"
                          onClick={() => setRating(rVal)}
                          className={`px-2 py-0.5 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                            rating === rVal
                              ? 'bg-amber-400 text-slate-950 shadow-xs'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-amber-100 hover:border-amber-300'
                          }`}
                        >
                          {rVal} ★
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Total Reviews / Reviewers Count Input Field */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-amber-600" />
                        <span>Total Customer Reviews Count *</span>
                      </label>
                      <span className="text-[10px] text-amber-700 font-mono font-medium">e.g. 1000, 1500</span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        step="1"
                        min="0"
                        required
                        value={reviewCount}
                        onChange={(e) => setReviewCount(e.target.value)}
                        placeholder="1500"
                        className="w-full px-3.5 py-2 text-xs bg-white border border-amber-300 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-2xs"
                      />
                    </div>
                    {/* Quick Review Count Presets */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-400 font-medium">Quick Choice:</span>
                      {['500', '1000', '1500', '2500', '5000', '10000'].map((cVal) => (
                        <button
                          key={cVal}
                          type="button"
                          onClick={() => setReviewCount(cVal)}
                          className={`px-2 py-0.5 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                            reviewCount === cVal
                              ? 'bg-amber-400 text-slate-950 shadow-xs'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-amber-100 hover:border-amber-300'
                          }`}
                        >
                          {parseInt(cVal).toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Product Variants (Sizes, Flavors, Weights, Options) */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900">
                <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-[11px]">
                  5
                </span>
                <div>
                  <h4 className="font-bold text-sm flex items-center gap-2">
                    <span>Product Variants & Options (সাইজ, ফ্লেভার, বা কালার)</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-mono font-semibold">
                      {variants.length} {variants.length === 1 ? 'Variant' : 'Variants'}
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Add customer-selectable options (e.g., "5 lbs / Vanilla", "24 Cans 5.5 oz", "8-Qt Stainless"). Each variant can have its own price & direct Amazon affiliate link.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Add Variant Bar */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                + Add New Variant Option:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
                <div className="sm:col-span-4 space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600">Option Name *</label>
                  <input
                    type="text"
                    value={newVarName}
                    onChange={(e) => setNewVarName(e.target.value)}
                    placeholder="e.g. 5 lbs / Double Rich Chocolate"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600">Type</label>
                  <select
                    value={newVarOptionType}
                    onChange={(e) => setNewVarOptionType(e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-xl focus:outline-none"
                  >
                    <option value="Size & Flavor">Size & Flavor</option>
                    <option value="Weight">Weight</option>
                    <option value="Flavor">Flavor</option>
                    <option value="Capacity">Capacity</option>
                    <option value="Color">Color</option>
                    <option value="Pack Size">Pack Size</option>
                  </select>
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600">Deal Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newVarDealPrice}
                    onChange={(e) => setNewVarDealPrice(e.target.value)}
                    placeholder={dealPrice || '34.99'}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl focus:outline-none font-mono"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600">List Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newVarPrice}
                    onChange={(e) => setNewVarPrice(e.target.value)}
                    placeholder={price || '46.99'}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl focus:outline-none font-mono"
                  />
                </div>
                <div className="sm:col-span-2 flex items-end">
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="w-full py-1.5 px-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Optional Custom Amazon link for this variant */}
              <div className="flex items-center gap-2 pt-1 text-xs">
                <span className="text-[11px] font-semibold text-slate-500 shrink-0">Variant Amazon Affiliate Link (Optional):</span>
                <input
                  type="url"
                  value={newVarUrl}
                  onChange={(e) => setNewVarUrl(e.target.value)}
                  placeholder="https://link.amazon/B0dbjUEFY (Leave blank to use main product link)"
                  className="flex-1 px-3 py-1 bg-white border border-slate-300 rounded-xl focus:outline-none font-mono text-[11px]"
                />
              </div>

              <div className="space-y-2 border-t border-slate-200 pt-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className="text-[11px] font-semibold text-slate-700">
                    Images for this variant: {newVarImages.length} / 20
                  </span>
                  <label className={`inline-flex w-fit cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-[11px] font-semibold ${
                    isUploadingVariantImages
                      ? 'cursor-not-allowed border-slate-200 text-slate-400'
                      : 'border-slate-300 bg-white text-slate-700 hover:border-amber-400'
                  }`}>
                    <Upload className="h-3.5 w-3.5" />
                    {isUploadingVariantImages ? 'Uploading...' : 'Add variant photos'}
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleVariantImageUpload(null, e)}
                      disabled={isUploadingVariantImages || newVarImages.length >= 20}
                    />
                  </label>
                </div>
                {newVarImages.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto py-1">
                    {newVarImages.map((image, index) => (
                      <div key={`${image}-${index}`} className="relative h-14 w-14 shrink-0 rounded-lg border border-slate-200 bg-white p-1">
                        <img src={image} alt={`Variant photo ${index + 1}`} className="h-full w-full object-contain" />
                        <button
                          type="button"
                          onClick={() => handleRemoveNewVariantImage(index)}
                          aria-label={`Remove variant photo ${index + 1}`}
                          className="absolute -right-1.5 -top-1.5 rounded-full bg-slate-900 p-1 text-white shadow"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* List of Added Variants */}
            {variants.length > 0 ? (
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-600">Configured Variants:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-96 overflow-y-auto p-1">
                  {variants.map((v) => (
                    <div
                      key={v.id}
                      className="min-w-0 space-y-2 rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs transition-colors hover:border-amber-300"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-bold text-xs text-slate-900 break-words">{v.name}</span>
                            <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px] uppercase font-semibold">
                              {v.optionType}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-baseline gap-2 text-xs">
                            <span className="font-extrabold text-amber-700 font-mono">${v.dealPrice?.toFixed(2)}</span>
                            {v.price && v.price > (v.dealPrice || 0) && (
                              <span className="text-slate-400 line-through text-[11px] font-mono">${v.price.toFixed(2)}</span>
                            )}
                            {v.amazonUrl && (
                              <span className="text-[10px] text-emerald-600 font-medium">· Custom Link Set</span>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(v.id)}
                          className="shrink-0 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete variant"
                          aria-label={`Delete ${v.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <label className="block space-y-1">
                        <span className="text-[10px] font-semibold text-slate-500">Variant Amazon affiliate link</span>
                        <input
                          type="url"
                          value={v.amazonUrl || ''}
                          onChange={(e) => setVariants((previous) => previous.map((variant) =>
                            variant.id === v.id
                              ? { ...variant, amazonUrl: e.target.value || undefined }
                              : variant
                          ))}
                          placeholder="Blank uses the main product link"
                          className="w-full min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 font-mono text-[10px] focus:border-amber-400 focus:outline-none"
                        />
                      </label>
                      {(() => {
                        const variantImages = getVariantImages(v);
                        return (
                          <div className="space-y-1.5 border-t border-slate-100 pt-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-semibold text-slate-500">
                                Variant gallery: {variantImages.length} / 20
                              </span>
                              <label className={`cursor-pointer text-[10px] font-semibold ${
                                isUploadingVariantImages || variantImages.length >= 20 ? 'text-slate-400' : 'text-amber-700 hover:text-amber-800'
                              }`}>
                                Add photos
                                <input
                                  type="file"
                                  multiple
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleVariantImageUpload(v.id, e)}
                                  disabled={isUploadingVariantImages || variantImages.length >= 20}
                                />
                              </label>
                            </div>
                            {variantImages.length > 0 && (
                              <div className="flex gap-1.5 overflow-x-auto py-1">
                                {variantImages.map((image, index) => (
                                  <div key={`${image}-${index}`} className="relative h-12 w-12 shrink-0 rounded-md border border-slate-200 bg-white p-1">
                                    <img src={image} alt={`${v.name} photo ${index + 1}`} className="h-full w-full object-contain" />
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveVariantImage(v.id, index)}
                                      aria-label={`Remove photo ${index + 1} from ${v.name}`}
                                      className="absolute -right-1 -top-1 rounded-full bg-slate-900 p-0.5 text-white shadow"
                                    >
                                      <X className="h-2.5 w-2.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-center">
                <p className="text-xs text-slate-500">
                  No variants added yet. (Optional: You can keep single product or click "+ Add" above for sizes/flavors).
                </p>
              </div>
            )}
          </div>

          {/* Section 6: Video Review Field */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900">
                <span className="w-6 h-6 rounded-full bg-slate-950 text-white flex items-center justify-center font-bold text-[11px]">6</span>
                <h4 className="font-bold text-sm">Video Review (YouTube Embed or Direct MP4)</h4>
              </div>
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setVideoType('youtube')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    videoType === 'youtube' ? 'bg-white shadow-xs text-slate-950' : 'text-slate-600'
                  }`}
                >
                  YouTube Link
                </button>
                <button
                  type="button"
                  onClick={() => setVideoType('direct')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    videoType === 'direct' ? 'bg-white shadow-xs text-slate-950' : 'text-slate-600'
                  }`}
                >
                  Direct MP4 / Upload
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setVideoType('none');
                    setVideoUrl('');
                  }}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    videoType === 'none' ? 'bg-white shadow-xs text-slate-950' : 'text-slate-600'
                  }`}
                >
                  No Video
                </button>
              </div>
            </div>

            {videoType === 'youtube' && (
              <div className="space-y-2">
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>
            )}

            {videoType === 'direct' && (
              <div className="space-y-2">
                <input
                  type="url"
                  value={videoUrl.startsWith('data:') ? '' : videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://example.com/video.mp4"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none"
                />
                <label className={`cursor-pointer text-xs font-medium flex items-center justify-center gap-1.5 p-2 border border-dashed rounded-xl bg-slate-50 ${isUploadingVideo ? 'text-slate-500 border-slate-200 cursor-not-allowed' : 'text-amber-700 hover:text-amber-800 border-slate-300'}`}>
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploadingVideo ? 'Uploading video...' : 'Or Upload Raw Video (.mp4, .webm)'}</span>
                  <input type="file" accept="video/mp4,video/webm" className="hidden" onChange={handleVideoFileUpload} disabled={isUploadingVideo} />
                </label>
              </div>
            )}
          </div>

          {/* Section 6: Key Bullets & Highlights */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2 text-slate-900">
              <span className="w-6 h-6 rounded-full bg-slate-950 text-white flex items-center justify-center font-bold text-[11px]">6</span>
              <h4 className="font-bold text-sm">Key Specifications & Bullets</h4>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newFeatureText}
                onChange={(e) => setNewFeatureText(e.target.value)}
                placeholder="Add bullet highlight (e.g. 'Grain-free wild caught salmon formula')..."
                className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold cursor-pointer hover:bg-slate-800"
              >
                Add Bullet
              </button>
            </div>

            <ul className="space-y-1.5">
              {features.map((feat, i) => (
                <li key={`feature-${i}`} className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200 gap-2">
                  <input
                    type="text"
                    value={feat}
                    onChange={(e) => handleFeatureChange(i, e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                    placeholder="Feature description"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(i)}
                    className="text-red-500 hover:text-red-700 p-1"
                    aria-label={`Remove bullet ${i + 1}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 sm:pt-5 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 sticky bottom-0 bg-white py-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-950 border border-slate-200 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-extrabold text-slate-950 bg-amber-400 hover:bg-amber-500 rounded-xl shadow-md cursor-pointer transition-transform hover:scale-102"
            >
              {productToEdit ? 'Save & Update Product' : 'Publish Product to Storefront'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
