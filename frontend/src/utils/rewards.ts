import { useSyncExternalStore } from 'react';
import { safeStorage } from '@/utils/safeStorage';
import { STICKER_REWARD_ENABLED, isDiwaliSeason } from '@/utils/constants';

/**
 * Game rewards kept in the visitor's browser: print stickers they've collected
 * and badges they've earned. These are keepsakes only. They never change prices.
 */

export const ALL_PRINTS = ['Lion', 'Unicorn', 'Space', 'Jungle Safari', 'Marine', 'Sports', 'Aqua', 'Beach', 'Bunny', 'Rainbow'] as const;
export type PrintName = (typeof ALL_PRINTS)[number];

export const PRINT_COLORS: Record<PrintName, string> = {
  Lion: '#5BA3A0',
  Unicorn: '#D4A0D4',
  Space: '#2C2C54',
  'Jungle Safari': '#4A7C59',
  Marine: '#1B4D8E',
  Sports: '#E85D3A',
  Aqua: '#1E7FD8',
  Beach: '#F4B9BF',
  Bunny: '#1A2744',
  Rainbow: '#F2A7B5',
};

/** Close-up of the fabric print, used for stickers and memory cards. */
export const printSwatch = (print: PrintName) =>
  `/images/prints/${print.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.webp`;

export type BadgeId = 'memory-win' | 'memory-pro' | 'pack-1' | 'pack-2' | 'pack-3' | 'diwali-lit' | 'collector';

export const BADGES: Record<BadgeId, { label: string; emoji: string; how: string }> = {
  'memory-win': { label: 'Print Matcher', emoji: '🃏', how: 'Finish a game of Print match' },
  'memory-pro': { label: 'Print Pro', emoji: '🧠', how: 'Finish Print match in 16 moves or fewer' },
  'pack-1': { label: 'Pouch Packer', emoji: '✏️', how: 'Clear level 1 of Pack the bag' },
  'pack-2': { label: 'Kit Organiser', emoji: '🧴', how: 'Clear level 2 of Pack the bag' },
  'pack-3': { label: 'Packing Pro', emoji: '🎒', how: 'Clear every level of Pack the bag' },
  'diwali-lit': { label: 'Diya Lighter', emoji: '🪔', how: 'Light all seven diyas' },
  collector: { label: 'Print Collector', emoji: '🏆', how: 'Collect all 10 print stickers' },
};

interface RewardsState {
  prints: PrintName[];
  badges: BadgeId[];
  /** A sticker sheet is waiting to be packed with the next order. Winning a game sets it; placing an order uses it up. */
  sheetReady: boolean;
}

const KEY = 'storee:rewards';
const listeners = new Set<() => void>();

function read(): RewardsState {
  try {
    const parsed = JSON.parse(safeStorage.get(KEY) || '{}');
    return {
      prints: Array.isArray(parsed.prints) ? parsed.prints.filter((p: string) => (ALL_PRINTS as readonly string[]).includes(p)) : [],
      badges: Array.isArray(parsed.badges) ? parsed.badges.filter((b: string) => b in BADGES) : [],
      sheetReady: parsed.sheetReady === true,
    };
  } catch {
    return { prints: [], badges: [], sheetReady: false };
  }
}

let state: RewardsState = typeof window === 'undefined' ? { prints: [], badges: [], sheetReady: false } : read();

function write(next: RewardsState) {
  state = next;
  safeStorage.set(KEY, JSON.stringify(next));
  listeners.forEach((fn) => fn());
}

/** Adds prints to the sticker book. Returns the ones that are new. Also awards the collector badge. */
export function collectPrints(prints: PrintName[]): { newPrints: PrintName[]; completedCollection: boolean } {
  const newPrints = prints.filter((p, i) => !state.prints.includes(p) && prints.indexOf(p) === i);
  if (!newPrints.length) return { newPrints, completedCollection: false };
  const nextPrints = [...state.prints, ...newPrints];
  const completedCollection = nextPrints.length === ALL_PRINTS.length && !state.badges.includes('collector');
  write({ ...state, prints: nextPrints, badges: completedCollection ? [...state.badges, 'collector'] : state.badges });
  return { newPrints, completedCollection };
}

/** Awards a badge. Returns true if it is new. */
export function earnBadge(id: BadgeId): boolean {
  if (state.badges.includes(id)) return false;
  write({ ...state, badges: [...state.badges, id] });
  return true;
}

/**
 * Call when a game is won. Unlocks a sticker sheet for the next order (one per order).
 * Returns true if this win is what unlocked it, so the game can celebrate.
 */
export function winStickerSheet(): boolean {
  if (!STICKER_REWARD_ENABLED || state.sheetReady) return false;
  write({ ...state, sheetReady: true });
  return true;
}

/** Call after an order that included the sticker sheet. The next one needs another win. */
export function consumeStickerSheet() {
  if (state.sheetReady) write({ ...state, sheetReady: false });
}

/** True when the reward is switched on and this visitor has a sheet waiting. */
export function useStickerSheet() {
  const { sheetReady } = useRewards();
  return { enabled: STICKER_REWARD_ENABLED, ready: STICKER_REWARD_ENABLED && sheetReady };
}

export function hasBadge(id: BadgeId) {
  return state.badges.includes(id);
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  // Keep tabs in sync
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      state = read();
      fn();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(fn);
    window.removeEventListener('storage', onStorage);
  };
}

export function useRewards(): RewardsState {
  return useSyncExternalStore(subscribe, () => state, () => state);
}

/** Scrolls to a homepage section, going to the homepage first if needed. */
export function goToHomeSection(navigate: (to: string) => void, pathname: string, id: string) {
  const scroll = () => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (pathname === '/') scroll();
  else {
    navigate('/');
    window.setTimeout(scroll, 350);
  }
}

/** Scrolls to the homepage games, going to the homepage first if needed. */
export function goToPlayZone(navigate: (to: string) => void, pathname: string) {
  goToHomeSection(navigate, pathname, 'play-zone');
}

/**
 * During Diwali, the hamper links lead to the diyas until the visitor has lit them all.
 * After the season (when the diya section is gone) they open the hampers page directly.
 */
export function useHampersLocked() {
  const { badges } = useRewards();
  return isDiwaliSeason() && !badges.includes('diwali-lit');
}
