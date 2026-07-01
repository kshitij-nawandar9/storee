import ErrorMessage from '@/components/common/ErrorMessage';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ColorSelector from '@/components/product/ColorSelector';
import PriceDisplay from '@/components/product/PriceDisplay';
import QuantitySelector from '@/components/product/QuantitySelector';
import { useCart } from '@/hooks/useCart';
import { useProduct } from '@/hooks/useProducts';
import type { ProductVariant } from '@/types';
import { FREE_SHIPPING_MESSAGE, RETURN_POLICY_MESSAGE, SHIPPING_INFO, getSalePrice } from '@/utils/constants';
import { CheckCircle, ChevronLeft, ChevronRight, Pen, Ruler, RotateCcw, Shield, ShoppingCart, Truck, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { product, loading, error } = useProduct(slug || '');
  const { addItem } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [hoveredVariant, setHoveredVariant] = useState<ProductVariant | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [customiseEnabled, setCustomiseEnabled] = useState(false);
  const [customText, setCustomText] = useState('');

  const defaultVariant = product?.variants?.find((v) => v.isDefault) || product?.variants?.[0];
  const currentVariant = selectedVariant || defaultVariant;

  useEffect(() => {
    if (!selectedVariant && defaultVariant) setSelectedVariant(defaultVariant);
  }, [selectedVariant, defaultVariant]);

  useEffect(() => {
    if (currentVariant && product?.variants && product.variants.length > 0) {
      const index = product.variants.findIndex((v) => v.id === currentVariant.id);
      if (index >= 0) setModalImageIndex(index);
    }
  }, [currentVariant, product?.variants]);

  const handleAddToCart = () => {
    if (!product) return;
    const supportsCustomisation = product.isCustomisable !== false;
    addItem(product, quantity, currentVariant ?? undefined, supportsCustomisation && customiseEnabled && customText.trim() ? customText.trim() : undefined);
    const printLabel = currentVariant ? ` in ${currentVariant.colorName}` : '';
    toast.success(`${product.name}${printLabel} is in your bag! 🎉`, {
      icon: '🤍',
      style: { borderRadius: '14px', background: '#FFFDF9', color: '#2a2220', border: '1px solid #F0E0C6', fontFamily: "'DM Sans', sans-serif", boxShadow: '0 8px 24px -6px rgba(59,50,48,0.12)' },
    });
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!product) return <ErrorMessage message="Product not found" />;

  const isComingSoon = !product.images || product.images.length === 0 || product.stock === 0;
  const variantImages = product.variants?.map((v) => v.image).filter(Boolean) || [];
  const productImageUrls = product.images?.map((img) => typeof img === 'string' ? img : img.url).filter(Boolean) || [];
  const displayImages = variantImages.length > 0 ? variantImages : productImageUrls;
  const displayImage = (hoveredVariant?.image || currentVariant?.image || displayImages[0]) ?? '/placeholder.jpg';
  const supportsCustomisation = product.isCustomisable !== false;

  return (
    <div className="min-h-screen" style={{ background: '#FDF6EC' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14">

          {/* ── LEFT: Image ── */}
          <div className="animate-fade-in">
            <div
              className="relative overflow-hidden rounded-2xl cursor-pointer group aspect-square"
              style={{ background: '#F8EDDA' }}
              onClick={() => {
                if (displayImages.length > 0) {
                  const idx = displayImages.findIndex((img) => img === displayImage);
                  setModalImageIndex(idx >= 0 ? idx : 0);
                  setIsImageModalOpen(true);
                }
              }}
            >
              {displayImage ? (
                <img
                  src={displayImage}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                  key={displayImage}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.jpg'; }}
                />
              ) : (
                <div className="aspect-square flex items-center justify-center" style={{ color: '#b0aaa3' }}>No image available</div>
              )}
            </div>
          </div>

          {/* ── RIGHT: Info ── */}
          <div className="animate-slide-up">
            <div className="md:sticky md:top-24">

              {/* Product name */}
              <h1 className="font-serif font-medium leading-[1.15] mb-4" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: '#2a2220' }}>
                {product.name}
              </h1>

              {/* Price */}
              <div className="mb-5">
                <PriceDisplay regularPrice={currentVariant?.price || product.basePrice} salePrice={getSalePrice(currentVariant?.price || product.basePrice, product)} />
              </div>

              {/* Description */}
              <p className="text-sm leading-relaxed mb-5" style={{ color: '#6b635b' }}>
                {product.description}
              </p>

              {/* Size */}
              {product.size && (
                <div className="flex items-center gap-2 mb-7 text-sm" style={{ color: '#4a443e' }}>
                  <Ruler className="w-4 h-4 flex-shrink-0" style={{ color: '#C4756E' }} />
                  <span><strong>Size:</strong> {product.size}</span>
                </div>
              )}

              {/* Variant Selector */}
              {product.variants && product.variants.length > 0 && (
                <div className="mb-7">
                  <ColorSelector
                    variants={product.variants}
                    selectedVariant={selectedVariant}
                    onVariantSelect={setSelectedVariant}
                    onVariantHover={setHoveredVariant}
                    productName={product.name}
                  />
                </div>
              )}

              {/* Quantity */}
              <div className="mb-7">
                <QuantitySelector quantity={quantity} maxQuantity={999} onQuantityChange={setQuantity} />
              </div>

              {/* Free Customisation */}
              {supportsCustomisation && (
                <div className="mb-7">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Pen className="w-4 h-4" style={{ color: '#C4756E' }} />
                      <span className="text-sm font-medium" style={{ color: '#2a2220', fontFamily: "'DM Sans', sans-serif" }}>Free Customisation</span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={customiseEnabled}
                      onClick={() => {
                        setCustomiseEnabled(!customiseEnabled);
                        if (customiseEnabled) setCustomText('');
                      }}
                      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200"
                      style={{ background: customiseEnabled ? '#C4756E' : '#d1cdc8' }}
                    >
                      <span
                        className="inline-block h-4 w-4 rounded-full bg-white transition-transform duration-200"
                        style={{ transform: customiseEnabled ? 'translateX(1.375rem)' : 'translateX(0.25rem)' }}
                      />
                    </button>
                  </div>
                  {customiseEnabled && (
                    <div className="mt-3 animate-fade-in">
                      <input
                        type="text"
                        maxLength={10}
                        value={customText}
                        onChange={(e) => setCustomText(e.target.value)}
                        placeholder="Enter text (max 10 chars)"
                        className="w-full text-sm py-2.5 px-4 rounded-xl outline-none transition-all duration-200"
                        style={{
                          background: '#FFFDF9',
                          border: '1.5px solid #F0E0C6',
                          color: '#2a2220',
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = '#C4756E'; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = '#F0E0C6'; }}
                      />
                      <p className="text-xs mt-1.5 text-right" style={{ color: '#b0aaa3' }}>
                        {customText.length}/10
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={isComingSoon}
                className={`w-full text-sm py-3.5 flex items-center justify-center gap-2 mb-7 font-semibold rounded-full transition-all duration-200 bounce-tap ${
                  isComingSoon ? 'cursor-not-allowed' : ''
                }`}
                style={{
                  background: isComingSoon ? '#d1cdc8' : '#C4756E',
                  color: isComingSoon ? '#8a827a' : '#fff',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {isComingSoon ? (
                  'Coming Soon — Stay Tuned! ✨'
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    Add to Bag
                  </>
                )}
              </button>

              {/* Trust badges — horizontal */}
              <div className="flex flex-wrap gap-x-5 gap-y-2 mb-7 pb-7" style={{ borderBottom: '1px solid #F8EDDA' }}>
                {[
                  { icon: Truck, label: FREE_SHIPPING_MESSAGE },
                  { icon: Shield, label: 'Secure Payment' },
                  { icon: RotateCcw, label: RETURN_POLICY_MESSAGE },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-1.5 text-xs" style={{ color: '#8a827a' }}>
                    <Icon className="w-3.5 h-3.5" style={{ color: '#C4756E' }} />
                    <span>{label}</span>
                  </div>
                ))}
              </div>

              {/* Features */}
              {product.features && product.features.length > 0 && (
                <div>
                  <h3 className="font-serif text-base font-medium mb-4" style={{ color: '#2a2220' }}>Why you'll love it 🌸</h3>
                  <div className="space-y-2.5">
                    {product.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2.5">
                        <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#8BA88A' }} />
                        <span className="text-sm leading-relaxed" style={{ color: '#4a443e' }}>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Shipping info */}
              <div className="mt-7 p-4 rounded-xl" style={{ background: 'rgba(139,168,138,0.06)', border: '1px solid rgba(139,168,138,0.12)' }}>
                <div className="flex items-start gap-3">
                  <Truck className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#8BA88A' }} />
                  <div>
                    <p className="text-xs font-semibold" style={{ color: '#2a2220' }}>{FREE_SHIPPING_MESSAGE}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#6b635b' }}>{SHIPPING_INFO}</p>
                    <p className="font-hand text-sm mt-1" style={{ color: '#8BA88A' }}>your mailbox will thank you</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ── Image Modal ── */}
      {isImageModalOpen && displayImages.length > 0 && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in"
          style={{ background: 'rgba(45,42,38,0.95)' }}
          onClick={() => setIsImageModalOpen(false)}
        >
          <div
            className="relative max-w-4xl max-h-screen rounded-2xl p-5"
            style={{ background: '#FFFDF9' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsImageModalOpen(false)}
              className="absolute top-3 right-3 p-2 rounded-full z-10 transition-colors"
              style={{ background: '#F8EDDA', color: '#2a2220' }}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative">
              <img
                src={displayImages[modalImageIndex]}
                alt={product.name}
                className="max-w-full max-h-[78vh] object-contain mx-auto rounded-xl"
                decoding="async"
              />

              {displayImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); setModalImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length); }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all"
                    style={{ background: 'rgba(253,246,236,0.9)', color: '#2a2220', boxShadow: '0 2px 8px -2px rgba(0,0,0,0.1)' }}
                    aria-label="Previous"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setModalImageIndex((prev) => (prev + 1) % displayImages.length); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all"
                    style={{ background: 'rgba(253,246,236,0.9)', color: '#2a2220', boxShadow: '0 2px 8px -2px rgba(0,0,0,0.1)' }}
                    aria-label="Next"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {displayImages.length > 1 && (
              <div className="flex gap-2 mt-4 justify-center overflow-x-auto pb-1">
                {displayImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={(e) => { e.stopPropagation(); setModalImageIndex(index); }}
                    className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden transition-all"
                    style={{
                      border: modalImageIndex === index ? '2px solid #C4756E' : '2px solid #F8EDDA',
                      opacity: modalImageIndex === index ? 1 : 0.6,
                    }}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
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
