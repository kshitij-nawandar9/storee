import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { trackEvent } from '@/services/analytics';
import Img from '@/components/common/Img';
import { getRakhiHamperBySlug, type RakhiHamper } from '@/data/hampers';
import { DIWALI_ORDER_BY_LABEL, isBeforeDiwaliCutoff } from '@/utils/constants';
import { BADGES, earnBadge, hasBadge } from '@/utils/rewards';

const DIYA_COUNT = 7;
const SPARK_COLORS = ['#FFD36E', '#F2B43C', '#FFF3C4', '#F4A7A0', '#FFFFFF'];

// Fixed star field so renders stay pure
const STARS = Array.from({ length: 46 }, (_, i) => ({
  left: (i * 37.7) % 100,
  top: (i * 23.3 + (i % 5) * 7) % 100,
  size: 1 + (i % 3),
  delay: (i % 9) * 0.37,
}));

interface Burst {
  id: number;
  x: number;
  y: number;
  big: boolean;
}

function Diya({ lit, index, onLight }: { lit: boolean; index: number; onLight: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onLight();
      }}
      aria-pressed={lit}
      aria-label={lit ? `Diya ${index + 1} is lit` : `Light diya ${index + 1}`}
      className="relative h-16 w-[46px] shrink-0 transition-transform duration-300 hover:-translate-y-1 sm:h-24 sm:w-20"
    >
      {/* glow */}
      <span
        className="diya-glow absolute left-1/2 top-[28%] h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full sm:h-28 sm:w-28"
        style={{ background: 'radial-gradient(circle, rgba(255,196,84,0.55), rgba(255,160,60,0.12) 45%, transparent 70%)', opacity: lit ? 1 : 0, transform: `translate(-50%, -50%) scale(${lit ? 1 : 0.4})` }}
      />
      <svg viewBox="0 0 80 96" className="relative h-full w-full" aria-hidden="true">
        {/* flame */}
        <g style={{ opacity: lit ? 1 : 0, transition: 'opacity 0.4s ease' }}>
          <path className="flame" d="M40 14c7 10 10 17 10 24a10 10 0 0 1-20 0c0-7 3-14 10-24z" fill="url(#flameGrad)" style={{ animationDelay: `${index * -0.17}s` }} />
          <path className="flame" d="M40 28c3 5 5 8 5 11a5 5 0 0 1-10 0c0-3 2-6 5-11z" fill="#FFF7D6" style={{ animationDelay: `${index * -0.17}s` }} />
        </g>
        {/* wick */}
        <rect x="38.5" y="44" width="3" height="8" rx="1.5" fill={lit ? '#5a3a1a' : '#3b2a22'} />
        {/* bowl */}
        <path d="M8 52c0 0 6 26 32 26s32-26 32-26z" fill={lit ? '#C2593F' : '#6e3a2e'} style={{ transition: 'fill 0.5s ease' }} />
        <path d="M8 52h64" stroke={lit ? '#F2B43C' : '#8a5a3a'} strokeWidth="4" strokeLinecap="round" />
        <path d="M18 62c6 6 14 9 22 9s16-3 22-9" stroke={lit ? '#F8D98B' : '#8a5a3a'} strokeWidth="2" fill="none" strokeDasharray="2 5" strokeLinecap="round" />
        <ellipse cx="40" cy="84" rx="18" ry="3" fill="rgba(0,0,0,0.25)" />
      </svg>
    </button>
  );
}

// One hamper from each budget, revealed once the diyas are lit
const HAMPER_PICKS = ['rakhi-crossbody-keychain', 'rakhi-multipurpose-keychain', 'rakhi-backpack-pencil']
  .map(getRakhiHamperBySlug)
  .filter((h): h is RakhiHamper => Boolean(h));

const BOX_COLORS = [
  { box: '#C4756E', ribbon: '#F2B43C' },
  { box: '#5BA3A0', ribbon: '#FFF3C4' },
  { box: '#C9A96E', ribbon: '#C4756E' },
];

