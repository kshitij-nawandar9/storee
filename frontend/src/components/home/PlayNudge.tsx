import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ALL_PRINTS, useRewards, useStickerSheet } from '@/utils/rewards';

/**
 * Floating "come play" button on the homepage. Appears once the hero is
 * scrolled past, hides while the games are on screen, and can be dismissed.
 */
export default function PlayNudge() {
  const { prints } = useRewards();
  const stickerSheet = useStickerSheet();
  const [pastHero, setPastHero] = useState(false);
  const [gamesVisible, setGamesVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > 700);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const target = document.getElementById('play-zone');
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => setGamesVisible(entry.isIntersecting), { threshold: 0.15 });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const complete = prints.length === ALL_PRINTS.length;
  if (!pastHero || gamesVisible || dismissed || (complete && !stickerSheet.enabled)) return null;

  const label = stickerSheet.ready
    ? 'Sticker sheet unlocked · shop now'
    : stickerSheet.enabled
      ? 'Play & win a surprise gift'
      : prints.length
        ? `${prints.length} of ${ALL_PRINTS.length} stickers · play on`
        : 'Play & find your lucky print';

  return (
    <div className="nudge-up fixed bottom-4 left-1/2 z-[65] flex items-center gap-1 rounded-full py-1 pl-1 pr-1.5" style={{ background: '#2a2220', boxShadow: '0 16px 36px -14px rgba(42,34,32,0.7)' }}>
      {stickerSheet.ready ? (
        <Link to="/products" className="inline-flex items-center gap-2 rounded-full py-2 pl-2 pr-3 text-xs font-semibold sm:text-sm" style={{ color: '#FDF6EC' }}>
          <span className="gift-bounce text-lg" aria-hidden="true">🎁</span>
          {label}
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => document.getElementById('play-zone')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          className="inline-flex items-center gap-2 rounded-full py-2 pl-2 pr-3 text-xs font-semibold sm:text-sm"
          style={{ color: '#FDF6EC' }}
        >
          <span className="gift-bounce text-lg" aria-hidden="true">🎁</span>
          {label}
        </button>
      )}
      <button type="button" onClick={() => setDismissed(true)} aria-label="Hide" className="rounded-full p-1.5 transition-colors hover:bg-white/10" style={{ color: 'rgba(253,246,236,0.7)' }}>
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
