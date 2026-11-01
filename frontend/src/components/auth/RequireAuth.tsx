import type { ReactNode } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';

/**
 * Guards pages that need a signed-in user.
 * - While the saved session is being confirmed: a spinner (no flash of the page, no wasted requests)
 * - Not signed in: sign-in page, then straight back here
 * - Signed in but not an admin on an admin page: a clear "no access" message instead of a redirect loop
 */
export default function RequireAuth({ children, admin = false }: { children: ReactNode; admin?: boolean }) {
  const { status, isAdmin, sessionExpired, user, logout } = useAuth();
  const location = useLocation();

  if (status === 'checking') return <LoadingSpinner />;

  if (status === 'guest') {
    const params = new URLSearchParams({ redirect: location.pathname + location.search });
    if (sessionExpired) params.set('reason', 'expired');
    return <Navigate to={`/signin?${params}`} replace />;
  }

  if (admin && !isAdmin) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4" style={{ background: '#FDF6EC' }}>
        <div className="max-w-sm rounded-3xl p-8 text-center" style={{ background: '#FFFDF9', boxShadow: '0 20px 50px -30px rgba(59,42,38,0.35)' }}>
          <ShieldAlert className="mx-auto mb-3 h-10 w-10" style={{ color: '#C4756E' }} />
          <h1 className="font-serif text-2xl" style={{ color: '#2a2220' }}>This page is for the Storee team</h1>
          <p className="mt-2 text-sm" style={{ color: '#6b5f58' }}>
            You're signed in as <strong>{user?.email}</strong>, which doesn't have admin access.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link to="/orders" className="btn-primary">Go to my orders</Link>
            <button type="button" onClick={logout} className="btn-ghost">Sign in with a different account</button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
