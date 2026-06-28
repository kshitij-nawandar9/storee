import { useState } from 'react';
import { Gift, Pen, ShoppingBag, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import type { RakhiHamper } from '@/data/hampers';
import type { ProductVariant } from '@/types';
import { useCart } from '@/hooks/useCart';

interface HamperCardProps {
  hamper: RakhiHamper;
  index?: number;
}

const formatINR = (price: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price / 100);

export default function HamperCard({ hamper, index = 0 }: HamperCardProps) {
  const { addItem } = useCart();
  const activeVariants = hamper.variants?.filter((variant) => variant.isActive) ?? [];
  const defaultVariant = activeVariants.find((variant) => variant.isDefault) ?? activeVariants[0];
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(defaultVariant);
  const [preview, setPreview] = useState(defaultVariant?.image || hamper.images[0]?.url || '/placeholder.jpg');
  const [customName, setCustomName] = useState('');
  const hasKeychain = hamper.includes.some((item) => item.toLowerCase().includes('keychain'));

  const handleVariantSelect = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setPreview(variant.image);
  };

  const handleAdd = () => {
    const customText = hasKeychain && customName.trim() ? customName.trim() : undefined;
    addItem(hamper, 1, selectedVariant, customText);
    toast.success(`${hamper.name} added to your bag`, {
      icon: '🎁',
      style: {
        borderRadius: '14px',
        background: '#FFFDF9',
        color: '#2a2220',
        border: '1px solid #F0E0C6',
        fontFamily: "'DM Sans', sans-serif",
        boxShadow: '0 8px 24px -6px rgba(59,50,48,0.12)',
      },
    });
  };

  return (
    <article
      className="group flex h-full flex-col overflow-hidden rounded-2xl animate-fade-in"
      style={{
        background: '#FFFDF9',
        boxShadow: '0 2px 18px -5px rgba(59,50,48,0.09)',
        animationDelay: `${index * 0.05}s`,
      }}
    >
      <div className="relative overflow-hidden" style={{ aspectRatio: '4/5', background: '#F8EDDA' }}>
        <img
          src={preview}
          alt={hamper.name}
          className="product-img w-full h-full object-cover"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/placeholder.jpg';
          }}
        />
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: 'linear-gradient(to top, rgba(42,34,32,0.42) 0%, rgba(42,34,32,0.03) 55%, transparent 100%)' }}
        />

        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
          <span
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.65rem] font-bold"
            style={{ background: '#FFFDF9', color: '#2a2220', boxShadow: '0 2px 10px -3px rgba(0,0,0,0.12)' }}
          >
            <Gift className="w-3 h-3" style={{ color: hamper.accent }} />
            {hamper.budgetLabel}
          </span>
          <span
            className="rounded-full px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-wide"
            style={{ background: hamper.accent, color: '#fff' }}
          >
            Limited
          </span>
        </div>

      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="mb-2 flex min-h-[76px] items-start justify-between gap-3">
          <div>
            <p className="mb-1 text-[0.65rem] font-bold uppercase tracking-[0.14em]" style={{ color: hamper.accent }}>
              Rakhi hamper
            </p>
            <h3 className="font-serif text-lg font-medium leading-tight" style={{ color: '#2a2220' }}>
              {hamper.name}
            </h3>
          </div>
          <span className="font-serif text-xl font-semibold leading-none" style={{ color: '#C4756E' }}>
            {formatINR(hamper.basePrice)}
          </span>
        </div>

        <p className="mb-4 min-h-[46px] text-sm leading-relaxed" style={{ color: '#6b5f58' }}>
          {hamper.giftNote}
        </p>

        <div className="mb-4 flex min-h-[66px] flex-wrap content-start gap-1.5">
          {hamper.includes.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.65rem] font-semibold"
              style={{ background: 'rgba(196,117,110,0.07)', color: '#4a443e' }}
            >
              <Sparkles className="w-3 h-3" style={{ color: hamper.accent }} />
              {item}
            </span>
          ))}
        </div>

        {activeVariants.length > 0 && (
          <div className="mb-4 min-h-[58px]">
            <div className="mb-2 flex items-baseline gap-2">
              <p className="text-xs font-semibold" style={{ color: '#2a2220' }}>
                Pick print
              </p>
              <span className="font-hand text-base leading-none" style={{ color: hamper.accent }}>
                {selectedVariant?.colorName}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {activeVariants.map((variant) => {
                const isSelected = selectedVariant?.id === variant.id;

                return (
                  <button
                    key={variant.id}
                    type="button"
                    onMouseEnter={() => handleVariantSelect(variant)}
                    onFocus={() => handleVariantSelect(variant)}
                    onClick={() => handleVariantSelect(variant)}
                    className="relative h-7 w-7 overflow-hidden rounded-lg transition-all duration-200"
                    style={{
                      border: isSelected ? `2px solid ${hamper.accent}` : '1.5px solid #F0E0C6',
                      background: variant.colorCode,
                      boxShadow: isSelected ? '0 4px 12px -6px rgba(42,34,32,0.35)' : 'none',
                    }}
                    title={variant.colorName}
                    aria-label={`Choose ${variant.colorName} print`}
                  >
                    <img src={variant.image} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
                    {isSelected && (
                      <span
                        className="absolute inset-0"
                        style={{ boxShadow: 'inset 0 0 0 2px rgba(255,253,249,0.88)' }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {hasKeychain && (
          <label className="mb-4 block min-h-[78px]">
            <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#2a2220' }}>
              <Pen className="w-3.5 h-3.5" style={{ color: hamper.accent }} />
              Name on keychain
            </span>
            <input
              type="text"
              maxLength={10}
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g. Atharv"
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all"
              style={{
                background: '#FDF6EC',
                border: '1.5px solid #F0E0C6',
                color: '#2a2220',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = hamper.accent;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#F0E0C6';
              }}
            />
          </label>
        )}

        {!hasKeychain && (
          <div className="mb-4 block min-h-[78px]">
            <span
              aria-hidden="true"
              className="pointer-events-none mb-1.5 flex items-center gap-1.5 text-xs font-semibold opacity-0"
            >
              <Pen className="w-3.5 h-3.5" />
              Name on keychain
            </span>
            <div
              className="flex min-h-[44px] items-center rounded-xl px-3 py-2.5 text-xs font-semibold leading-relaxed"
              style={{ background: '#FDF6EC', border: '1.5px solid #F0E0C6', color: '#6b5f58' }}
            >
              Gift-ready combo, no custom name needed.
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleAdd}
          className="bounce-tap mt-auto flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold transition-all duration-200"
          style={{ background: '#3d2b2b', color: '#FDF6EC' }}
        >
          <ShoppingBag className="h-4 w-4" />
          Add Hamper to Bag
        </button>
      </div>
    </article>
  );
}
