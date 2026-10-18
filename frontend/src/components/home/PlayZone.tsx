import { useState, type CSSProperties } from 'react';
import Reveal from '@/components/common/Reveal';
import MemoryMatch from '@/components/home/games/MemoryMatch';
import PackTheBag from '@/components/home/games/PackTheBag';
import { Link } from 'react-router-dom';
import StickerSheet from '@/components/rewards/StickerSheet';
import { GiftBox } from '@/components/rewards/RewardReveal';
import { ALL_PRINTS, BADGES, PRINT_COLORS, printSwatch, useRewards, useStickerSheet, type BadgeId } from '@/utils/rewards';

const GAMES = [
  { id: 'memory', label: 'Print match', emoji: '🃏', blurb: 'Flip the cards and find every pair of prints.' },
  { id: 'pack', label: 'Pack the bag', emoji: '🎒', blurb: 'Fit everything into the pouch before the clock runs out.' },
] as const;

type GameId = (typeof GAMES)[number]['id'];

const NAVY = '#1f2a44';

// Print bubbles drifting up the background (fixed values so renders stay pure)
const BUBBLES = ALL_PRINTS.map((print, i) => ({
  print,
  left: (i * 9.7 + 3) % 96,
  size: 34 + ((i * 17) % 4) * 14,
  rise: 16 + ((i * 7) % 5) * 3,
  delay: -((i * 5.3) % 18),
  sway: (i % 2 ? 1 : -1) * (14 + (i % 3) * 10),
  opacity: i % 3 === 0 ? 0.55 : 0.9,
}));

// Headline word that bobs letter by letter, in print colours
const WAVE_COLORS = ['#E85D3A', '#1E7FD8', '#E9A23B', '#4A7C59', '#C4756E', '#5BA3A0', '#8E5BB5'];

function WavyText({ text }: { text: string }) {
  let n = 0; // running letter index, for the wave delay and colour
  return (
    <span aria-label={text}>
      {text.split(' ').map((word, w) => (
        // Each word stays on one line; only the gaps between words can wrap
        <span key={w} aria-hidden="true" className="inline-block whitespace-nowrap">
          {word.split('').map((ch) => {
            const i = n++;
            return (
              <span key={i} className="letter-bob" style={{ animationDelay: `${i * 0.08}s`, color: WAVE_COLORS[i % WAVE_COLORS.length] }}>
                {ch}
              </span>
            );
          })}
          {w < text.split(' ').length - 1 && '\u00A0'}
        </span>
      ))}
    </span>
  );
}

