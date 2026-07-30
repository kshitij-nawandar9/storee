import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AdminTabs from '@/components/common/AdminTabs';
import { BarChart3, ExternalLink } from 'lucide-react';

const ADMIN_EMAILS = ['thestoree.in@gmail.com', 'nawandar.kshitij@gmail.com'];

const DASHBOARD_URL = import.meta.env.VITE_POSTHOG_DASHBOARD_URL;

export default function AdminAnalytics() {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user && ADMIN_EMAILS.includes(user.email?.toLowerCase() || '');

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !isAdmin) navigate('/signin');
  }, [isAuthenticated, authLoading, isAdmin, navigate]);

  if (authLoading) return null;

  if (!isAdmin) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#FDF6EC' }}>
      <p className="text-sm" style={{ color: '#8a7e78' }}>Access denied. Admin privileges required.</p>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: '#FDF6EC' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-20">

        <div className="mb-8">
          <span className="section-label mb-1 block">Admin</span>
          <h1 className="font-serif text-2xl font-medium" style={{ color: '#2a2220' }}>Analytics</h1>
        </div>

        <AdminTabs />

        {DASHBOARD_URL ? (
          <div className="rounded-2xl overflow-hidden" style={{ background: '#FFFDF9', border: '1px solid #F0E0C6' }}>
            <iframe
              src={DASHBOARD_URL}
              title="Store analytics dashboard"
              className="w-full border-0"
              style={{ height: 'calc(100vh - 240px)', minHeight: '600px' }}
              allowFullScreen
            />
          </div>
        ) : (
          <div className="rounded-2xl p-8" style={{ background: '#FFFDF9', border: '1px solid #F0E0C6' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(196,117,110,0.1)' }}>
                <BarChart3 className="w-5 h-5" style={{ color: '#C4756E' }} />
              </div>
              <h2 className="font-serif text-lg font-medium" style={{ color: '#2a2220' }}>Dashboard not connected yet</h2>
            </div>
            <p className="text-sm mb-4" style={{ color: '#6b635b' }}>
              To show the PostHog dashboard here:
            </p>
            <ol className="text-sm space-y-2 mb-6 list-decimal list-inside" style={{ color: '#4a443e' }}>
              <li>In PostHog, open your dashboard and click <strong>Share</strong> (or ••• → Share).</li>
              <li>Enable <strong>Share dashboard publicly</strong> and copy the share link.</li>
              <li>Set <code className="px-1.5 py-0.5 rounded text-xs" style={{ background: '#F8EDDA' }}>VITE_POSTHOG_DASHBOARD_URL</code> to that link in <code className="px-1.5 py-0.5 rounded text-xs" style={{ background: '#F8EDDA' }}>frontend/.env</code> and in Vercel, then rebuild.</li>
            </ol>
            <a
              href="https://app.posthog.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all"
              style={{ background: '#3d2b2b', color: '#FDF6EC' }}
            >
              Open PostHog <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
