import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, RefreshCw } from 'lucide-react';
import Img from '@/components/common/Img';
import { PRODUCTS_DATA } from '@/data/products';
import { useInView } from '@/hooks/useInView';
import { SALE_DISCOUNT, SALE_NAME, getSalePrice, isSaleActive } from '@/utils/constants';
import { ALL_PRINTS, useHampersLocked, useRewards, useStickerSheet } from '@/utils/rewards';

const WORDS = ['school runs', 'sleepovers', 'road trips', 'Diwali gifting', 'packing'];

// Hero showcase: real products, each opening its product page with that print selected
const STACK = [
  { src: '/images/products/crossbody_bag/Lion.png', slug: 'crossbody-bag', print: 'Lion', alt: 'Crossbody bag in the Lion print' },
  { src: '/images/products/kids_bag/Beach.png', slug: 'kids-bag', print: 'Beach', alt: 'Kids backpack in the Beach print' },
  { src: '/images/products/multipurpose_pouch/Jungle Safari_set.png', slug: 'multipurpose-pouch', print: 'Jungle Safari', alt: 'Multipurpose pouch set in the Jungle Safari print' },
  { src: '/images/products/toiletry_kit/Space.png', slug: 'toiletry-kit', print: 'Space', alt: 'Toiletry kit in the Space print' },
].map((item) => {
  const product = PRODUCTS_DATA.find((p) => p.slug === item.slug);
  return { ...item, name: product?.name ?? '', price: product?.basePrice, product };
});

const formatINR = (paise: number) => `₹${(paise / 100).toLocaleString('en-IN')}`;

// Where each card sits in the pile, front to back.
const SLOTS = [
  { x: 0, y: 0, r: -3, s: 1, depth: 26 },
  { x: 20, y: -5, r: 8, s: 0.93, depth: 16 },
  { x: -18, y: 4, r: -11, s: 0.9, depth: 10 },
  { x: 6, y: -11, r: 3, s: 0.86, depth: 6 },
];

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function Flower({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg className={className} style={style} width="56" height="56" viewBox="0 0 56 56" aria-hidden="true">
      {[0, 72, 144, 216, 288].map((deg) => (
        <ellipse key={deg} cx="28" cy="15" rx="9" ry="13" fill="#FCEFC7" stroke="#F2D98D" strokeWidth="1.5" transform={`rotate(${deg} 28 28)`} />
      ))}
      <circle cx="28" cy="28" r="6.5" fill="#F2B43C" />
    </svg>
  );
}

function Star({ className = '', style, color = '#C4756E' }: { className?: string; style?: CSSProperties; color?: string }) {
  return (
    <svg className={className} style={style} width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2c.6 4.6 2.4 6.9 7 7.6-4.6.8-6.4 3-7 7.6-.6-4.6-2.4-6.8-7-7.6 4.6-.7 6.4-3 7-7.6z" fill={color} />
    </svg>
  );
}

