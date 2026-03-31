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
    if (selected) onVariantSelect(selected);
  }, [selected, onVariantSelect]);

  const handleSelect = (variant: ProductVariant) => {
    if (variant.isActive) {
      setSelected(variant);
      onVariantSelect(variant);
    }
  };

  return (
    <div>
      <div className="mb-3 flex items-baseline gap-2">
        <p className="text-xs font-semibold" style={{ color: '#2a2220', fontFamily: "'DM Sans', sans-serif" }}>
          Pick your print ✨
        </p>
        <span className="font-hand text-lg font-medium" style={{ color: '#C4756E' }}>
          {hoveredName || selected?.colorName}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => {
          const isSelected = selected?.id === variant.id;

          return (
            <button
              key={variant.id}
              onClick={() => handleSelect(variant)}
              onMouseEnter={() => { if (variant.isActive) { onVariantHover?.(variant); setHoveredName(variant.colorName); } }}
              onMouseLeave={() => { onVariantHover?.(null); setHoveredName(null); }}
              disabled={!variant.isActive}
              className="relative overflow-hidden rounded-xl transition-all duration-200"
              style={{
                width: '72px',
                height: '72px',
                border: isSelected ? '2.5px solid #C4756E' : '2px solid #F8EDDA',
                opacity: variant.isActive ? 1 : 0.4,
                cursor: variant.isActive ? 'pointer' : 'not-allowed',
                boxShadow: isSelected ? '0 2px 10px -3px rgba(196,117,110,0.25)' : 'none',
              }}
              title={variant.colorName}
            >
              {variant.image && (
                <img
                  src={variant.image}
                  alt={`${productName} - ${variant.colorName}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              )}

              {isSelected && (
                <div className="absolute inset-0 flex items-end justify-center" style={{ background: 'linear-gradient(to top, rgba(196,117,110,0.3) 0%, transparent 50%)' }}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center mb-1" style={{ background: '#C4756E' }}>
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
