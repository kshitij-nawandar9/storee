import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ShoppingBag } from 'lucide-react';
import Img from '@/components/common/Img';
import { PRODUCTS_DATA } from '@/data/products';
import { useCart } from '@/hooks/useCart';
import { trackEvent } from '@/services/analytics';
import { NAME_MAX, saveKidName, saveLastPick, useRewards } from '@/utils/rewards';

const NAVY = '#1f2a44';

/** A bag photo with a luggage-style name tag hanging off it. The name pops each time it changes. */
export function NameTagPreview({ image, name, color = '#C4756E', size = 'md' }: { image: string; name: string; color?: string; size?: 'sm' | 'md' }) {
  const small = size === 'sm';
  return (
    <div className="relative mx-auto overflow-hidden rounded-2xl" style={{ width: small ? 150 : 210, aspectRatio: '4 / 5', background: '#F8EDDA' }}>
      <Img src={image} alt="" sizes="210px" className="h-full w-full object-cover" />
      <div className="tag-swing absolute right-3 top-0 flex flex-col items-center" aria-hidden="true">
        <span className="block h-6 w-[2px]" style={{ background: '#8a6e38' }} />
        <div
          className="relative rounded-xl px-3 pb-2 pt-4 text-center"
          style={{ minWidth: small ? 72 : 92, background: '#FFFDF9', border: `2.5px solid ${color}`, boxShadow: '0 10px 18px -8px rgba(31,42,68,0.5)' }}
        >
          <span className="absolute left-1/2 top-1.5 h-2.5 w-2.5 -translate-x-1/2 rounded-full" style={{ background: '#F8EDDA', boxShadow: `inset 0 0 0 2px ${color}` }} />
          <span key={name} className="font-hand name-pop leading-none" style={{ color: NAVY, fontSize: small ? 20 : 26 }}>
            {name || 'your name'}
          </span>
        </div>
      </div>
    </div>
  );
}

interface NameTagMomentProps {
  slug: string;
  print: string;
  image: string;
  color?: string;
  /** Called after the bag is added, e.g. to close the reveal. */
  onAdded?: () => void;
}

/**
 * "Who's it for?" — type a name, watch it appear on the bag, add it to the cart in one tap.
 * The name uses the free customisation every Storee bag already offers.
 */
export default function NameTagMoment({ slug, print, image, color, onAdded }: NameTagMomentProps) {
  const { kidName } = useRewards();
  const { addItem } = useCart();
  const [name, setName] = useState(kidName);
  const [added, setAdded] = useState(false);

  // Remember this bag so the homepage album can keep showing the name tag
  useEffect(() => {
    saveLastPick({ slug, print, image });
  }, [slug, print, image]);

  const product = PRODUCTS_DATA.find((p) => p.slug === slug);
  const variant = product?.variants?.find((v) => v.colorName === print);
  if (!product || product.isCustomisable === false) return null;

  const clean = name.trim();

  const add = () => {
    if (!clean) return;
    addItem(product, 1, variant, clean);
    saveKidName(clean);
    setAdded(true);
    trackEvent('name_tag_added', { product_slug: slug, print });
  };

  return (
    <div className="mt-5 rounded-3xl p-4 text-left" style={{ background: '#FDF6EC', border: '1px solid #F0E0C6' }}>
      <p className="text-center font-serif text-xl" style={{ color: '#2a2220' }}>Who's it for?</p>
      <p className="mb-3 text-center text-xs" style={{ color: '#6b5f58' }}>
        Every Storee bag can carry a name, free. {clean ? `Here's how ${clean}'s would look.` : 'Type one to see it.'}
      </p>

      <NameTagPreview image={image} name={clean} color={color} />

      <label className="mt-4 block">
        <span className="sr-only">Name for the tag</span>
        <input
          type="text"
          value={name}
          maxLength={NAME_MAX}
          onChange={(e) => {
            setName(e.target.value);
            setAdded(false);
            saveKidName(e.target.value); // remembered even if they close without adding
          }}
          placeholder="Type a name"
          className="w-full rounded-2xl px-4 py-3 text-center text-base font-semibold outline-none transition-shadow focus:ring-2 focus:ring-[#C4756E]"
          style={{ background: '#FFFDF9', border: '1.5px solid #F0E0C6', color: NAVY }}
          autoComplete="off"
        />
        <span className="mt-1 block text-right text-[0.65rem]" style={{ color: '#b0aaa3' }}>{name.length}/{NAME_MAX}</span>
      </label>

      {added ? (
        <Link
          to="/cart"
          onClick={onAdded}
          className="bounce-tap mt-2 flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold"
          style={{ background: '#4f7a4e', color: '#fff' }}
        >
          <Check className="h-4 w-4" /> {clean}'s bag is in your cart · view
        </Link>
      ) : (
        <button
          type="button"
          onClick={add}
          disabled={!clean}
          className="btn-primary bounce-tap mt-2 w-full disabled:opacity-50"
        >
          <ShoppingBag className="h-4 w-4" /> {clean ? `Add ${clean}'s ${product.name.toLowerCase()}` : 'Type a name to add it'}
        </button>
      )}
    </div>
  );
}
