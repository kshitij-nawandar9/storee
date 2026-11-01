import { ALL_PRINTS, PRINT_COLORS, printSwatch } from '@/utils/rewards';

// Fixed tilt per sticker so the sheet looks hand-placed
const TILTS = [-6, 4, -3, 7, -5, 3, -8, 5, -2, 6];

/**
 * Picture of the reward sticker sheet: all 10 prints as puffy, die-cut stickers.
 * Swap in a photo of the real sheet once it's printed so the preview matches what ships.
 */
export default function StickerSheet({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const small = size === 'sm';
  return (
    <div
      className="relative mx-auto rounded-2xl"
      style={{
        width: small ? 132 : 260,
        padding: small ? 8 : 14,
        background: 'linear-gradient(160deg, #FFFFFF 0%, #F6F1EA 100%)',
        boxShadow: '0 18px 36px -18px rgba(59,42,38,0.45), inset 0 0 0 1px rgba(0,0,0,0.04)',
        transform: 'rotate(-2deg)',
      }}
      aria-label="Storee 3D sticker sheet with all 10 prints"
      role="img"
    >
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2" style={{ gap: small ? 4 : 8 }}>
        {/* Brand sticker */}
        <span
          className="col-span-2 flex items-center justify-center rounded-full font-serif font-semibold"
          style={{
            background: '#C4756E',
            color: '#FFFDF9',
            fontSize: small ? 11 : 18,
            boxShadow: '0 0 0 3px #fff, 0 4px 8px -3px rgba(0,0,0,0.35)',
            backgroundImage: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.55), transparent 45%)',
          }}
        >
          storee ✦
        </span>
        {ALL_PRINTS.map((print, i) => (
          <span
            key={print}
            className="relative block aspect-square overflow-hidden rounded-full"
            style={{
              transform: `rotate(${TILTS[i]}deg)`,
              boxShadow: `0 0 0 ${small ? 2 : 3}px #fff, 0 0 0 ${small ? 2.5 : 4}px ${PRINT_COLORS[print]}33, 0 5px 9px -3px rgba(0,0,0,0.4)`,
            }}
            title={print}
          >
            <img src={printSwatch(print)} alt="" className="h-full w-full object-cover" loading="lazy" />
            {/* puffy gloss */}
            <span className="pointer-events-none absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle at 30% 22%, rgba(255,255,255,0.75), rgba(255,255,255,0) 42%), radial-gradient(circle at 70% 85%, rgba(0,0,0,0.18), transparent 50%)' }} />
          </span>
        ))}
      </div>
      {!small && (
        <p className="mt-2 text-center text-[0.6rem] font-semibold uppercase tracking-[0.14em]" style={{ color: '#a09590' }}>
          Preview · puffy 3D stickers
        </p>
      )}
    </div>
  );
}
