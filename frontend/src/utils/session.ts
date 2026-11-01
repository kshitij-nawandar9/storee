/** Helpers for the stored login session (token + user in localStorage). */

export const TOKEN_KEY = 'auth_token';
export const USER_KEY = 'auth_user';

/** Fired by the API client when the server rejects our token, so the auth context can sign out cleanly. */
export const AUTH_EXPIRED_EVENT = 'storee:auth-expired';

/** Treat a token as expired a little early so a request never goes out with seconds to spare. */
const EXPIRY_SKEW_MS = 30_000;

// Who can see the admin pages. The backend enforces this separately; this only shapes the UI.
const ADMIN_EMAILS = ['thestoree.in@gmail.com', 'nawandar.kshitij@gmail.com'];

export const isAdminEmail = (email?: string | null) => !!email && ADMIN_EMAILS.includes(email.toLowerCase());

/** Reads the `exp` claim from a JWT, in milliseconds. Null if the token can't be read. */
export function tokenExpiresAt(token: string): number | null {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const exp = JSON.parse(json).exp;
    return typeof exp === 'number' ? exp * 1000 : null;
  } catch {
    return null;
  }
}

/** True when the token is unreadable or past (or about to pass) its expiry. */
export function isTokenExpired(token: string, now = Date.now()): boolean {
  const exp = tokenExpiresAt(token);
  return exp === null || exp - EXPIRY_SKEW_MS <= now;
}

export interface StoredUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export function readStoredSession(): { token: string; user: StoredUser } | null {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const rawUser = localStorage.getItem(USER_KEY);
    if (!token || !rawUser) return null;
    const user = JSON.parse(rawUser) as StoredUser;
    return user && typeof user.email === 'string' ? { token, user } : null;
  } catch {
    return null;
  }
}

export function writeStoredSession(token: string, user: StoredUser) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // Storage blocked: the session still works for this page view
  }
}

export function clearStoredSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    // ignore
  }
}

/** Only allow redirects to paths on this site (blocks `//evil.com` and full URLs). */
export function safeRedirect(path: string | null | undefined, fallback = '/orders') {
  return path && path.startsWith('/') && !path.startsWith('//') ? path : fallback;
}
