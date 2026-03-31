import { Trash2 } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import type { CartItem as CartItemType } from '@/types';
import QuantitySelector from '@/components/product/QuantitySelector';
import PriceDisplay from '@/components/product/PriceDisplay';
import { getSalePrice } from '@/utils/constants';

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
  const saleDisplayPrice = getSalePrice(unitPrice);
  const saleTotalPrice = saleDisplayPrice ? saleDisplayPrice * quantity : undefined;

  return (
    <div className="flex gap-4 sm:gap-5 p-4 sm:p-5">
      {/* Image */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-xl overflow-hidden" style={{ background: '#F8EDDA' }}>
        <img
          src={displayImage || '/placeholder.jpg'}
          alt={variant ? `${product.name} - ${variant.colorName}` : product.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-serif font-medium text-sm sm:text-base mb-0.5" style={{ color: '#2a2220' }}>{product.name}</h3>
        {variant && (
          <p className="text-xs font-medium mb-2" style={{ color: '#C4756E' }}>{variant.colorName}</p>
        )}
        <QuantitySelector quantity={quantity} maxQuantity={999} onQuantityChange={handleQuantityChange} />
      </div>

      {/* Price + Remove */}
      <div className="flex flex-col items-end justify-between">
        <PriceDisplay regularPrice={displayPrice} salePrice={saleTotalPrice} />
        <button
          onClick={handleRemove}
          className="p-1.5 rounded-lg transition-all duration-200"
          style={{ color: '#C4756E' }}
          aria-label="Remove item"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