function GiftBox({ index, opening }: { index: number; opening: boolean }) {
  const c = BOX_COLORS[index % BOX_COLORS.length];
  return (
    <div className={opening ? '' : 'gift-shake'} style={{ animationDuration: '2.6s', animationDelay: `${index * 0.4}s` }}>
      <div className="relative mx-auto h-24 w-24 sm:h-28 sm:w-28">
        {/* lid */}
        <div className={`absolute inset-x-[-6%] top-[18%] z-10 h-[22%] rounded-md ${opening ? 'lid-off' : ''}`} style={{ background: c.box, boxShadow: 'inset 0 -4px 0 rgba(0,0,0,0.15)' }}>
          <div className="absolute inset-y-0 left-1/2 w-[16%] -translate-x-1/2" style={{ background: c.ribbon }} />
          <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-2xl sm:text-3xl" aria-hidden="true">🎀</span>
        </div>
        {/* body */}
        <div className="absolute inset-x-0 bottom-0 top-[38%] rounded-b-lg" style={{ background: c.box, filter: 'brightness(0.92)', boxShadow: '0 16px 30px -14px rgba(0,0,0,0.6)' }}>
          <div className="absolute inset-y-0 left-1/2 w-[16%] -translate-x-1/2" style={{ background: c.ribbon }} />
          <span className="absolute inset-0 flex items-center justify-center text-lg opacity-80" aria-hidden="true">🔒</span>
        </div>
      </div>
    </div>
  );
}

function Rangoli({ progress, complete }: { progress: number; complete: boolean }) {
  return (
    <svg viewBox="-110 -110 220 220" className="rangoli h-full w-full" style={{ '--p': progress } as CSSProperties} aria-hidden="true">
      {/* outer petals */}
      {Array.from({ length: 8 }, (_, i) => (
        <g key={`o${i}`} transform={`rotate(${i * 45})`}>
          <path pathLength={1} d="M0 -38 C 22 -55, 22 -85, 0 -100 C -22 -85, -22 -55, 0 -38 Z" fill="none" stroke="#F2B43C" strokeWidth="2.2" />
          <path className="rangoli-fill" d="M0 -48 C 13 -60, 13 -80, 0 -90 C -13 -80, -13 -60, 0 -48 Z" fill="#E8857C" style={{ opacity: complete ? 0.85 : 0 }} />
        </g>
      ))}
      {/* inner petals */}
      {Array.from({ length: 16 }, (_, i) => (
        <g key={`i${i}`} transform={`rotate(${i * 22.5 + 11.25})`}>
          <path pathLength={1} d="M0 -22 C 8 -28, 8 -38, 0 -44 C -8 -38, -8 -28, 0 -22 Z" fill="none" stroke="#F4A7A0" strokeWidth="1.8" />
          <path className="rangoli-fill" d="M0 -26 C 5 -30, 5 -36, 0 -40 C -5 -36, -5 -30, 0 -26 Z" fill="#F8D98B" style={{ opacity: complete ? 0.9 : 0 }} />
        </g>
      ))}
      {/* rings */}
      <circle className="draw" pathLength={1} r="104" fill="none" stroke="#FFF3C4" strokeWidth="1.2" strokeDasharray="1" />
      <circle className="draw" pathLength={1} r="20" fill="none" stroke="#FFD36E" strokeWidth="2" />
      {Array.from({ length: 24 }, (_, i) => {
        const a = (i / 24) * Math.PI * 2;
        return <circle key={`d${i}`} cx={Math.cos(a) * 104} cy={Math.sin(a) * 104} r="2.2" fill="#FFD36E" style={{ opacity: progress > i / 24 ? 1 : 0, transition: 'opacity 0.3s' }} />;
      })}
      <circle r="10" fill="#E8857C" className="rangoli-fill" style={{ opacity: progress > 0.6 ? 1 : 0 }} />
      <circle r="5" fill="#FFD36E" className="rangoli-fill" style={{ opacity: progress > 0.6 ? 1 : 0 }} />
    </svg>
  );
}

