import { Link } from 'react-router-dom';
import type { Product } from '@/types';
import { useCart } from '@/hooks/useCart';
import { getSalePrice } from '@/utils/constants';
import toast from 'react-hot-toast';
import { ShoppingBag, Sparkles, Heart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  const defaultVariant = product.variants?.find((v) => v.isDefault) ?? product.variants?.[0];
  const primaryImage =
    defaultVariant?.image ||
    product.images?.find((img) => img.isPrimary)?.url ||
    product.images?.[0]?.url;

  const isComingSoon = !product.images || product.images.length === 0 || product.stock === 0;

  const displayPrice = defaultVariant?.price ?? product.basePrice;
  const salePrice = getSalePrice(displayPrice);
  const effectivePrice = salePrice ?? displayPrice;
  const formatINR = (p: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p / 100);
  const formattedPrice = formatINR(effectivePrice);
  const formattedOriginal = salePrice ? formatINR(displayPrice) : null;

  const variantCount = product.variants?.length ?? 0;

  return (
    <div
      className="group flex flex-col rounded-2xl overflow-hidden card-tilt"
      style={{
        background: '#FFFDF9',
        boxShadow: '0 2px 12px -3px rgba(59,50,48,0.06)',
      }}
    >
      <Link to={`/products/${product.slug}`} className="block flex-1">

        {/* Image */}
        <div className="relative overflow-hidden" style={{ aspectRatio: '4/5', background: '#F8EDDA' }}>
          <img
            src={primaryImage || '/placeholder.jpg'}
            alt={product.name}
            className="product-img w-full h-full object-cover"
          />

          {/* Warm overlay on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'linear-gradient(to top, rgba(196,117,110,0.12) 0%, transparent 40%)' }} />

          {/* ✨ Sparkle appears top-left on hover */}
          <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-100 scale-75">
            <span className="text-base drop-shadow-sm" style={{ filter: 'drop-shadow(0 0 4px rgba(201,169,110,0.4))' }}>✨</span>
          </div>

          {/* Coming Soon */}
          {isComingSoon && (
            <div className="absolute top-3 left-3">
              <span className="badge badge-rose text-[0.6rem] flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Coming Soon
              </span>
            </div>
          )}

          {/* Variant count pill */}
          {variantCount > 1 && (
            <div className="absolute top-3 right-3">
              <span
                className="text-[0.6rem] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(253,246,236,0.88)', color: '#C4756E', backdropFilter: 'blur(4px)' }}
              >
                {variantCount} prints
              </span>
            </div>
          )}

          {/* Quick Add */}
          {!isComingSoon && (
            <div className="absolute bottom-3 left-3 right-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addItem(product, 1, defaultVariant ?? undefined);
                  toast(() => (
                    <span className="flex items-center gap-2 text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      <Heart className="w-4 h-4 heart-pop" style={{ color: '#C4756E', fill: '#C4756E' }} />
                      <span>Added to your bag! 🎉</span>
                    </span>
                  ), {
                    style: { borderRadius: '14px', background: '#FFFDF9', color: '#2a2220', border: '1px solid #F0E0C6', boxShadow: '0 8px 24px -6px rgba(59,50,48,0.12)' },
                    duration: 2000,
                  });
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 bounce-tap"
                style={{
                  background: '#C4756E',
                  color: '#fff',
                  boxShadow: '0 4px 16px -4px rgba(196,117,110,0.35)',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Add to Bag
              </button>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="px-3.5 pt-3 pb-4 sm:px-4 sm:pt-3.5 sm:pb-5">
          <h3 className="font-serif font-medium text-[0.9rem] sm:text-base leading-snug mb-1.5 squiggle-underline line-clamp-1" style={{ color: '#2a2220' }}>
            {product.name}
          </h3>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              <span className="font-semibold text-base sm:text-lg" style={{ color: salePrice ? '#C4756E' : '#2a2220' }}>
                {formattedPrice}
              </span>
              {formattedOriginal && (
                <span className="text-xs line-through" style={{ color: '#b0aaa3' }}>{formattedOriginal}</span>
              )}
            </div>
            {isComingSoon ? (
              <span className="text-[0.7rem] font-medium" style={{ color: '#b0aaa3' }}>Notify me ✨</span>
            ) : (
              <span className="text-[0.7rem] sm:text-xs font-medium" style={{ color: '#C4756E' }}>
                <span className="inline-flex items-center gap-0.5 arrow-nudge">View <span className="arrow-icon inline-block">&rarr;</span></span>
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
