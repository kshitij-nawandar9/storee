import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ProductVariant } from '@/types';
import Img from '@/components/common/Img';
import { imageAtWidth } from '@/utils/images';

interface ProductGalleryProps {
  images: string[];
  productName: string;
  variants?: ProductVariant[];
  selectedVariant?: ProductVariant | null;
  onVariantSelect?: (variant: ProductVariant) => void;
}

export default function ProductGallery({ 
  images, 
  productName, 
  variants,
  selectedVariant,
  onVariantSelect 
}: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Update selected image when variant changes
  useEffect(() => {
    if (selectedVariant && variants) {
      const variantIndex = variants.findIndex((v) => v.id === selectedVariant.id);
      if (variantIndex >= 0) {
        setSelectedImage(variantIndex);
      }
    }
  }, [selectedVariant, variants]);

  // Use variant images if available, otherwise use provided images
  const displayImages = variants && variants.length > 0 
    ? variants.map((v) => v.image).filter(Boolean)
    : images;

  if (!displayImages || displayImages.length === 0) {
    return (
      <div className="flex items-center justify-center bg-gray-100 rounded-xl h-96 border-2 border-dashed border-gray-300">
        <span className="text-gray-400">No image available</span>
      </div>
    );
  }

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % displayImages.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  const handleImageSelect = (index: number) => {
    setSelectedImage(index);
    // If variants exist and onVariantSelect is provided, select the variant
    if (variants && variants[index] && onVariantSelect) {
      onVariantSelect(variants[index]);
    }
  };

  return (
    <div className="product-gallery">
      {/* Main Image */}
      <div
        className="main-image cursor-pointer mb-4 overflow-hidden rounded-xl bg-gray-100 group relative"
        onClick={() => setIsModalOpen(true)}
      >
        <Img
          src={displayImages[selectedImage]}
          alt={productName}
          sizes="(min-width: 768px) 50vw, 100vw"
          className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300 flex items-center justify-center">
          <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium bg-black/50 px-4 py-2 rounded-lg">
            Click to enlarge
          </span>
        </div>
        
        {/* Navigation Arrows - Desktop */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6 text-gray-800" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6 text-gray-800" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Gallery */}
      {displayImages.length > 1 && (
        <div className="thumbnail-grid grid grid-cols-4 gap-3">
          {displayImages.map((img, index) => (
            <button
              key={index}
              onClick={() => handleImageSelect(index)}
              className={`thumbnail p-1 border-2 rounded-lg transition-all overflow-hidden ${
                selectedImage === index
                  ? 'border-primary-500 ring-2 ring-primary-200 shadow-md'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <img
                src={imageAtWidth(img, 200)}
                alt={`${productName} ${index + 1}`}
                className="w-full h-20 object-cover rounded"
                loading="lazy"
                decoding="async"
              />
            </button>
          ))}
        </div>
      )}

      {/* Modal View */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative max-w-5xl max-h-screen bg-white rounded-2xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-800 hover:text-gray-600 p-2 rounded-full bg-white/90 hover:bg-white transition-all shadow-lg z-10"
              aria-label="Close image gallery"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="relative">
              <Img
                src={displayImages[selectedImage]}
                alt={productName}
                sizes="(min-width: 768px) 70vw, 95vw"
                className="max-w-full max-h-[80vh] object-contain mx-auto rounded-lg"
                decoding="async"
              />
              
              {displayImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-800" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-800" />
                  </button>
                </>
              )}
            </div>
            
            {displayImages.length > 1 && (
              <div className="flex gap-3 mt-6 justify-center overflow-x-auto pb-2">
                {displayImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => handleImageSelect(index)}
                    className={`w-20 h-20 flex-shrink-0 p-1 border-2 rounded-lg transition-all ${
                      selectedImage === index
                        ? 'border-primary-500 ring-2 ring-primary-200 shadow-md'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <img
                      src={imageAtWidth(img, 200)}
                      alt=""
                      className="w-full h-full object-cover rounded"
                      loading="lazy"
                      decoding="async"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