export default function DiwaliNight() {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const [tapped, setTapped] = useState<Set<number>>(() => new Set());
  const [bursts, setBursts] = useState<Burst[]>([]);
  // Visitors who already lit the diyas see the hampers unwrapped straight away
  const [alreadyLit] = useState(() => hasBadge('diwali-lit'));
  const [celebrated, setCelebrated] = useState(alreadyLit);
  const [phase, setPhase] = useState<'locked' | 'opening' | 'open'>(alreadyLit ? 'open' : 'locked');
  const [badgeNew, setBadgeNew] = useState(false);
  const burstId = useRef(0);
  const timers = useRef<number[]>([]);

  // Scroll drives the rangoli drawing. The diyas are lit by tapping.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = (vh - rect.top) / (vh * 0.5 + rect.height * 0.6);
      setProgress(Math.min(1, Math.max(0, p)));
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const isLit = (i: number) => alreadyLit || tapped.has(i);
  const allLit = Array.from({ length: DIYA_COUNT }, (_, i) => i).every(isLit);

  const addBurst = (x: number, y: number, big = false) => {
    const id = ++burstId.current;
    setBursts((b) => [...b, { id, x, y, big }]);
    timers.current.push(window.setTimeout(() => setBursts((b) => b.filter((burst) => burst.id !== id)), 1400));
  };

  const celebrate = () => {
    const el = sectionRef.current;
    if (!el) return;
    // Aim at the part of the section that is actually on screen
    const rect = el.getBoundingClientRect();
    const visibleTop = Math.max(0, -rect.top);
    const visibleHeight = Math.min(window.innerHeight, rect.bottom) - Math.max(0, rect.top);
    [[0.2, 0.25], [0.8, 0.2], [0.5, 0.12], [0.3, 0.45], [0.72, 0.42], [0.5, 0.3]].forEach(([fx, fy], i) => {
      timers.current.push(window.setTimeout(() => addBurst(rect.width * fx, visibleTop + visibleHeight * fy, true), i * 260));
    });
  };

  // Fireworks the first time every diya is burning
  if (allLit && !celebrated) {
    setCelebrated(true);
  }
  useEffect(() => {
    if (!celebrated || alreadyLit) return;
    celebrate();
    trackEvent('diwali_diyas_all_lit');
    setBadgeNew(earnBadge('diwali-lit'));
    setPhase('opening');
    timers.current.push(window.setTimeout(() => setPhase('open'), 650));
    // celebrate only reads refs and stable setters
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [celebrated]);

  const handleSectionClick = (e: MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    addBurst(e.clientX - rect.left, e.clientY - rect.top);
  };

  const lightDiya = (i: number) => {
    setTapped((t) => new Set(t).add(i));
    const el = sectionRef.current;
    const btn = el?.querySelectorAll('[data-diya]')[i] as HTMLElement | undefined;
    if (el && btn) {
      const s = el.getBoundingClientRect();
      const b = btn.getBoundingClientRect();
      addBurst(b.left - s.left + b.width / 2, b.top - s.top + b.height * 0.25);
    }
  };

  return (
    <section
      ref={sectionRef}
      id="diwali-night"
      onClick={handleSectionClick}
      className="relative scroll-mt-0 cursor-pointer select-none overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #FDF6EC 0%, #E9C3A8 7%, #8a4a5a 16%, #3a2550 26%, #1c1735 38%, #1c1735 80%, #3a2550 90%, #8a4a5a 95%, #FDF6EC 100%)' }}
      aria-label="Diwali night: light the diyas to unwrap the hampers"
    >
      {/* Stars */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[18%] bottom-[12%]">
        {STARS.map((s, i) => (
          <span key={i} className="twinkle absolute rounded-full" style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, background: '#FFF3C4', animationDelay: `${s.delay}s` }} />
        ))}
      </div>

      <div className="relative mx-auto max-w-5xl px-4 pb-32 pt-36 text-center sm:px-6 sm:pb-40 sm:pt-44">
        {/* Rangoli behind the copy */}
        <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[42%] h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 opacity-35 sm:h-[640px] sm:w-[640px]">
          <Rangoli progress={phase === 'open' ? 1 : progress} complete={phase === 'open'} />
        </div>

        <div className="relative">
          <p className="font-hand text-2xl sm:text-3xl" style={{ color: '#FFD36E' }}>{phase === 'open' ? 'happy diwali from storee ✨' : 'shubh deepavali ✨'}</p>
          <h2 className="font-serif mt-1 font-medium" style={{ fontSize: 'clamp(2.4rem, 7vw, 4.5rem)', lineHeight: 1, letterSpacing: '-0.03em', color: '#FFF7E8', textShadow: '0 4px 24px rgba(28,23,53,0.9)' }}>
            {phase === 'open' ? 'Your gifts are unwrapped' : 'Light up the night'}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm sm:text-base" style={{ color: 'rgba(255,247,232,0.85)', textShadow: '0 2px 12px rgba(28,23,53,1)' }}>
            {phase === 'open' ? "This year's Diwali hampers are unwrapped. Pick one for someone special." : "Tap all seven diyas to unwrap this year's Diwali hampers."}
          </p>

          <div className="mt-10 flex items-end justify-center gap-0.5 sm:gap-3">
            {Array.from({ length: DIYA_COUNT }, (_, i) => (
              <span key={i} data-diya>
                <Diya index={i} lit={isLit(i)} onLight={() => lightDiya(i)} />
              </span>
            ))}
          </div>

          {phase !== 'open' ? (
            <div className="mt-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: 'rgba(255,211,110,0.8)' }}>
                {Array.from({ length: DIYA_COUNT }, (_, i) => i).filter(isLit).length} of {DIYA_COUNT} lit
                {phase === 'locked' && ` · ${DIYA_COUNT - Array.from({ length: DIYA_COUNT }, (_, i) => i).filter(isLit).length} to go`}
              </p>
              <div className="mx-auto mt-8 grid max-w-lg grid-cols-3 gap-3 sm:gap-6">
                {HAMPER_PICKS.map((h, i) => (
                  <GiftBox key={h.id} index={i} opening={phase === 'opening'} />
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-8">
              {badgeNew && (
                <p className="sticker-in mx-auto mb-5 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold" style={{ background: 'radial-gradient(circle at 35% 30%, #FFF3C4, #F2B43C)', color: '#2a2220' }}>
                  {BADGES['diwali-lit'].emoji} You earned the {BADGES['diwali-lit'].label} badge
                </p>
              )}
              <div className="mx-auto grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
                {HAMPER_PICKS.map((h, i) => (
                  <Link
                    key={h.id}
                    to={`/hampers?budget=${h.budget}`}
                    onClick={(e) => e.stopPropagation()}
                    className="sticker-in group block overflow-hidden rounded-2xl text-left transition-transform duration-300 hover:-translate-y-1"
                    style={{ background: '#FFFDF9', animationDelay: `${0.1 + i * 0.15}s`, boxShadow: '0 20px 40px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,211,110,0.4)' }}
                  >
                    <div className="relative overflow-hidden" style={{ aspectRatio: '4 / 3', background: '#F8EDDA' }}>
                      <Img src={h.images[0]?.url} alt={h.name} sizes="(min-width: 640px) 300px, 90vw" className="product-img h-full w-full object-cover" loading="lazy" decoding="async" />
                      <span className="absolute left-2 top-2 rounded-full px-2 py-0.5 text-[0.65rem] font-bold" style={{ background: '#FFD36E', color: '#2a1d3a' }}>{h.budgetLabel}</span>
                    </div>
                    <div className="flex items-start justify-between gap-2 p-3">
                      <p className="font-serif text-sm leading-snug" style={{ color: '#2a2220' }}>{h.name}</p>
                      <p className="font-serif shrink-0 text-base font-semibold" style={{ color: '#C4756E' }}>₹{(h.basePrice / 100).toLocaleString('en-IN')}</p>
                    </div>
                  </Link>
                ))}
              </div>
              <Link
                to="/hampers"
                onClick={(e) => e.stopPropagation()}
                className="arrow-nudge bounce-tap mt-7 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold"
                style={{ background: '#FFD36E', color: '#2a1d3a', boxShadow: '0 10px 30px -8px rgba(255,211,110,0.6)' }}
              >
                See all Diwali hampers <ArrowRight className="h-4 w-4 arrow-icon" />
              </Link>
              {isBeforeDiwaliCutoff() && (
                <p className="mt-3 text-xs" style={{ color: 'rgba(255,247,232,0.7)' }}>📦 Order by {DIWALI_ORDER_BY_LABEL} for Diwali delivery</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sparkle bursts */}
      {bursts.map((b) => {
        const count = b.big ? 30 : 14;
        return (
          <span key={b.id} className="pointer-events-none absolute" style={{ left: b.x, top: b.y }} aria-hidden="true">
            {Array.from({ length: count }, (_, i) => {
              const angle = (i / count) * Math.PI * 2 + (b.id % 7) * 0.3;
              const dist = (b.big ? 110 : 52) * (0.6 + ((i * 7 + b.id) % 5) * 0.12);
              return (
                <span
                  key={i}
                  className="spark"
                  style={{
                    background: SPARK_COLORS[(i + b.id) % SPARK_COLORS.length],
                    boxShadow: `0 0 8px ${SPARK_COLORS[(i + b.id) % SPARK_COLORS.length]}`,
                    '--sx': `${Math.cos(angle) * dist}px`,
                    '--sy': `${Math.sin(angle) * dist + (b.big ? 20 : 8)}px`,
                    '--sd': b.big ? '1.3s' : '0.85s',
                  } as CSSProperties}
                />
              );
            })}
          </span>
        );
      })}
    </section>
  );
}
