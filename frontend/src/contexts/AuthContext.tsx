import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { useCart } from '@/hooks/useCart';
import { api } from '@/services/api';
import { identifyUser, resetAnalytics } from '@/services/analytics';
import {
  AUTH_EXPIRED_EVENT,
  TOKEN_KEY,
  clearStoredSession,
  isAdminEmail,
  isTokenExpired,
  readStoredSession,
  tokenExpiresAt,
  writeStoredSession,
  type StoredUser,
} from '@/utils/session';

type User = StoredUser;

/**
 * - checking: a saved session exists and is being confirmed with the server
 * - authenticated: the session is valid
 * - guest: not signed in (or the session expired)
 */
export type AuthStatus = 'checking' | 'authenticated' | 'guest';

interface Session {
  token: string | null;
  user: User | null;
  status: AuthStatus;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  status: AuthStatus;
  login: (token: string, user: User) => void;
  logout: () => void;
  /** True while signed in (also while the saved session is being confirmed). */
  isAuthenticated: boolean;
  /** True while the saved session is being confirmed. */
  loading: boolean;
  isAdmin: boolean;
  /** True after the session ran out, until the next sign-in. Used to explain why sign-in is needed. */
  sessionExpired: boolean;
  /** Call before an action that should be tied to the account (e.g. paying). Returns false if the session just expired. */
  ensureSession: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const GUEST: Session = { token: null, user: null, status: 'guest' };

// setTimeout can't wait longer than ~24.8 days
const MAX_TIMER_MS = 2_147_000_000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session>(() => {
    const stored = readStoredSession();
    return stored ? { token: stored.token, user: stored.user, status: 'checking' } : GUEST;
  });
  const [sessionExpired, setSessionExpired] = useState(false);
  // The current token, readable from timers and event listeners without re-subscribing
  const tokenRef = useRef<string | null>(session.token);

  /** Signs out because the session is no longer valid. Safe to call more than once. */
  const expire = useCallback(
    (message = 'Your session has expired. Please sign in again.') => {
      if (!tokenRef.current) return;
      tokenRef.current = null;
      clearStoredSession();
      resetAnalytics();
      setSession(GUEST);
      setSessionExpired(true);

      const here = window.location.pathname + window.location.search;
      toast(
        (t) => (
          <span className="flex items-center gap-3 text-sm">
            <span>{message}</span>
            <button
              type="button"
              className="shrink-0 rounded-full px-3 py-1 text-xs font-semibold text-white"
              style={{ background: '#C4756E' }}
              onClick={() => {
                toast.dismiss(t.id);
                navigate(`/signin?redirect=${encodeURIComponent(here)}&reason=expired`);
              }}
            >
              Sign in
            </button>
          </span>
        ),
        { id: 'session-expired', duration: 8000 }
      );
    },
    [navigate]
  );

  // On first load: drop an expired session straight away, otherwise confirm it with the server
  useEffect(() => {
    const { token, user, status } = session;
    if (status !== 'checking' || !token) return;
    let cancelled = false;

    const confirm = async () => {
      await Promise.resolve();
      if (isTokenExpired(token)) {
        expire();
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (cancelled) return;
        const fresh = res.data?.data;
        const confirmedUser: User = fresh?.email
          ? { id: fresh.id, email: fresh.email, name: fresh.name, picture: fresh.picture }
          : (user as User);
        writeStoredSession(token, confirmedUser);
        setSession({ token, user: confirmedUser, status: 'authenticated' });
        identifyUser(confirmedUser.id, { email: confirmedUser.email, name: confirmedUser.name });
      } catch (err) {
        if (cancelled) return;
        const code = (err as AxiosError).response?.status;
        if (code === 401 || code === 404) {
          expire(code === 404 ? 'We couldn’t find your account. Please sign in again.' : undefined);
        } else {
          // Server unreachable: keep the (unexpired) session rather than signing people out offline
          setSession((s) => (s.token === token ? { ...s, status: 'authenticated' } : s));
        }
      }
    };

    confirm();
    return () => {
      cancelled = true;
    };
    // Runs once for the session found on load; later sign-ins are already confirmed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sign out at the moment the token runs out, even if the tab stays open
  useEffect(() => {
    const token = session.token;
    if (!token) return;
    const exp = tokenExpiresAt(token);
    if (!exp) return;
    const wait = exp - 30_000 - Date.now();
    if (wait > MAX_TIMER_MS) return;
    const id = window.setTimeout(() => expire(), Math.max(wait, 0));
    return () => window.clearTimeout(id);
  }, [session.token, expire]);

  // Timers pause while a laptop sleeps, so re-check when the tab comes back
  useEffect(() => {
    const check = () => {
      const token = tokenRef.current;
      if (token && document.visibilityState === 'visible' && isTokenExpired(token)) expire();
    };
    document.addEventListener('visibilitychange', check);
    window.addEventListener('focus', check);
    return () => {
      document.removeEventListener('visibilitychange', check);
      window.removeEventListener('focus', check);
    };
  }, [expire]);

  // The API client reports when the server rejects our token
  useEffect(() => {
    const onExpired = () => expire();
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, [expire]);

  // Keep tabs in sync: signing in or out in one tab applies to all
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== TOKEN_KEY && e.key !== null) return;
      const stored = readStoredSession();
      if (!stored || isTokenExpired(stored.token)) {
        if (tokenRef.current) {
          tokenRef.current = null;
          setSession(GUEST);
        }
        return;
      }
      if (stored.token !== tokenRef.current) {
        tokenRef.current = stored.token;
        setSession({ token: stored.token, user: stored.user, status: 'authenticated' });
        setSessionExpired(false);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const login = useCallback((newToken: string, newUser: User) => {
    tokenRef.current = newToken;
    writeStoredSession(newToken, newUser);
    setSession({ token: newToken, user: newUser, status: 'authenticated' });
    setSessionExpired(false);
    toast.dismiss('session-expired');
    identifyUser(newUser.id, { email: newUser.email, name: newUser.name });
  }, []);

  const logout = useCallback(() => {
    tokenRef.current = null;
    clearStoredSession();
    setSession(GUEST);
    setSessionExpired(false);
    resetAnalytics();
    // Clear cart on logout
    useCart.getState().clearCart();
  }, []);

  const ensureSession = useCallback(() => {
    const token = tokenRef.current;
    if (token && isTokenExpired(token)) {
      expire('Your session expired. Sign in again to save this order to your account, or continue as a guest.');
      return false;
    }
    return true;
  }, [expire]);

  return (
    <AuthContext.Provider
      value={{
        user: session.user,
        token: session.token,
        status: session.status,
        login,
        logout,
        isAuthenticated: !!session.token && !!session.user,
        loading: session.status === 'checking',
        isAdmin: isAdminEmail(session.user?.email),
        sessionExpired,
        ensureSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
