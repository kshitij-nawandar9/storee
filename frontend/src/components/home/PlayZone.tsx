import { useState } from 'react';
import Reveal from '@/components/common/Reveal';
import MemoryMatch from '@/components/home/games/MemoryMatch';
import PackTheBag from '@/components/home/games/PackTheBag';
import { Link } from 'react-router-dom';
import StickerSheet from '@/components/rewards/StickerSheet';
import { ALL_PRINTS, BADGES, PRINT_COLORS, printSwatch, useRewards, useStickerSheet, type BadgeId } from '@/utils/rewards';

const GAMES = [
  { id: 'memory', label: 'Print match', emoji: '🃏', blurb: 'Flip the cards and find every pair of prints.' },
  { id: 'pack', label: 'Pack the bag', emoji: '🎒', blurb: 'Fit everything into the pouch before the clock runs out.' },
] as const;

type GameId = (typeof GAMES)[number]['id'];

export default function PlayZone() {
  const [game, setGame] = useState<GameId>('memory');
  const active = GAMES.find((g) => g.id === game)!;
  const { prints, badges } = useRewards();
  const stickerSheet = useStickerSheet();

  return (
    <section id="play-zone" className="relative scroll-mt-20 overflow-hidden py-14 sm:py-20" style={{ background: 'linear-gradient(180deg, #FDF6EC 0%, #FBEFE3 100%)' }}>
      <div aria-hidden="true" className="blob pointer-events-none absolute -left-24 top-10 h-72 w-72" style={{ background: 'radial-gradient(circle, rgba(139,168,138,0.18), transparent 70%)' }} />
      <div aria-hidden="true" className="blob blob-slow pointer-events-none absolute -right-20 bottom-0 h-80 w-80" style={{ background: 'radial-gradient(circle, rgba(201,169,110,0.2), transparent 70%)' }} />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mb-6 text-center sm:mb-8">
          <span className="section-label mb-2">Play zone</span>
          <h2 className="font-serif font-medium" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', lineHeight: 1.05, letterSpacing: '-0.025em', color: '#2a2220' }}>
            Got a minute? Play a round.
          </h2>
          <p className="font-hand mt-1 text-lg sm:text-xl" style={{ color: '#C4756E' }}>(warning: it's hard to stop at one)</p>
        </Reveal>

        {/* Sticker album: the prize (when switched on), the stickers found so far, and badges */}
        <Reveal className="mb-8">
          <div
            className="relative grid grid-cols-1 items-center gap-6 overflow-hidden rounded-[28px] p-5 sm:p-7 md:grid-cols-[auto_1fr] md:gap-10"
            style={{ background: '#FFFDF9', border: '1px solid #F2E4D0', boxShadow: '0 24px 60px -40px rgba(59,42,38,0.4)' }}
          >
            {stickerSheet.enabled && (
              <div className="relative mx-auto w-fit pt-2">
                <div className={stickerSheet.ready ? '' : 'opacity-90'}>
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
                  {stickerSheet.ready ? <>Unlocked<br />ships free</> : <>Win any<br />game</>}
                </span>
              </div>
            )}

            <div className="min-w-0">
              <p className="section-label mb-1">Your sticker album</p>
              <h3 className="font-serif text-2xl font-medium leading-tight sm:text-[1.7rem]" style={{ color: '#2a2220' }}>
                {stickerSheet.enabled
                  ? stickerSheet.ready
                    ? 'Your sticker sheet is coming with your next order.'
                    : 'Win a round, get the real sheet in your parcel.'
                  : `${prints.length} of ${ALL_PRINTS.length} prints found`}
              </h3>
              <p className="mt-1.5 text-sm" style={{ color: '#6b5f58' }}>
                {stickerSheet.enabled
                  ? stickerSheet.ready
                    ? 'Puffy 3D stickers of all 10 prints, packed free. One sheet per order.'
                    : 'Puffy 3D stickers of all 10 prints, packed free with your order.'
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
          <div className="inline-flex gap-1 rounded-full p-1" role="tablist" aria-label="Choose a game" style={{ background: '#FFFDF9', border: '1px solid #F0E0C6' }}>
            {GAMES.map((g) => {
              const isActive = g.id === game;
              return (
                <button
                  key={g.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setGame(g.id)}
                  className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300"
                  style={{ background: isActive ? '#2a2220' : 'transparent', color: isActive ? '#FDF6EC' : '#4a443e' }}
                >
                  <span aria-hidden="true">{g.emoji}</span> {g.label}
                </button>
              );
            })}
          </div>
        </div>

        <Reveal delay={100}>
          <div className="rounded-3xl p-4 sm:p-7" style={{ background: '#FFFDF9', boxShadow: '0 24px 60px -36px rgba(59,42,38,0.35)', border: '1px solid #F5E8D6' }}>
            <p className="mb-4 text-center text-sm" style={{ color: '#6b5f58' }}>{active.blurb}</p>
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
