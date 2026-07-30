import { trackPageView } from '@/services/analytics';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Captures a PostHog $pageview on every route change (SPA navigation).
export default function PageViewTracker() {
  const location = useLocation();

  useEffect(() => {
    trackPageView();
  }, [location.pathname]);

  return null;
}