export default function Hero() {
  const [wordIndex, setWordIndex] = useState(0);
  const [order, setOrder] = useState(() => STACK.map((_, i) => i));
  const [leaving, setLeaving] = useState(false);
  const leavingRef = useRef(false);
  const [touched, setTouched] = useState(false);
  const [reduceMotion] = useState(prefersReducedMotion);
  const stageRef = useRef<HTMLDivElement>(null);
  const shuffleTimer = useRef<number | undefined>(undefined);
  const { ref: sectionRef, inView } = useInView<HTMLElement>({ rootMargin: '0px' });

  const { prints } = useRewards();
  const stickerSheet = useStickerSheet();
  const hampersLocked = useHampersLocked();
  const navigate = useNavigate();

  // What the invite at the top of the hero says, depending on the visitor's progress
  const invite = stickerSheet.ready
    ? { tag: 'Won', text: 'Sticker sheet unlocked · shop now', go: () => navigate('/products') }
    : stickerSheet.enabled
      ? { tag: 'New', text: 'Play a 30-sec game & win a surprise gift', go: null }
      : prints.length
        ? { tag: `${prints.length} of ${ALL_PRINTS.length}`, text: 'stickers collected · keep playing', go: null }
        : { tag: 'New', text: 'Play a 30-sec game & find your lucky print', go: null };
  const saleOn = isSaleActive();
  const discountPct = Math.round(SALE_DISCOUNT * 100);

  // Rotate the headline word while the hero is on screen.
  useEffect(() => {
    if (reduceMotion || !inView) return;
    const id = window.setInterval(() => setWordIndex((i) => (i + 1) % WORDS.length), 2300);
    return () => window.clearInterval(id);
  }, [inView, reduceMotion]);

  // The front card flies out to the side, then drops to the back of the pile.
  const shuffle = useCallback(() => {
    if (leavingRef.current) return;
    leavingRef.current = true;
    setLeaving(true);
    shuffleTimer.current = window.setTimeout(() => {
      setOrder((current) => [...current.slice(1), current[0]]);
      setLeaving(false);
      leavingRef.current = false;
    }, 300);
  }, []);

  // Shuffle on its own until the visitor plays with it.
  useEffect(() => {
    if (reduceMotion || touched || !inView) return;
    const id = window.setInterval(shuffle, 3800);
    return () => window.clearInterval(id);
  }, [reduceMotion, touched, inView, shuffle]);

  useEffect(() => () => window.clearTimeout(shuffleTimer.current), []);

  const handleStageMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    stageRef.current.style.setProperty('--mx', `${((e.clientX - rect.left) / rect.width - 0.5) * 2}`);
    stageRef.current.style.setProperty('--my', `${((e.clientY - rect.top) / rect.height - 0.5) * 2}`);
  };

  const handleStageLeave = () => {
    stageRef.current?.style.setProperty('--mx', '0');
    stageRef.current?.style.setProperty('--my', '0');
  };

  return (
    <section ref={sectionRef} className="relative overflow-hidden" style={{ background: '#FDF6EC' }}>
      {/* Ambient blobs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="blob absolute -right-24 -top-24 h-[420px] w-[420px] sm:h-[560px] sm:w-[560px]" style={{ background: 'radial-gradient(circle at 40% 40%, rgba(196,117,110,0.30), rgba(196,117,110,0.08) 70%)' }} />
        <div className="blob blob-slow absolute -bottom-40 -left-32 h-[380px] w-[380px] sm:h-[480px] sm:w-[480px]" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(201,169,110,0.28), rgba(201,169,110,0.06) 70%)' }} />
        <div className="blob absolute left-[38%] top-[55%] hidden h-[200px] w-[200px] lg:block" style={{ background: 'radial-gradient(circle, rgba(139,168,138,0.22), transparent 70%)', animationDelay: '-6s' }} />
      </div>

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-6 px-4 pb-12 pt-8 sm:px-6 sm:pt-12 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:px-8 lg:pb-20 lg:pt-16">
        {/* Copy */}
        <div className="relative z-10">
          {/* Game invite: the first thing people see */}
          <button
            type="button"
            onClick={() => (invite.go ? invite.go() : document.getElementById('play-zone')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))}
            className="group mb-5 inline-flex max-w-full items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4 text-left text-xs font-semibold transition-all duration-300 hover:-translate-y-0.5 sm:text-sm animate-slide-up bounce-tap"
            style={{ background: '#2a2220', color: '#FDF6EC', boxShadow: '0 10px 26px -12px rgba(42,34,32,0.6)' }}
          >
            <span className="rounded-full px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider sm:text-[0.65rem]" style={{ background: '#F2B43C', color: '#2a2220' }}>
              {invite.tag}
            </span>
            <span className="gift-bounce" aria-hidden="true">🎁</span>
            <span className="truncate">{invite.text}</span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-1" style={{ color: '#F2B43C' }} />
          </button>

          <p className="font-hand mb-2 text-xl sm:text-2xl animate-fade-in" style={{ color: '#C4756E' }}>
            carry beautifully ✨
          </p>
          <h1
            className="font-serif font-medium animate-slide-up"
            style={{ fontSize: 'clamp(2.5rem, 7.5vw, 5rem)', lineHeight: 1.02, letterSpacing: '-0.03em', color: '#2a2220' }}
          >
            Bags that make
            <span className="relative block overflow-hidden pb-[0.12em]" style={{ height: '1.18em' }} aria-live="polite">
              <span key={wordIndex} className="word-in italic" style={{ color: '#C4756E' }}>
                {WORDS[wordIndex]}
              </span>
            </span>
            the fun part.
          </h1>

          <p className="mt-5 max-w-md text-sm leading-relaxed sm:text-base animate-fade-in" style={{ color: '#6b5f58', animationDelay: '0.2s' }}>
            Water-resistant bags and pouches in ten playful prints, made in India for kids who carry a lot of tiny treasures.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Link to="/products" className="btn-primary arrow-nudge bounce-tap px-7 py-3.5 text-[0.9rem]">
              Shop the collection <ArrowRight className="h-4 w-4 arrow-icon" />
            </Link>
            <Link
              to="/hampers"
              onClick={(e) => {
                if (!hampersLocked) return;
                e.preventDefault();
                document.getElementById('diwali-night')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="arrow-nudge inline-flex items-center gap-1.5 text-sm font-semibold"
              style={{ color: '#2a2220' }}
            >
              <span className="squiggle-underline">Diwali hampers</span>
              <ArrowRight className="h-4 w-4 arrow-icon" style={{ color: '#C4756E' }} />
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-2 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            {['10 playful prints', 'Water-resistant', 'Made in India'].map((chip) => (
              <span key={chip} className="rounded-full px-3 py-1.5 text-[0.7rem] font-semibold" style={{ background: 'rgba(255,253,249,0.7)', border: '1px solid #F0E0C6', color: '#6b5f58' }}>
                {chip}
              </span>
            ))}
          </div>
        </div>

        {/* Photo stack */}
        <div className="relative mb-14 h-[380px] sm:h-[460px] lg:h-[540px]">
          <Flower className="drift absolute left-[2%] top-[6%] z-0" />
          <Flower className="drift absolute bottom-[4%] right-[6%] z-0 scale-75" style={{ animationDelay: '-4s' }} />
          <Star className="drift absolute right-[10%] top-[2%]" style={{ animationDelay: '-2s' }} />
          <Star className="drift absolute bottom-[18%] left-[4%]" color="#8BA88A" style={{ animationDelay: '-6s' }} />

          <div
            ref={stageRef}
            onPointerMove={handleStageMove}
            onPointerLeave={handleStageLeave}
            className="absolute inset-0"
            style={{ '--mx': 0, '--my': 0 } as CSSProperties}
          >
            {STACK.map((item, i) => {
              const slotIndex = order.indexOf(i);
              const slot = SLOTS[slotIndex];
              const isFront = slotIndex === 0;
              const isLeaving = leaving && isFront;
              const cardTransform = isLeaving
                ? 'translate(-50%, -50%) translate(72%, -6%) rotate(18deg) scale(1)'
                : `translate(-50%, -50%) translate(${slot.x}%, ${slot.y}%) rotate(${slot.r}deg) scale(${slot.s})`;
              const sale = item.price && item.product ? getSalePrice(item.price, item.product) : undefined;

              return (
                <div
                  key={item.src}
                  className="absolute left-1/2 top-1/2 h-0 w-0"
                  style={{
                    zIndex: isLeaving ? 50 : 40 - slotIndex * 10,
                    transform: `translate(calc(var(--mx) * ${slot.depth}px), calc(var(--my) * ${slot.depth}px))`,
                    transition: 'transform 0.25s ease-out',
                  }}
                >
                  <div className={`stack-card absolute left-0 top-0 ${isLeaving ? 'is-leaving' : ''}`} style={{ transform: cardTransform }}>
                    <div className="bob" style={{ animationDelay: `${i * -1.3}s` }}>
                      <Link
                        to={`/products/${item.slug}?print=${encodeURIComponent(item.print)}`}
                        tabIndex={isFront ? 0 : -1}
                        aria-hidden={isFront ? undefined : true}
                        className={`group/card block w-[58vw] max-w-[300px] rounded-[22px] p-2.5 sm:w-[300px] lg:w-[330px] lg:max-w-[330px] ${isFront ? '' : 'pointer-events-none'}`}
                        style={{ background: '#FFFDF9', boxShadow: isFront ? '0 30px 60px -28px rgba(59,42,38,0.45)' : '0 18px 40px -26px rgba(59,42,38,0.35)' }}
                        draggable={false}
                      >
                        <div className="overflow-hidden rounded-[16px]" style={{ aspectRatio: '4 / 5', background: '#F8EDDA' }}>
                          <Img
                            src={item.src}
                            alt={item.alt}
                            sizes="(min-width: 1024px) 330px, 58vw"
                            className="h-full w-full object-cover transition-transform duration-700 group-hover/card:scale-105"
                            fetchPriority={i === 0 ? 'high' : undefined}
                            loading={i === 0 ? 'eager' : 'lazy'}
                            decoding="async"
                            draggable={false}
                          />
                        </div>
                        <div className="flex items-end justify-between gap-2 px-1.5 pb-0.5 pt-2.5 text-left">
                          <div className="min-w-0">
                            <p className="font-serif truncate text-[0.95rem] leading-tight" style={{ color: '#2a2220' }}>{item.name}</p>
                            <p className="font-hand text-base leading-none" style={{ color: '#C4756E' }}>{item.print.toLowerCase()} print</p>
                          </div>
                          {item.price && (
                            <div className="shrink-0 text-right leading-tight">
                              <p className="font-serif text-base font-semibold" style={{ color: '#2a2220' }}>{formatINR(sale ?? item.price)}</p>
                              {sale && <p className="text-[0.7rem] line-through" style={{ color: '#b0aaa3' }}>{formatINR(item.price)}</p>}
                            </div>
                          )}
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Flip to the next product */}
          <div className="absolute -bottom-12 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setTouched(true);
                shuffle();
              }}
              className="bounce-tap inline-flex items-center gap-2 rounded-full py-2 pl-3 pr-4 text-xs font-semibold transition-transform hover:-translate-y-0.5 sm:text-sm"
              style={{ background: '#2a2220', color: '#FDF6EC', boxShadow: '0 10px 24px -12px rgba(42,34,32,0.6)' }}
            >
              <RefreshCw className="h-3.5 w-3.5" style={{ color: '#F2B43C' }} /> Next pick
            </button>
            <div className="flex gap-1.5" aria-hidden="true">
              {STACK.map((item, i) => (
                <span key={item.src} className="h-1.5 rounded-full transition-all duration-300" style={{ width: order[0] === i ? 18 : 6, background: order[0] === i ? '#C4756E' : '#E3CDB8' }} />
              ))}
            </div>
          </div>

          {/* Spinning sale stamp */}
          {saleOn && (
            <Link
              to="/products"
              className="absolute right-0 top-[4%] z-[60] block h-24 w-24 sm:right-[2%] sm:h-28 sm:w-28 transition-transform duration-300 hover:scale-110"
              aria-label={`${SALE_NAME}: ${discountPct}% off bags and pouches`}
            >
              <svg viewBox="0 0 120 120" className="spin-slow absolute inset-0 h-full w-full" aria-hidden="true">
                <defs>
                  <path id="stampCircle" d="M60 60 m-44 0 a44 44 0 1 1 88 0 a44 44 0 1 1 -88 0" />
                </defs>
                <circle cx="60" cy="60" r="58" fill="#2a2220" />
                <text fill="#FDF6EC" fontSize="12" fontWeight="700" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {/* textLength spreads the label evenly around the full circle (2π × 44) */}
                  <textPath href="#stampCircle" textLength="276" lengthAdjust="spacing">{`${SALE_NAME.toUpperCase()} • ${discountPct}% OFF • `}</textPath>
                </text>
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-3xl" aria-hidden="true">🪔</span>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
