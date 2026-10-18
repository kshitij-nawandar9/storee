import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { ArrowRight, X } from 'lucide-react';
import Img from '@/components/common/Img';
import StickerSheet from '@/components/rewards/StickerSheet';
import { BADGES, PRINT_COLORS, printSwatch, type BadgeId, type PrintName } from '@/utils/rewards';
import { DIWALI_ORDER_BY_LABEL, FREE_SHIPPING_MESSAGE, SALE_DISCOUNT, SALE_NAME, isBeforeDiwaliCutoff, isSaleActive } from '@/utils/constants';

export interface RewardPick {
  title: string;
  image: string;
  to: string;
}

interface RewardRevealProps {
  open: boolean;
  onClose: () => void;
  headline: string;
  badges: BadgeId[];
  newPrints?: PrintName[];
  pick?: RewardPick;
  /** This win unlocked a free sticker sheet for the next order. */
  stickerSheet?: boolean;
}

export type Phase = 'box' | 'opening' | 'done';

const CONFETTI_COLORS = ['#C4756E', '#C9A96E', '#8BA88A', '#F2B43C', '#D4A0D4', '#5BA3A0'];
const CONFETTI = Array.from({ length: 40 }, (_, i) => {
  const angle = (i / 40) * Math.PI * 2;
  const distance = 130 + (i % 4) * 45;
  return { color: CONFETTI_COLORS[i % 6], x: Math.cos(angle) * distance, y: Math.sin(angle) * distance - 50, r: (i % 2 ? 1 : -1) * (200 + i * 15) };
});

/** Where the n-th of `count` prizes lands: a gentle arc above the box. */
function arcSpot(i: number, count: number) {
  const mid = (count - 1) / 2;
  const offset = i - mid;
  const spacing = count > 5 ? 50 : 62;
  return { x: offset * spacing, y: offset * offset * 5 - 18, r: offset * 7 };
}

/** A wrapped present drawn in CSS: rumbles while waiting, then the lid bursts off. `idle` makes it a gentle wiggle. */
export function GiftBox({ phase, idle = false }: { phase: Phase; idle?: boolean }) {
  return (
    <div
      className={`absolute left-1/2 top-1/2 ${phase === 'box' ? 'gift-rumble' : 'box-drop'}`}
      style={{ width: 128, height: 118, ...(idle ? { animationDuration: '2.6s' } : {}) }}
      aria-hidden="true"
    >
      {/* body */}
      <div
        className="absolute inset-x-0 bottom-0 rounded-b-2xl"
        style={{ height: 86, background: 'linear-gradient(180deg, #b9655e, #a85d56)', boxShadow: '0 22px 30px -16px rgba(59,42,38,0.6), inset 0 -6px 0 rgba(0,0,0,0.1)' }}
      >
        <div className="absolute inset-y-0 left-1/2 w-5 -translate-x-1/2" style={{ background: 'linear-gradient(90deg, #E9B949, #F7D57A, #E9B949)' }} />
      </div>
      {/* lid */}
      <div className={`absolute -inset-x-2 top-1 ${phase === 'opening' ? 'lid-pop' : ''}`} style={{ height: 34 }}>
        <div className="absolute inset-0 rounded-lg" style={{ background: 'linear-gradient(180deg, #d4837c, #C4756E)', boxShadow: '0 6px 10px -6px rgba(0,0,0,0.4)' }} />
        <div className="absolute inset-y-0 left-1/2 w-5 -translate-x-1/2" style={{ background: 'linear-gradient(90deg, #E9B949, #F7D57A, #E9B949)' }} />
        {/* bow */}
        <span className="absolute -top-6 left-1/2 h-8 w-10 -translate-x-[95%] rotate-[-25deg] rounded-[50%]" style={{ border: '6px solid #F2B43C', borderRightColor: '#E9B949' }} />
        <span className="absolute -top-6 left-1/2 h-8 w-10 -translate-x-[5%] rotate-[25deg] rounded-[50%]" style={{ border: '6px solid #F2B43C', borderLeftColor: '#E9B949' }} />
        <span className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full" style={{ background: '#E9B949' }} />
      </div>
    </div>
  );
}

