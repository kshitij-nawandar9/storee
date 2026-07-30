import posthog from 'posthog-js';

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';

let initialized = false;

export function initAnalytics() {
  if (!POSTHOG_KEY) {
    console.log('[Analytics] VITE_POSTHOG_KEY not set — analytics disabled');
    return;
  }

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    // Pageviews are captured manually on route change (SPA), see PageViewTracker
    capture_pageview: false,
    capture_pageleave: true,
    autocapture: true,
    persistence: 'localStorage+cookie',
  });
  initialized = true;

  // Expose for debugging in the browser console during development
  if (import.meta.env.DEV) {
    (window as unknown as { posthog: typeof posthog }).posthog = posthog;
  }
}

export function trackPageView() {
  if (!initialized) return;
  posthog.capture('$pageview');
}

export function trackEvent(name: string, properties?: Record<string, unknown>) {
  if (!initialized) return;
  posthog.capture(name, properties);
}

export function identifyUser(id: string, properties?: { email?: string; name?: string }) {
  if (!initialized) return;
  posthog.identify(id, properties);
}

export function resetAnalytics() {
  if (!initialized) return;
  posthog.reset();
}
