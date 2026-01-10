import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

declare global {
  interface Window {
    google: any;
  }
}

export default function GoogleLoginButton() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [clientIdMissing, setClientIdMissing] = useState(false);
  const [googleButtonReady, setGoogleButtonReady] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn('VITE_GOOGLE_CLIENT_ID not set');
      setClientIdMissing(true);
      return;
    }

    // Check if script already exists
    if (document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
      if (window.google) {
        initializeGoogleSignIn(clientId);
      }
      return;
    }

    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      initializeGoogleSignIn(clientId);
    };

    script.onerror = () => {
      console.error('Failed to load Google Identity Services script');
      toast.error('Failed to load Google Sign-In. Please refresh the page.');
    };
  }, []);

  const initializeGoogleSignIn = (clientId: string) => {
    if (!window.google || !buttonRef.current) {
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
      });

      // Render Google's button - don't clear innerHTML, use empty container
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        width: '100%',
        text: 'signin_with',
      });
      
      // Mark Google button as ready - this will hide fallback
      setGoogleButtonReady(true);
    } catch (error) {
      console.error('Error initializing Google Sign-In:', error);
    }
  };

  const handleCredentialResponse = async (response: any) => {
    try {
      setLoading(true);

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
      
      const res = await fetch(`${apiUrl}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: response.credential }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token and user info
      login(data.data.token, data.data.user);

      toast.success(`Welcome, ${data.data.user.name}!`, {
        icon: '👋',
      });

      setLoading(false);
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed');
      setLoading(false);
    }
  };

  const handleManualClick = async () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      toast.error('Google Sign-In is not configured. Please set VITE_GOOGLE_CLIENT_ID.');
      return;
    }

    if (!window.google) {
      toast.error('Google Sign-In is still loading. Please wait a moment and try again.');
      return;
    }

    // Trigger sign-in popup
    try {
      window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'email profile',
        callback: async (response: any) => {
          if (response.access_token) {
            // Send access token to backend
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
            const res = await fetch(`${apiUrl}/auth/google`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ token: response.access_token }),
            });

            const data = await res.json();
            if (res.ok && data.success) {
              login(data.data.token, data.data.user);
              toast.success(`Welcome, ${data.data.user.name}!`, { icon: '👋' });
            } else {
              throw new Error(data.message || 'Login failed');
            }
          }
        },
      }).requestAccessToken();
    } catch (error) {
      console.error('Error triggering Google Sign-In:', error);
      toast.error('Failed to start Google Sign-In. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 rounded-lg px-4 py-3">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Signing in...</span>
      </div>
    );
  }

  if (clientIdMissing) {
    return (
      <div className="w-full">
        <button
          disabled
          className="w-full flex items-center justify-center gap-3 bg-gray-100 border-2 border-gray-300 rounded-lg px-4 py-3 font-medium text-gray-500 cursor-not-allowed"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>Google Sign-In Not Configured</span>
        </button>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Please set VITE_GOOGLE_CLIENT_ID environment variable
        </p>
      </div>
    );
  }

  // Fallback button that's always visible
  const FallbackButton = () => (
    <button
      onClick={handleManualClick}
      className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 rounded-lg px-4 py-3 font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      <span>Continue with Google</span>
    </button>
  );

  return (
    <div className="w-full">
      {/* Show fallback button until Google's button is ready */}
      {!googleButtonReady && <FallbackButton />}
      
      {/* Google's button container - separate from fallback to avoid React conflicts */}
      <div 
        ref={buttonRef} 
        className={`w-full min-h-[40px] ${googleButtonReady ? '' : 'hidden'}`}
      />
    </div>
  );
}
