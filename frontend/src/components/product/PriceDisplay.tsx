import { CURRENCY_SYMBOL } from '@/utils/constants';

interface PriceDisplayProps {
  regularPrice: number; // in paise
  salePrice?: number; // in paise
  size?: 'sm' | 'default';
}

export default function PriceDisplay({ regularPrice, salePrice, size = 'default' }: PriceDisplayProps) {
  const formatPrice = (price: number) => {
    return `${CURRENCY_SYMBOL}${(price / 100).toFixed(2)}`;
  };

  return (
    <div className="price-display">
      {salePrice && salePrice < regularPrice ? (
        <div>
          <div className={`flex items-center gap-2 ${size === 'sm' ? 'flex-wrap gap-1' : 'mb-1'}`}>
            <span className={`${size === 'sm' ? 'text-sm' : 'text-2xl'} font-bold text-red-600`}>
              {formatPrice(salePrice)}
            </span>
            <span className={`${size === 'sm' ? 'text-xs' : 'text-lg'} text-gray-500 line-through`}>
              {formatPrice(regularPrice)}
            </span>
            <span className={`${size === 'sm' ? 'text-[10px] px-1 py-0.5' : 'text-sm px-2 py-1'} bg-red-100 text-red-700 rounded`}>
              {Math.round(((regularPrice - salePrice) / regularPrice) * 100)}% OFF
            </span>
          </div>
        </div>
      ) : (
        <div>
          <span className={`${size === 'sm' ? 'text-sm' : 'text-2xl'} font-bold`}>{formatPrice(regularPrice)}</span>
        </div>
      )}
    </div>
  );
}
