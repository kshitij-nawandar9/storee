import { useSyncExternalStore } from 'react';
import { isDiwaliSeason } from '@/utils/constants';
import { safeStorage } from '@/utils/safeStorage';

/**
 * Remembers that this visitor has lit all the diyas.
 * Saved as a 'diwali-lit' badge in the same browser record the homepage games use,
 * so lighting carries over when the games ship.
 */
const KEY = 'storee:rewards';
const BADGE = 'diwali-lit';
const listeners = new Set<() => void>();

function readRecord(): Record<string, unknown> {
  try {
    const parsed = JSON.parse(safeStorage.get(KEY) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

const readLit = () => {
  const badges = readRecord().badges;
  return Array.isArray(badges) && badges.includes(BADGE);
};

let lit = typeof window === 'undefined' ? false : readLit();

/** Marks the diyas as lit. Returns true the first time. */
export function markDiyasLit(): boolean {
  if (lit) return false;
  const record = readRecord();
  const badges = Array.isArray(record.badges) ? record.badges : [];
  safeStorage.set(KEY, JSON.stringify({ ...record, badges: [...badges, BADGE] }));
  lit = true;
  listeners.forEach((fn) => fn());
  return true;
}

export const hasLitDiyas = () => lit;

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useDiyasLit() {
  return useSyncExternalStore(subscribe, () => lit, () => lit);
}

/**
 * During Diwali, the hamper links lead to the diyas until the visitor has lit them all.
 * After the season (when the diya section is gone) they open the hampers page directly.
 */
export function useHampersLocked() {
  const diyasLit = useDiyasLit();
  return isDiwaliSeason() && !diyasLit;
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
