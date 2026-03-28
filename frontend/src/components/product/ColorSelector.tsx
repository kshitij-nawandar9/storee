import { useState, useEffect } from 'react';
import type { ProductVariant } from '@/types';

interface ColorSelectorProps {
  variants: ProductVariant[];
  selectedVariant: ProductVariant | null;
  onVariantSelect: (variant: ProductVariant) => void;
  onVariantHover?: (variant: ProductVariant | null) => void;
  productName: string;
}

export default function ColorSelector({
  variants,
  selectedVariant,
  onVariantSelect,
  onVariantHover,
  productName,
}: ColorSelectorProps) {
  const [selected, setSelected] = useState<ProductVariant | null>(
    selectedVariant || variants.find((v) => v.isDefault) || variants[0] || null
  );
  const [hoveredName, setHoveredName] = useState<string | null>(null);

  useEffect(() => {
    if (selected) {
      onVariantSelect(selected);
    }
  }, [selected, onVariantSelect]);

  const handleColorSelect = (variant: ProductVariant) => {
    if (variant.isActive) {
      setSelected(variant);
      onVariantSelect(variant);
    }
  };

  return (
    <div className="color-selector">
      <h3 className="text-lg font-semibold mb-3">
        Select Variant:{' '}
        <span className="text-gray-600 font-normal">{hoveredName || selected?.colorName}</span>
      </h3>

      <div className="flex flex-wrap gap-3">
        {variants.map((variant) => {
          const isSelected = selected?.id === variant.id;

          return (
            <button
              key={variant.id}
              onClick={() => handleColorSelect(variant)}
              onMouseEnter={() => { if (variant.isActive) { onVariantHover?.(variant); setHoveredName(variant.colorName); } }}
              onMouseLeave={() => { onVariantHover?.(null); setHoveredName(null); }}
              disabled={!variant.isActive}
              className={`
                relative color-option flex flex-col items-center p-3 border-2 rounded-lg transition-all
                ${isSelected
                  ? 'border-primary-500 ring-2 ring-primary-200 shadow-md'
                  : 'border-gray-200 hover:border-gray-400'
                }
                ${!variant.isActive ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              title={variant.colorName}
            >
              {/* Variant Image Preview */}
              {variant.image && (
                <img
                  src={variant.image}
                  alt={`${productName} - ${variant.colorName}`}
                  className="w-16 h-16 object-cover rounded mb-1"
                />
              )}

              <span className="text-sm font-medium">{variant.colorName}</span>

              {isSelected && (
                <div className="absolute top-1 right-1">
                  <svg
                    className="w-5 h-5 text-primary-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
