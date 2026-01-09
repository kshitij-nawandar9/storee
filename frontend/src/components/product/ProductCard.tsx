import { Link } from 'react-router-dom';
import type { Product } from '@/types';
import PriceDisplay from './PriceDisplay';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const displayPrice = product.basePrice;
  const primaryImage =
    product.images?.find((img) => img.isPrimary) || product.images?.[0];

  return (
    <div className="card card-hover group">
      <Link to={`/products/${product.slug}`} className="block">
        <div className="relative overflow-hidden bg-gray-100">
          <img
            src={primaryImage?.url || '/placeholder.jpg'}
            alt={product.name}
            className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Quick Add Button - appears on hover */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Quick add to cart functionality can be added here
              }}
              className="bg-white text-primary-600 px-4 py-2 rounded-lg font-semibold shadow-lg hover:bg-primary-50 transition-colors flex items-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Quick Add
            </button>
          </div>
        </div>

        <div className="p-5">
          <h3 className="font-bold text-lg mb-2 line-clamp-2 text-gray-900 group-hover:text-primary-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          <div className="flex items-center justify-between">
            <PriceDisplay regularPrice={displayPrice} />
          </div>
        </div>
      </Link>
    </div>
  );
}
