import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw, Timer, Footprints, Trophy } from 'lucide-react';
import { trackEvent } from '@/services/analytics';
import { safeStorage } from '@/utils/safeStorage';
import RewardReveal, { type RewardPick } from '@/components/rewards/RewardReveal';
import { ALL_PRINTS, BADGES, PRINT_COLORS, collectPrints, printSwatch, earnBadge, hasBadge, winStickerSheet, type BadgeId, type PrintName } from '@/utils/rewards';

const BADGES_LABEL = (id: BadgeId) => BADGES[id].label;

const PAIRS = 6;
const PRO_MOVES = 16;

const BEST_KEY = 'storee:memory-best-moves';

interface Card {
  key: string;
  print: PrintName;
  color: string;
}

function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// Each game deals 6 of the 10 prints, so collecting every sticker takes a few rounds.
function newDeck(): Card[] {
  const prints = shuffle([...ALL_PRINTS]).slice(0, PAIRS);
  return shuffle(
    prints.flatMap((print) => [
      { key: `${print}-a`, print, color: PRINT_COLORS[print] },
      { key: `${print}-b`, print, color: PRINT_COLORS[print] },
    ])
  );
}

interface Reveal {
  headline: string;
  stickerSheet: boolean;
  badges: BadgeId[];
  newPrints: PrintName[];
  pick: RewardPick;
}

const CONFETTI_COLORS = ['#C4756E', '#C9A96E', '#8BA88A', '#F2B43C', '#D4A0D4'];
const CONFETTI = Array.from({ length: 28 }, (_, i) => {
  const angle = (i / 28) * Math.PI * 2;
  const distance = 90 + (i % 4) * 30;
  return { color: CONFETTI_COLORS[i % 5], x: Math.cos(angle) * distance, y: Math.sin(angle) * distance, r: (i % 2 ? 1 : -1) * (180 + i * 20) };
});

const formatTime = (ms: number) => {
  const total = Math.floor(ms / 1000);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
};

