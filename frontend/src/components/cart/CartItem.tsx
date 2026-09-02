import { Pen, Trash2 } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import type { CartItem as CartItemType } from '@/types';
import QuantitySelector from '@/components/product/QuantitySelector';
import PriceDisplay from '@/components/product/PriceDisplay';
import { getSalePrice } from '@/utils/constants';
import { imageAtWidth } from '@/utils/images';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { removeItem, updateQuantity } = useCart();
  const { product, quantity, variant } = item;

  const handleQuantityChange = (newQuantity: number) => {
    updateQuantity(product.id, newQuantity, variant?.id);
  };

  const handleRemove = () => {
    removeItem(product.id, variant?.id);
  };

  const displayImage =
    variant?.image ||
    product.images?.find((img) => img.isPrimary)?.url ||
    product.images?.[0]?.url;

  const unitPrice = variant?.price ?? product.basePrice;
  const displayPrice = unitPrice * quantity;
  const saleDisplayPrice = getSalePrice(unitPrice, product);
  const saleTotalPrice = saleDisplayPrice ? saleDisplayPrice * quantity : undefined;

  return (
    <div className="flex gap-4 sm:gap-5 p-4 sm:p-5">
      {/* Image */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-xl overflow-hidden" style={{ background: '#F8EDDA' }}>
        <img
          src={displayImage ? imageAtWidth(displayImage, 200) : '/placeholder.jpg'}
          alt={variant ? `${product.name} - ${variant.colorName}` : product.name}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>

      {/* Info + Price */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0">
            <h3 className="font-serif font-medium text-sm sm:text-base mb-0.5" style={{ color: '#2a2220' }}>{product.name}</h3>
            {variant && (
              <p className="text-xs font-medium" style={{ color: '#C4756E' }}>{variant.colorName}</p>
            )}
            {item.customText && (
              <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: '#8BA88A' }}>
                <Pen className="w-3 h-3" /> "{item.customText}"
              </p>
            )}
          </div>
          <button
            onClick={handleRemove}
            className="p-1.5 rounded-lg transition-all duration-200 flex-shrink-0"
            style={{ color: '#C4756E' }}
            aria-label="Remove item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-2">
          <PriceDisplay regularPrice={displayPrice} salePrice={saleTotalPrice} size="sm" />
        </div>
        <div className="mt-2">
          <QuantitySelector quantity={quantity} maxQuantity={999} onQuantityChange={handleQuantityChange} />
        </div>
      </div>
    </div>
  );
}
