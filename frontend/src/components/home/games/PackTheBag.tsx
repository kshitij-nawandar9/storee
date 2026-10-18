import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { RotateCw, Timer, RotateCcw, ArrowRight } from 'lucide-react';
import { trackEvent } from '@/services/analytics';
import RewardReveal from '@/components/rewards/RewardReveal';
import { ALL_PRINTS, BADGES, earnBadge, winStickerSheet, type BadgeId } from '@/utils/rewards';

interface Item {
  id: string;
  name: string;
  emoji: string;
  w: number;
  h: number;
  color: string;
}

interface Level {
  cols: number;
  rows: number;
  seconds: number;
  pouch: string;
  items: Item[];
}

const ITEM = {
  bottle:     { name: 'Water bottle', emoji: '🧃', w: 1, h: 3, color: '#A8D5E2' },
  toothbrush: { name: 'Toothbrush', emoji: '🪥', w: 1, h: 3, color: '#C9E4C5' },
  crayons:    { name: 'Crayons', emoji: '🖍️', w: 2, h: 1, color: '#F6C6A8' },
  snack:      { name: 'Snack box', emoji: '🥪', w: 2, h: 2, color: '#F8D98B' },
  car:        { name: 'Toy car', emoji: '🚗', w: 2, h: 1, color: '#F4A7A0' },
  ball:       { name: 'Ball', emoji: '⚽', w: 1, h: 1, color: '#D9D2E9' },
  sticker:    { name: 'Stickers', emoji: '⭐', w: 1, h: 1, color: '#FBE3A1' },
  book:       { name: 'Story book', emoji: '📕', w: 2, h: 3, color: '#E8B4B8' },
  pencil:     { name: 'Pencil', emoji: '✏️', w: 4, h: 1, color: '#FFE08A' },
} satisfies Record<string, Omit<Item, 'id'>>;

const make = (keys: (keyof typeof ITEM)[]): Item[] => keys.map((k, i) => ({ id: `${k}-${i}`, ...ITEM[k] }));

// Every level's items fill its pouch exactly, so each one has at least one perfect packing.
const LEVELS: Level[] = [
  { cols: 4, rows: 4, seconds: 60, pouch: 'Pencil pouch', items: make(['snack', 'bottle', 'toothbrush', 'crayons', 'car', 'ball', 'sticker']) },
  { cols: 5, rows: 4, seconds: 60, pouch: 'Toiletry kit', items: make(['book', 'snack', 'bottle', 'toothbrush', 'crayons', 'ball', 'sticker']) },
  { cols: 5, rows: 5, seconds: 75, pouch: 'Kids backpack', items: make(['pencil', 'book', 'snack', 'bottle', 'toothbrush', 'car', 'crayons', 'ball']) },
];

interface Placement { x: number; y: number; w: number; h: number }
type Status = 'ready' | 'playing' | 'won' | 'lost' | 'done';

