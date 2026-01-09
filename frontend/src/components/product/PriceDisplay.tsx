import { CURRENCY_SYMBOL } from '@/utils/constants';

interface PriceDisplayProps {
  regularPrice: number; // in paise
  salePrice?: number; // in paise
}

export default function PriceDisplay({ regularPrice, salePrice }: PriceDisplayProps) {
  const formatPrice = (price: number) => {
    return `${CURRENCY_SYMBOL}${(price / 100).toFixed(2)}`;
  };

  return (
    <div className="price-display">
      {salePrice && salePrice < regularPrice ? (
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl font-bold text-red-600">
              {formatPrice(salePrice)}
            </span>
            <span className="text-lg text-gray-500 line-through">
              {formatPrice(regularPrice)}
            </span>
            <span className="text-sm bg-red-100 text-red-700 px-2 py-1 rounded">
              {Math.round(((regularPrice - salePrice) / regularPrice) * 100)}% OFF
            </span>
          </div>
          <p className="text-sm text-gray-600">Regular price</p>
        </div>
      ) : (
        <div>
          <span className="text-2xl font-bold">{formatPrice(regularPrice)}</span>
          <p className="text-sm text-gray-600 mt-1">Regular price</p>
        </div>
      )}
    </div>
  );
}
