import { Link } from 'react-router-dom';
import type { Product } from '@/types';
import { useCart } from '@/hooks/useCart';
import toast from 'react-hot-toast';
import { ShoppingBag, Sparkles } from 'lucide-react';

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
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(displayPrice / 100);

  return (
    <div className="card card-hover group flex flex-col">
      <Link to={`/products/${product.slug}`} className="block flex-1">

        {/* Image Container */}
        <div className="relative overflow-hidden rounded-t-3xl bg-warm-50" style={{ aspectRatio: '4/5' }}>
          <img
            src={primaryImage || '/placeholder.jpg'}
            alt={product.name}
            className="product-img w-full h-full object-cover"
          />

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary-900/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {isComingSoon && (
              <span className="badge-gold badge text-xs flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Coming Soon
              </span>
            )}
          </div>

          {/* Quick add — slides up on hover */}
          {!isComingSoon && (
            <div className="absolute bottom-3 right-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addItem(product, 1, defaultVariant ?? undefined);
                  toast.success(`Added to cart`, {
                    icon: '🛍️',
                    style: { borderRadius: '12px', background: '#1c3243', color: '#fff' },
                  });
                }}
                className="flex items-center gap-1.5 bg-white text-primary-700 px-3 py-2 rounded-full text-xs font-semibold shadow-card hover:bg-primary-600 hover:text-white transition-all duration-200"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Quick Add
              </button>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4 pb-5">
          <h3 className="font-sans font-semibold text-base text-primary-900 group-hover:text-primary-600 transition-colors duration-200 line-clamp-2 leading-snug mb-1">
            {product.name}
          </h3>
          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-3">
            {product.description}
          </p>

          <div className="flex items-center justify-between">
            <span className="font-bold text-lg text-primary-800">
              {formattedPrice}
            </span>
            {isComingSoon ? (
              <span className="text-xs text-gray-400 font-medium">Notify me</span>
            ) : (
              <span className="text-xs font-semibold text-gold-500 group-hover:text-primary-600 transition-colors">
                Shop Now →
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