export default function MemoryMatch() {
  const [deck, setDeck] = useState<Card[]>(newDeck);
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<string>>(() => new Set());
  const [justMatched, setJustMatched] = useState<string | null>(null);
  const [matchFx, setMatchFx] = useState<{ index: number; id: number } | null>(null);
  const [moves, setMoves] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [best, setBest] = useState<number | null>(() => {
    const saved = Number(safeStorage.get(BEST_KEY));
    return saved > 0 ? saved : null;
  });
  const [newBest, setNewBest] = useState(false);
  const [reveal, setReveal] = useState<Reveal | null>(null);
  const [proEarned, setProEarned] = useState(() => hasBadge('memory-pro'));
  const timers = useRef<number[]>([]);
  const fxCount = useRef(0);

  const won = matched.size === PAIRS;

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  // Run the clock between the first flip and the last match.
  useEffect(() => {
    if (startedAt === null || won) return;
    const id = window.setInterval(() => setElapsed(performance.now() - startedAt), 250);
    return () => window.clearInterval(id);
  }, [startedAt, won]);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  // `timeStamp` is the click's time on the page clock, the same clock as performance.now().
  const flip = (index: number, timeStamp: number) => {
    const card = deck[index];
    if (open.length === 2 || open.includes(index) || matched.has(card.print)) return;
    if (startedAt === null) setStartedAt(timeStamp);

    const nextOpen = [...open, index];
    setOpen(nextOpen);
    if (nextOpen.length < 2) return;

    const nextMoves = moves + 1;
    setMoves(nextMoves);
    const [a, b] = nextOpen.map((i) => deck[i]);

    if (a.print === b.print) {
      fxCount.current += 1;
      setMatchFx({ index, id: fxCount.current });
      navigator.vibrate?.(25);
      later(() => {
        const nextMatched = new Set(matched).add(a.print);
        setMatched(nextMatched);
        setJustMatched(a.print);
        setOpen([]);
        if (nextMatched.size === PAIRS) {
          const time = startedAt ? performance.now() - startedAt : 0;
          setElapsed(time);
          const isBest = best === null || nextMoves < best;
          if (isBest) {
            setBest(nextMoves);
            safeStorage.set(BEST_KEY, String(nextMoves));
          }
          setNewBest(isBest);
          trackEvent('memory_game_won', { moves: nextMoves, seconds: Math.round(time / 1000) });

          // Rewards: stickers for every print in this deck, plus badges
          const dealt = [...new Set(deck.map((c) => c.print))];
          const { newPrints, completedCollection } = collectPrints(dealt);
          const badges: BadgeId[] = [];
          if (earnBadge('memory-win')) badges.push('memory-win');
          if (nextMoves <= PRO_MOVES && earnBadge('memory-pro')) {
            badges.push('memory-pro');
            setProEarned(true);
          }
          if (completedCollection) badges.push('collector');
          const sheetUnlocked = winStickerSheet();
          const lucky = dealt[Math.floor(Math.random() * dealt.length)];
          later(() => setReveal({
            stickerSheet: sheetUnlocked,
            headline: sheetUnlocked
              ? 'A free 3D sticker sheet!'
              : badges.includes('collector')
              ? 'Every print sticker!'
              : badges.length
                ? `The ${BADGES_LABEL(badges[badges.length - 1])} badge`
                : newPrints.length
                  ? `${newPrints.length} new ${newPrints.length === 1 ? 'sticker' : 'stickers'}`
                  : 'Your lucky print',
            badges,
            newPrints,
            pick: { title: `${lucky} crossbody bag`, image: `/images/products/crossbody_bag/${lucky}.png`, to: `/products/crossbody-bag?print=${encodeURIComponent(lucky)}` },
          }), 700);
        }
      }, 450);
    } else {
      later(() => setOpen([]), 950);
    }
  };

  const restart = () => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
    setDeck(newDeck());
    setOpen([]);
    setMatched(new Set());
    setJustMatched(null);
    setMoves(0);
    setStartedAt(null);
    setElapsed(0);
    setNewBest(false);
  };

  return (
    <div className="relative">
      {/* Scoreboard */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2 text-xs font-semibold" style={{ color: '#4a443e' }}>
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5" style={{ background: '#FDF6EC' }}>
            <Footprints className="h-3.5 w-3.5" style={{ color: '#C4756E' }} /> {moves} {moves === 1 ? 'move' : 'moves'}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 tabular-nums" style={{ background: '#FDF6EC' }}>
            <Timer className="h-3.5 w-3.5" style={{ color: '#C4756E' }} /> {formatTime(elapsed)}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5" style={{ background: '#FDF6EC' }}>
            <Trophy className="h-3.5 w-3.5" style={{ color: '#C9A96E' }} /> Best: {best ?? '—'}
          </span>
        </div>
        <button type="button" onClick={restart} className="inline-flex items-center gap-1.5 text-xs font-semibold transition-colors hover:text-[#C4756E]" style={{ color: '#6b5f58' }}>
          <RotateCcw className="h-3.5 w-3.5" /> New game
        </button>
      </div>
      {!proEarned && (
        <p className="mb-3 text-center text-xs font-semibold" style={{ color: '#8a6e38' }}>
          🧠 Finish in {PRO_MOVES} moves or fewer to earn the Print Pro badge
        </p>
      )}

      {/* Board */}
      <div className="mx-auto grid max-w-[480px] grid-cols-4 gap-2.5 sm:gap-3">
        {deck.map((card, i) => {
          const isMatched = matched.has(card.print);
          const isOpen = open.includes(i) || isMatched;
          return (
            <button
              key={card.key}
              type="button"
              onClick={(e) => flip(i, e.timeStamp)}
              aria-label={isOpen ? `${card.print} card` : `Hidden card ${i + 1}`}
              className={`flip-card relative block w-full ${isOpen ? 'is-flipped' : ''}`}
              style={{ aspectRatio: '3 / 4' }}
              disabled={won}
            >
              {matchFx?.index === i && (
                <span key={matchFx.id} className="float-up pointer-events-none absolute left-1/2 top-1 z-10 whitespace-nowrap rounded-full px-2 py-0.5 text-[0.7rem] font-bold" style={{ background: '#2a2220', color: '#F2B43C' }} aria-hidden="true">
                  match! ✨
                </span>
              )}
              <span className="flip-inner block">
                {/* Card back (shown first) */}
                <span
                  className="flip-face flex items-center justify-center"
                  style={{
                    background: 'radial-gradient(circle at 30% 25%, #d68b84, #C4756E 55%, #a85d56)',
                    boxShadow: '0 8px 18px -10px rgba(59,42,38,0.45), inset 0 0 0 3px rgba(255,253,249,0.35)',
                  }}
                >
                  <span
                    className="absolute inset-2 rounded-[10px] opacity-40"
                    style={{ backgroundImage: 'radial-gradient(rgba(255,253,249,0.9) 1.2px, transparent 1.4px)', backgroundSize: '12px 12px' }}
                  />
                  <span className="font-serif relative text-2xl font-semibold sm:text-3xl" style={{ color: '#FFFDF9' }}>S</span>
                </span>
                {/* Card front */}
                <span
                  className={`flip-face flip-back ${isMatched && justMatched === card.print ? 'match-pop' : ''}`}
                  style={{
                    background: '#FFFDF9',
                    boxShadow: isMatched ? `0 0 0 3px ${card.color}, 0 10px 22px -10px ${card.color}` : '0 8px 18px -10px rgba(59,42,38,0.4)',
                  }}
                >
                  <img src={printSwatch(card.print)} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" draggable={false} />
                  <span className="absolute inset-x-0 bottom-0 px-1 py-1 text-center text-[0.6rem] font-bold sm:text-[0.7rem]" style={{ background: 'rgba(255,253,249,0.92)', color: '#2a2220' }}>
                    {card.print}
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {reveal && <RewardReveal open onClose={() => setReveal(null)} headline={reveal.headline} badges={reveal.badges} newPrints={reveal.newPrints} pick={reveal.pick} stickerSheet={reveal.stickerSheet} />}

      {/* Win screen */}
      {won && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl animate-fade-in" style={{ background: 'rgba(255,253,249,0.9)', backdropFilter: 'blur(4px)' }}>
          <div className="relative text-center px-6">
            <span className="pointer-events-none absolute left-1/2 top-1/2" aria-hidden="true">
              {CONFETTI.map((c, i) => (
                <span key={i} className="confetti-bit" style={{ background: c.color, '--cx': `${c.x}px`, '--cy': `${c.y}px`, '--cr': `${c.r}deg`, animationDuration: '1.1s' } as CSSProperties} />
              ))}
            </span>
            <p className="font-hand text-2xl" style={{ color: '#C4756E' }}>{newBest ? 'new best score!' : 'you did it!'}</p>
            <p className="font-serif mt-1 text-3xl font-medium" style={{ color: '#2a2220' }}>
              {moves} moves · {formatTime(elapsed)}
            </p>
            <p className="mt-2 text-sm" style={{ color: '#6b5f58' }}>New prints get dealt every round. Collect all 10 stickers.</p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <button type="button" onClick={restart} className="btn-primary bounce-tap">
                <RotateCcw className="h-4 w-4" /> Play again
              </button>
              <Link to="/products" className="btn-outline">Shop these prints</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