/** Full-screen "you won" moment: a gift box rumbles, bursts open, and the prizes fly out. */
export default function RewardReveal({ open, onClose, headline, badges, newPrints = [], pick, stickerSheet = false }: RewardRevealProps) {
  const [phase, setPhase] = useState<Phase>('box');
  const closeRef = useRef<HTMLButtonElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const started = useRef(false);

  const openGift = useCallback(() => {
    if (started.current) return;
    started.current = true;
    setPhase('opening');
    // A little buzz on phones that support it
    navigator.vibrate?.([30, 40, 70]);
    timer.current = window.setTimeout(() => setPhase('done'), 1050);
  }, []);

  // The box opens by itself after a moment, or straight away on tap
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(openGift, 1700);
    return () => {
      window.clearTimeout(id);
      window.clearTimeout(timer.current);
    };
  }, [open, openGift]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const saleOn = isSaleActive();
  const burst = phase !== 'box';

  // What flies out of the box: new print stickers, otherwise the badges, otherwise a party popper
  const flyers: { key: string; node: ReactNode; ring?: string }[] = newPrints.length
    ? newPrints.map((p) => ({ key: p, ring: PRINT_COLORS[p], node: <img src={printSwatch(p)} alt="" className="h-full w-full object-cover" /> }))
    : badges.length
      ? badges.map((id) => ({ key: id, node: <span className="text-2xl">{BADGES[id].emoji}</span> }))
      : [{ key: 'party', node: <span className="text-2xl">🎉</span> }];

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 animate-fade-in" role="dialog" aria-modal="true" aria-label={headline}>
      <div className="absolute inset-0" style={{ background: 'rgba(42,34,32,0.6)', backdropFilter: 'blur(6px)' }} onClick={onClose} />

      <div className="relative max-h-[92dvh] w-full max-w-md overflow-y-auto overflow-x-hidden rounded-[28px] px-6 pb-6 pt-6 text-center animate-slide-up" style={{ background: '#FFFDF9', boxShadow: '0 40px 80px -30px rgba(0,0,0,0.5)' }}>
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className="absolute right-3 top-3 z-20 rounded-full p-2 outline-none transition-colors hover:bg-[#FDF6EC] focus-visible:ring-2 focus-visible:ring-[#C4756E]" style={{ color: '#6b5f58' }}>
          <X className="h-5 w-5" />
        </button>

        {/* Stage */}
        <button
          type="button"
          onClick={openGift}
          disabled={phase !== 'box'}
          aria-label={phase === 'box' ? 'Open your reward' : undefined}
          className="relative block h-[230px] w-full cursor-pointer disabled:cursor-default"
        >
          <span className="glow-pulse absolute left-1/2 top-1/2 h-52 w-52 rounded-full" style={{ background: 'radial-gradient(circle, rgba(242,180,60,0.38), rgba(242,180,60,0) 65%)' }} aria-hidden="true" />
          {burst && (
            <span className="burst-in absolute left-1/2 top-1/2 h-0 w-0" aria-hidden="true">
              <span className="reward-rays" />
            </span>
          )}
          {phase !== 'done' && <GiftBox phase={phase} />}
          {burst && (
            <span className="pointer-events-none absolute left-1/2 top-1/2" aria-hidden="true">
              {CONFETTI.map((c, i) => (
                <span key={i} className="confetti-bit" style={{ background: c.color, '--cx': `${c.x}px`, '--cy': `${c.y}px`, '--cr': `${c.r}deg`, animationDuration: '1.3s' } as CSSProperties} />
              ))}
            </span>
          )}
          {burst &&
            flyers.map((f, i) => {
              const spot = arcSpot(i, flyers.length);
              return (
                <span
                  key={f.key}
                  className="fly-out absolute left-1/2 top-1/2 flex h-12 w-12 items-center justify-center overflow-hidden rounded-full"
                  style={{
                    background: '#FFFDF9',
                    boxShadow: `0 0 0 3px #FFFDF9, 0 0 0 5px ${f.ring ?? '#F2B43C'}, 0 10px 18px -8px rgba(0,0,0,0.45)`,
                    animationDelay: `${0.18 + i * 0.07}s`,
                    '--fx': `${spot.x}px`,
                    '--fy': `${spot.y}px`,
                    '--fr': `${spot.r}deg`,
                  } as CSSProperties}
                  aria-hidden="true"
                >
                  {f.node}
                </span>
              );
            })}
        </button>

        {phase === 'box' && (
          <p className="font-hand -mt-2 text-2xl" style={{ color: '#C4756E' }}>tap to open your gift!</p>
        )}

        {phase === 'done' && (
          <div className="animate-slide-up">
            <p className="font-hand text-2xl" style={{ color: '#C4756E' }}>you won</p>
            <h3 className="font-serif text-3xl font-medium leading-tight" style={{ color: '#2a2220' }}>{headline}</h3>
            {newPrints.length > 0 && (
              <p className="mt-1 text-xs font-semibold" style={{ color: '#8a7e78' }}>
                +{newPrints.length} new print {newPrints.length === 1 ? 'sticker' : 'stickers'} in your album
              </p>
            )}

            {/* The physical reward */}
            {stickerSheet && (
              <div className="mt-5">
                <div className="sticker-in">
                  <StickerSheet />
                </div>
                <p className="mt-3 text-sm font-semibold" style={{ color: '#2a2220' }}>Packed free with your next order</p>
                <p className="text-xs" style={{ color: '#6b5f58' }}>It's added to your bag automatically. One sheet per order.</p>
              </div>
            )}

            {/* Badges */}
            {badges.length > 0 && (
              <div className="mt-5 flex flex-wrap justify-center gap-4">
                {badges.map((id, i) => (
                  <div key={id} className="sticker-in flex flex-col items-center" style={{ animationDelay: `${0.1 + i * 0.12}s` }}>
                    <span className="flex h-14 w-14 items-center justify-center rounded-full text-2xl" style={{ background: 'radial-gradient(circle at 35% 30%, #FFF6D6, #E9B949 70%, #C99A32)', boxShadow: '0 8px 16px -8px rgba(150,110,30,0.7), inset 0 -2px 0 rgba(0,0,0,0.12)' }}>
                      {BADGES[id].emoji}
                    </span>
                    <span className="mt-1.5 text-xs font-bold" style={{ color: '#2a2220' }}>{BADGES[id].label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Personal pick */}
            {pick && (
              <Link to={pick.to} onClick={onClose} className="group mt-5 flex items-center gap-3 rounded-2xl p-2.5 text-left transition-all hover:-translate-y-0.5" style={{ background: '#FDF6EC', border: '1px solid #F0E0C6' }}>
                <span className="h-16 w-14 shrink-0 overflow-hidden rounded-xl">
                  <Img src={pick.image} alt="" sizes="56px" className="h-full w-full object-cover" />
                </span>
                <span className="flex-1">
                  <span className="block text-[0.65rem] font-bold uppercase tracking-[0.12em]" style={{ color: '#C4756E' }}>Your lucky pick</span>
                  <span className="font-serif block text-base leading-tight" style={{ color: '#2a2220' }}>{pick.title}</span>
                </span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" style={{ color: '#C4756E' }} />
              </Link>
            )}

            {/* Real, existing offers, shown as good news rather than as a prize */}
            <div className="mt-4 space-y-1 text-xs" style={{ color: '#6b5f58' }}>
              {saleOn && <p>Good timing: the {SALE_NAME} is on, {Math.round(SALE_DISCOUNT * 100)}% off bags &amp; pouches</p>}
              <p>{FREE_SHIPPING_MESSAGE}</p>
              {isBeforeDiwaliCutoff() && <p>Order by {DIWALI_ORDER_BY_LABEL} for Diwali delivery</p>}
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Link to={pick?.to ?? '/products'} onClick={onClose} className="btn-primary bounce-tap arrow-nudge">
                {pick ? 'Go to my lucky pick' : 'Start shopping'} <ArrowRight className="h-4 w-4 arrow-icon" />
              </Link>
              <button type="button" onClick={onClose} className="btn-ghost">Keep playing</button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