export default function PlayZone() {
  const [game, setGame] = useState<GameId>('memory');
  const active = GAMES.find((g) => g.id === game)!;
  const { prints, badges } = useRewards();
  const stickerSheet = useStickerSheet();

  return (
    <section
      id="play-zone"
      className="relative scroll-mt-20 overflow-hidden pb-24 pt-24 sm:pb-28 sm:pt-28"
      style={{ background: 'linear-gradient(180deg, #FDF6EC 0%, #D6EFEA 7%, #A9DCD5 30%, #9AD4CC 60%, #BFE5DF 88%, #FDF6EC 100%)' }}
    >
      {/* Playroom decor: rising print bubbles and twinkling sparkles */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {BUBBLES.map((b) => (
          <span
            key={b.print}
            className="bubble-rise absolute overflow-hidden rounded-full"
            style={{
              left: `${b.left}%`,
              bottom: -80,
              width: b.size,
              height: b.size,
              boxShadow: '0 0 0 3px rgba(255,253,249,0.85), 0 10px 20px -10px rgba(31,42,68,0.4)',
              animationDelay: `${b.delay}s`,
              '--rise': `${b.rise}s`,
              '--sway': `${b.sway}px`,
              '--bubble-opacity': b.opacity,
            } as CSSProperties}
          >
            <img src={printSwatch(b.print)} alt="" className="h-full w-full object-cover" loading="lazy" />
          </span>
        ))}
        {Array.from({ length: 18 }, (_, i) => (
          <span
            key={i}
            className="twinkle absolute"
            style={{ left: `${(i * 37) % 100}%`, top: `${8 + ((i * 23) % 84)}%`, animationDelay: `${(i % 6) * 0.45}s`, color: ['#FFF6D6', '#F2B43C', '#FFFFFF', '#E85D3A'][i % 4], fontSize: 10 + (i % 3) * 6 }}
          >
            ✦
          </span>
        ))}
      </div>

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mb-6 text-center sm:mb-8">
          <span className="mb-3 inline-block rounded-full px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.16em]" style={{ background: NAVY, color: '#F2B43C' }}>
            🎮 Play zone
          </span>
          <h2 className="font-serif font-medium" style={{ fontSize: 'clamp(2.2rem, 6vw, 3.6rem)', lineHeight: 1.05, letterSpacing: '-0.025em', color: NAVY }}>
            Got a minute? <WavyText text="Play a round." />
          </h2>
          <p className="font-hand mt-1 text-xl sm:text-2xl" style={{ color: NAVY, opacity: 0.75 }}>(warning: it's hard to stop at one)</p>
        </Reveal>

        {/* Sticker album: the prize (when switched on), the stickers found so far, and badges */}
        <Reveal className="mb-8">
          <div
            className="relative grid grid-cols-1 items-center gap-6 overflow-hidden rounded-[28px] p-5 sm:p-7 md:grid-cols-[auto_1fr] md:gap-10"
            style={{ background: '#FFFDF9', boxShadow: '0 8px 0 rgba(31,42,68,0.12), 0 30px 60px -30px rgba(31,42,68,0.45)' }}
          >
            {/* Before a win the prize stays wrapped: a mystery box. After, the real sheet. */}
            {stickerSheet.enabled && !stickerSheet.ready && (
              <div className="relative mx-auto h-[190px] w-[220px]">
                <span className="glow-pulse absolute left-1/2 top-1/2 h-44 w-44 rounded-full" style={{ background: 'radial-gradient(circle, rgba(242,180,60,0.35), rgba(242,180,60,0) 65%)' }} aria-hidden="true" />
                <GiftBox phase="box" idle />
                <span className="font-serif absolute left-[62%] top-[18%] flex h-9 w-9 rotate-12 items-center justify-center rounded-full text-lg font-semibold" style={{ background: '#1f2a44', color: '#F2B43C', boxShadow: '0 4px 0 #121a2e' }} aria-hidden="true">
                  ?
                </span>
              </div>
            )}
            {stickerSheet.ready && (
              <div className="relative mx-auto w-fit pt-2">
                <div>
                  <StickerSheet />
                </div>
                {/* Rubber stamp */}
                <span
                  className={`absolute -right-4 top-1 rotate-[14deg] rounded-md px-2.5 py-1 text-center text-[0.62rem] font-black uppercase leading-tight tracking-[0.16em] ${stickerSheet.ready ? 'sticker-in' : ''}`}
                  style={{
                    color: stickerSheet.ready ? '#4f7a4e' : '#C4756E',
                    border: `2.5px solid ${stickerSheet.ready ? '#4f7a4e' : '#C4756E'}`,
                    background: 'rgba(255,253,249,0.88)',
                    boxShadow: `inset 0 0 0 2px rgba(255,253,249,0.9), inset 0 0 0 3.5px ${stickerSheet.ready ? '#4f7a4e' : '#C4756E'}`,
                  }}
                >
                  Unlocked<br />ships free
                </span>
              </div>
            )}

            <div className="min-w-0">
              <p className="section-label mb-1">{stickerSheet.enabled && !stickerSheet.ready ? 'Mystery gift' : 'Your sticker album'}</p>
              <h3 className="font-serif text-2xl font-medium leading-tight sm:text-[1.7rem]" style={{ color: '#2a2220' }}>
                {stickerSheet.enabled
                  ? stickerSheet.ready
                    ? 'Your sticker sheet is coming with your next order.'
                    : 'A surprise gift is waiting for you.'
                  : `${prints.length} of ${ALL_PRINTS.length} prints found`}
              </h3>
              <p className="mt-1.5 text-sm" style={{ color: '#6b5f58' }}>
                {stickerSheet.enabled
                  ? stickerSheet.ready
                    ? 'Puffy 3D stickers of all 10 prints, packed free. One sheet per order.'
                    : "Win any round to unwrap it. It's real, and it's free."
                  : 'Every Print match round deals new prints. Find all 10.'}
                {stickerSheet.ready && (
                  <Link to="/products" className="ml-1.5 font-semibold underline decoration-[#C4756E] decoration-2 underline-offset-4" style={{ color: '#2a2220' }}>
                    Shop now
                  </Link>
                )}
              </p>

              {/* Prints found */}
              <div className="mt-5">
                <div className="mb-2 flex items-baseline justify-between text-xs" style={{ color: '#8a7e78' }}>
                  <span className="font-semibold" style={{ color: '#4a443e' }}>Prints found</span>
                  <span className="tabular-nums">{prints.length}/{ALL_PRINTS.length}</span>
                </div>
                <div className="grid grid-cols-10 gap-1.5 sm:gap-2">
                  {ALL_PRINTS.map((p) => {
                    const has = prints.includes(p);
                    return (
                      <span
                        key={p}
                        title={has ? p : 'Not found yet'}
                        className={`relative block aspect-square overflow-hidden rounded-full ${has ? 'sticker-in' : ''}`}
                        style={{
                          boxShadow: has ? `0 0 0 2px #FFFDF9, 0 0 0 3.5px ${PRINT_COLORS[p]}66, 0 4px 8px -4px rgba(0,0,0,0.35)` : 'inset 0 0 0 1.5px #E8D9C5',
                          background: has ? undefined : 'repeating-linear-gradient(45deg, #F8EFE3 0 4px, #F3E7D7 4px 8px)',
                        }}
                      >
                        {has && <img src={printSwatch(p)} alt={p} className="h-full w-full object-cover" loading="lazy" />}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Badges as pins */}
              <div className="mt-5 flex flex-wrap gap-x-2.5 gap-y-3 sm:gap-x-3">
                {(Object.keys(BADGES) as BadgeId[]).map((id) => {
                  const earned = badges.includes(id);
                  return (
                    <div key={id} className="flex w-[52px] flex-col items-center text-center" title={BADGES[id].how}>
                      <span
                        className="flex h-11 w-11 items-center justify-center rounded-full text-xl"
                        style={
                          earned
                            ? { background: 'radial-gradient(circle at 35% 30%, #FFF6D6, #E9B949 70%, #C99A32)', boxShadow: '0 6px 12px -6px rgba(150,110,30,0.7), inset 0 -2px 0 rgba(0,0,0,0.12)' }
                            : { background: '#F6EEE3', filter: 'grayscale(1)', opacity: 0.45, boxShadow: 'inset 0 0 0 1.5px #E8D9C5' }
                        }
                      >
                        {BADGES[id].emoji}
                      </span>
                      <span className="mt-1 text-[0.6rem] font-semibold leading-tight" style={{ color: earned ? '#4a443e' : '#b4a898' }}>{BADGES[id].label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Reveal>

        {/* Game switcher */}
        <div className="mb-5 flex justify-center">
          <div className="inline-flex gap-3" role="tablist" aria-label="Choose a game">
            {GAMES.map((g) => {
              const isActive = g.id === game;
              return (
                <button
                  key={g.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setGame(g.id)}
                  className="toy-btn inline-flex items-center gap-1.5 rounded-2xl px-5 py-2.5 text-sm font-bold sm:text-base"
                  style={{
                    background: isActive ? '#F2B43C' : '#FFFDF9',
                    color: NAVY,
                    boxShadow: isActive ? '0 5px 0 #C9902A, 0 12px 20px -10px rgba(201,144,42,0.6)' : '0 5px 0 rgba(31,42,68,0.15)',
                    transform: isActive ? 'translateY(-2px) rotate(-1.5deg)' : undefined,
                  }}
                >
                  <span aria-hidden="true">{g.emoji}</span> {g.label}
                </button>
              );
            })}
          </div>
        </div>

        <Reveal delay={100}>
          <div className="rounded-[28px] p-4 sm:p-7" style={{ background: '#FFFDF9', boxShadow: '0 8px 0 rgba(31,42,68,0.12), 0 30px 60px -30px rgba(31,42,68,0.45)' }}>
            <p className="mb-4 text-center text-sm font-semibold" style={{ color: NAVY }}>{active.blurb}</p>
            {/* Keyed so switching tabs starts a fresh game */}
            <div key={game} className="animate-fade-in" role="tabpanel">
              {game === 'memory' ? <MemoryMatch /> : <PackTheBag />}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