export default function PackTheBag() {
  const [levelIndex, setLevelIndex] = useState(0);
  const [placed, setPlaced] = useState<Record<string, Placement>>({});
  const [rotated, setRotated] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null);
  const [status, setStatus] = useState<Status>('ready');
  const [timeLeft, setTimeLeft] = useState(LEVELS[0].seconds);
  const [bump, setBump] = useState(0);
  const [lastPlaced, setLastPlaced] = useState<string | null>(null);
  const [levelBadge, setLevelBadge] = useState<BadgeId | null>(null);
  const [finalReveal, setFinalReveal] = useState<{ headline: string; badges: BadgeId[]; print: string; stickerSheet: boolean } | null>(null);

  const level = LEVELS[levelIndex];
  const itemsById = useMemo(() => Object.fromEntries(level.items.map((it) => [it.id, it])), [level]);
  const tray = level.items.filter((it) => !placed[it.id]);

  const dims = useCallback(
    (id: string) => {
      const it = itemsById[id];
      return rotated[id] ? { w: it.h, h: it.w } : { w: it.w, h: it.h };
    },
    [itemsById, rotated]
  );

  // Which item fills each cell
  const occupancy = useMemo(() => {
    const grid: (string | null)[][] = Array.from({ length: level.rows }, () => Array(level.cols).fill(null));
    Object.entries(placed).forEach(([id, p]) => {
      for (let y = p.y; y < p.y + p.h; y++) for (let x = p.x; x < p.x + p.w; x++) grid[y][x] = id;
    });
    return grid;
  }, [placed, level]);

  const fits = (id: string, x: number, y: number) => {
    const { w, h } = dims(id);
    if (x + w > level.cols || y + h > level.rows) return false;
    for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) if (occupancy[yy][xx] && occupancy[yy][xx] !== id) return false;
    return true;
  };

  // Running out of time ends the level.
  const outOfTime = timeLeft === 0;
  const phase: Status = status === 'playing' && outOfTime ? 'lost' : status;
  const finished = phase === 'won' || phase === 'lost' || phase === 'done';

  // Countdown
  useEffect(() => {
    if (status !== 'playing' || outOfTime) return;
    const id = window.setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => window.clearInterval(id);
  }, [status, outOfTime]);

  const start = () => {
    if (status === 'ready') setStatus('playing');
  };

  const rotateSelected = useCallback(() => {
    if (!selected) return;
    setRotated((r) => ({ ...r, [selected]: !r[selected] }));
  }, [selected]);

  // R rotates the selected item
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'r' || e.key === 'R') && selected && !(e.target instanceof HTMLInputElement)) rotateSelected();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected, rotateSelected]);

  const pickFromTray = (id: string) => {
    if (finished) return;
    start();
    if (selected === id) rotateSelected();
    else setSelected(id);
  };

  const clickCell = (x: number, y: number) => {
    if (finished) return;
    start();
    const occupant = occupancy[y][x];

    if (!selected) {
      // Tap a packed item to take it back out
      if (occupant) {
        setPlaced((prev) => {
          const next = { ...prev };
          delete next[occupant];
          return next;
        });
        setSelected(occupant);
      }
      return;
    }

    if (!fits(selected, x, y)) {
      setBump((b) => b + 1);
      return;
    }

    const nextPlaced = { ...placed, [selected]: { x, y, ...dims(selected) } };
    setPlaced(nextPlaced);
    setLastPlaced(selected);
    setSelected(null);

    if (Object.keys(nextPlaced).length === level.items.length) {
      const isLast = levelIndex === LEVELS.length - 1;
      setStatus(isLast ? 'done' : 'won');
      trackEvent('pack_bag_level_won', { level: levelIndex + 1, seconds_left: timeLeft });

      const badge = `pack-${levelIndex + 1}` as BadgeId;
      const isNew = earnBadge(badge);
      setLevelBadge(badge);
      // Clearing any level counts as a win for the sticker sheet
      const sheetUnlocked = winStickerSheet();
      if (isLast || sheetUnlocked) {
        window.setTimeout(() => {
          const print = ALL_PRINTS[Math.floor(Math.random() * ALL_PRINTS.length)];
          setFinalReveal({
            headline: sheetUnlocked ? 'A free 3D sticker sheet!' : 'The Packing Pro badge',
            badges: isNew ? [badge] : [],
            print,
            stickerSheet: sheetUnlocked,
          });
        }, 600);
      }
    }
  };

  const loadLevel = (index: number) => {
    setLevelIndex(index);
    setPlaced({});
    setRotated({});
    setSelected(null);
    setHover(null);
    setLastPlaced(null);
    setLevelBadge(null);
    setTimeLeft(LEVELS[index].seconds);
    setStatus('ready'); // the clock starts on the first tap
  };

  const ghost = selected && hover && !finished ? { ...hover, ...dims(selected), ok: fits(selected, hover.x, hover.y) } : null;
  const urgent = phase === 'playing' && timeLeft <= 10;

  return (
    <div>
      {finalReveal && (
        <RewardReveal
          open
          onClose={() => setFinalReveal(null)}
          headline={finalReveal.headline}
          badges={finalReveal.badges}
          stickerSheet={finalReveal.stickerSheet}
          pick={{
            title: `${finalReveal.print} packing cubes`,
            image: `/images/products/packing_cubes/${finalReveal.print}.${['Jungle Safari', 'Marine', 'Space', 'Sports', 'Unicorn'].includes(finalReveal.print) ? 'png' : 'jpg'}`,
            to: `/products/packing-cubes?print=${encodeURIComponent(finalReveal.print)}`,
          }}
        />
      )}
      {/* Status bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold" style={{ color: '#4a443e' }}>
          <span className="rounded-full px-3 py-1.5" style={{ background: '#FDF6EC' }}>
            Level {levelIndex + 1}/{LEVELS.length} · {level.pouch}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 tabular-nums ${urgent ? 'animate-pulse-soft' : ''}`}
            style={{ background: urgent ? '#C4756E' : '#FDF6EC', color: urgent ? '#fff' : undefined, transition: 'background 0.3s' }}
          >
            <Timer className="h-3.5 w-3.5" /> {timeLeft}s
          </span>
        </div>
        <button type="button" onClick={() => loadLevel(levelIndex)} className="inline-flex items-center gap-1.5 text-xs font-semibold transition-colors hover:text-[#C4756E]" style={{ color: '#6b5f58' }}>
          <RotateCcw className="h-3.5 w-3.5" /> Restart level
        </button>
      </div>

      <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-[1fr_1fr]">
        {/* Pouch */}
        <div className="relative mx-auto w-full max-w-[340px]">
          <div className="relative rounded-[22px] p-3 pt-6" style={{ background: 'repeating-linear-gradient(45deg, #5BA3A0 0 10px, #67ADA9 10px 20px)', boxShadow: '0 18px 36px -20px rgba(42,60,58,0.6)' }}>
            {/* zipper */}
            <div className="absolute inset-x-6 top-2 h-2 rounded-full" style={{ background: 'repeating-linear-gradient(90deg, #F2B43C 0 4px, #c9902a 4px 6px)' }} />
            <div className="absolute right-4 top-0.5 h-4 w-2.5 rounded-sm" style={{ background: '#F2B43C' }} />

            <div
              key={bump}
              className={`relative grid gap-1 rounded-xl p-1.5 ${bump ? 'shake' : ''}`}
              style={{ gridTemplateColumns: `repeat(${level.cols}, 1fr)`, gridTemplateRows: `repeat(${level.rows}, 1fr)`, aspectRatio: `${level.cols} / ${level.rows}`, background: 'rgba(255,253,249,0.92)' }}
              onMouseLeave={() => setHover(null)}
            >
              {occupancy.map((row, y) =>
                row.map((_, x) => (
                  <button
                    key={`${x}-${y}`}
                    type="button"
                    aria-label={`Row ${y + 1}, column ${x + 1}`}
                    onClick={() => clickCell(x, y)}
                    onMouseEnter={() => setHover({ x, y })}
                    className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#C4756E]"
                    style={{ gridColumn: x + 1, gridRow: y + 1, background: 'rgba(196,117,110,0.07)', border: '1.5px dashed rgba(196,117,110,0.25)' }}
                  />
                ))
              )}

              {/* Packed items */}
              {Object.entries(placed).map(([id, p]) => {
                const it = itemsById[id];
                return (
                  <div
                    key={id}
                    className={`pointer-events-none flex flex-col items-center justify-center rounded-lg ${lastPlaced === id ? 'piece-place' : ''}`}
                    style={{ gridColumn: `${p.x + 1} / span ${p.w}`, gridRow: `${p.y + 1} / span ${p.h}`, background: it.color, boxShadow: 'inset 0 -3px 0 rgba(0,0,0,0.08), 0 2px 6px -2px rgba(0,0,0,0.2)', zIndex: 1 }}
                  >
                    <span className="text-2xl sm:text-3xl">{it.emoji}</span>
                  </div>
                );
              })}

              {/* Placement preview */}
              {ghost && (
                <div
                  className="pointer-events-none rounded-lg"
                  style={{
                    gridColumn: `${ghost.x + 1} / span ${Math.min(ghost.w, level.cols - ghost.x)}`,
                    gridRow: `${ghost.y + 1} / span ${Math.min(ghost.h, level.rows - ghost.y)}`,
                    background: ghost.ok ? 'rgba(139,168,138,0.45)' : 'rgba(196,117,110,0.4)',
                    border: `2px solid ${ghost.ok ? '#6d8d6b' : '#C4756E'}`,
                    zIndex: 2,
                  }}
                />
              )}
            </div>
          </div>

          {/* Level result */}
          {finished && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[22px] animate-fade-in" style={{ background: 'rgba(255,253,249,0.92)', backdropFilter: 'blur(3px)' }}>
              <div className="px-5 text-center">
                <p className="text-4xl">{phase === 'lost' ? '⏰' : phase === 'done' ? '🏆' : '🎉'}</p>
                <p className="font-serif mt-2 text-2xl font-medium" style={{ color: '#2a2220' }}>
                  {phase === 'lost' ? "Time's up" : phase === 'done' ? 'Packing pro!' : 'All packed!'}
                </p>
                {phase !== 'lost' && levelBadge && (
                  <p className="sticker-in mx-auto mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold" style={{ background: 'radial-gradient(circle at 35% 30%, #FFF3C4, #F2B43C)', color: '#2a2220' }}>
                    {BADGES[levelBadge].emoji} {BADGES[levelBadge].label} badge
                  </p>
                )}
                <p className="mt-1 text-sm" style={{ color: '#6b5f58' }}>
                  {phase === 'lost' ? 'So close. One more go?' : phase === 'done' ? 'You packed every bag. Our organisers make it this easy in real life.' : `${timeLeft}s to spare.`}
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {phase === 'won' && (
                    <button type="button" className="btn-primary bounce-tap" onClick={() => loadLevel(levelIndex + 1)}>
                      Next level <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                  {phase === 'lost' && (
                    <button type="button" className="btn-primary bounce-tap" onClick={() => loadLevel(levelIndex)}>
                      <RotateCcw className="h-4 w-4" /> Try again
                    </button>
                  )}
                  {phase === 'done' && (
                    <>
                      <button type="button" className="btn-primary bounce-tap" onClick={() => loadLevel(0)}>
                        <RotateCcw className="h-4 w-4" /> Play again
                      </button>
                      <Link to="/products?category=Organisers+and+Pouches" className="btn-outline">Shop organisers</Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tray */}
        <div>
          <p className="mb-2 text-sm" style={{ color: '#6b5f58' }}>
            {phase === 'ready'
              ? 'Pick an item, then tap a square in the pouch to pack it. Fill every square before time runs out.'
              : selected
                ? `Now tap where the ${itemsById[selected].name.toLowerCase()} should go.`
                : tray.length
                  ? 'Pick the next item. Tap a packed item to take it out again.'
                  : 'Everything is in.'}
          </p>
          <div className="flex min-h-[120px] flex-wrap content-start gap-2.5 rounded-2xl p-3" style={{ background: '#FDF6EC', border: '1.5px dashed #F0E0C6' }}>
            {tray.map((it) => {
              const { w, h } = dims(it.id);
              const isSel = selected === it.id;
              return (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => pickFromTray(it.id)}
                  aria-pressed={isSel}
                  aria-label={`${it.name}, ${w} by ${h}`}
                  className="print-swatch grid gap-0.5 rounded-lg p-1"
                  style={{
                    gridTemplateColumns: `repeat(${w}, 30px)`,
                    gridTemplateRows: `repeat(${h}, 30px)`,
                    background: isSel ? '#2a2220' : 'transparent',
                    boxShadow: isSel ? '0 8px 18px -8px rgba(42,34,32,0.6)' : undefined,
                  } as CSSProperties}
                >
                  <span className="flex items-center justify-center rounded-md text-lg" style={{ gridColumn: `1 / span ${w}`, gridRow: `1 / span ${h}`, background: it.color }}>
                    {it.emoji}
                  </span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={rotateSelected}
            disabled={!selected}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all disabled:opacity-40"
            style={{ background: '#FFFDF9', border: '1.5px solid #F0E0C6', color: '#2a2220' }}
          >
            <RotateCw className="h-3.5 w-3.5" /> Rotate <span className="hidden sm:inline" style={{ color: '#a09590' }}>(or press R, or tap the item again)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
