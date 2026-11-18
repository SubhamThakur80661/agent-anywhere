import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import { useAuthStore } from '../store/authStore.js';
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { WalletConnect } from '../components/wallet/WalletConnect.jsx';

function Login() {
  const navigate = useNavigate();
  const {
    login: loginGoogle,
    loginWithWallet,
    loginAsGuest,
    isAuthenticated,
    isGuest,
    isLoading,
    error,
    clearError,
    setUser,
    setToken,
    setGuest,
    setLoading,
    setError,
  } = useAuthStore();
  const { connected, publicKey, signMessage } = useWallet();
  const [walletLoading, setWalletLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const redirectAfterLogin = useCallback(async () => {
    try {
      const { checkPlatformConnections } = await import('../lib/apiClient.js');
      const connections = await checkPlatformConnections();
      if (connections && !connections.has_connections) {
        navigate('/settings');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error checking platform connections:', error);
      navigate('/dashboard');
    }
  }, [navigate]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Guests have no connections by design; send them straight to the dashboard
      if (isGuest) {
        navigate('/dashboard');
      } else {
        redirectAfterLogin();
      }
    }
  }, [isAuthenticated, isGuest, navigate, redirectAfterLogin]);

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Handle wallet connection - auto-login when wallet connects
  useEffect(() => {
    const handleWalletLogin = async () => {
      if (connected && publicKey && signMessage && !isAuthenticated && !walletLoading) {
        setWalletLoading(true);
        try {
          const walletAddress = publicKey.toBase58();
          const result = await loginWithWallet(walletAddress, signMessage);

          if (result.success) {
            toast.success('Wallet connected successfully!');
            await redirectAfterLogin();
          } else {
            toast.error(result.error || 'Wallet authentication failed');
          }
        } catch (error) {
          console.error('Wallet login error:', error);
          toast.error('Failed to authenticate with wallet');
        } finally {
          setWalletLoading(false);
        }
      }
    };

    handleWalletLogin();
  }, [connected, publicKey, signMessage, isAuthenticated, walletLoading, loginWithWallet, redirectAfterLogin]);

  // Handle Google callback
  const handleGoogleCallback = useCallback(async (response) => {
    try {
      if (!response.credential) {
        throw new Error('No credential received from Google');
      }

      const result = await loginGoogle(response.credential);
      if (result.success) {
        await redirectAfterLogin();
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Google sign-in failed');
    }
  }, [loginGoogle, redirectAfterLogin]);

  // Handle Google login
  const handleGoogleLogin = async () => {
    try {
      if (window.google && window.google.accounts) {
        // Create a temporary button to trigger the OAuth flow
        const tempDiv = document.createElement('div');
        tempDiv.style.display = 'none';
        document.body.appendChild(tempDiv);

        window.google.accounts.id.renderButton(tempDiv, {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
          width: 200,
          logo_alignment: 'left',
          type: 'standard'
        });

        // Trigger click on the rendered button
        setTimeout(() => {
          const button = tempDiv.querySelector('div[role="button"]');
          if (button) {
            button.click();
          }
          document.body.removeChild(tempDiv);
        }, 100);
      } else {
        toast.error('Google sign-in is not available right now');
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Google sign-in failed');
    }
  };

  // Initialize Google OAuth when component mounts
  useEffect(() => {
    const initializeGoogleAuth = async () => {
      try {
        if (!window.google) {
          const script = document.createElement('script');
          script.src = 'https://accounts.google.com/gsi/client';
          script.async = true;
          script.defer = true;
          document.head.appendChild(script);

          await new Promise((resolve) => {
            script.onload = () => resolve();
            script.onerror = () => resolve();
          });
        }

        if (window.google && window.google.accounts) {
          window.google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            callback: handleGoogleCallback,
            use_fedcm_for_prompt: false,
            auto_select: false,
            cancel_on_tap_outside: true,
            itp_support: false
          });

          window.google.accounts.id.disableAutoSelect();
        }
      } catch (error) {
        console.error('Google OAuth initialization error:', error);
      }
    };

    initializeGoogleAuth();
  }, [handleGoogleCallback]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGuestLogin = async () => {
    setGuestLoading(true);
    try {
      const result = await loginAsGuest();
      if (result.success) {
        toast.success('Signed in as a guest. Connecting accounts and publishing are disabled in guest mode.');
        navigate('/dashboard');
      } else {
        toast.error(result.error || 'Guest login failed');
      }
    } catch {
      toast.error('Guest login failed');
    } finally {
      setGuestLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error('Please enter email and password');
      return;
    }

    setIsLoggingIn(true);
    setLoading(true);
    clearError();

    try {
      const { login: loginApi } = await import('../lib/apiClient.js');
      const result = await loginApi({
        email: formData.email,
        password: formData.password
      });

      if (result && result.access_token && result.user) {
        setUser(result.user);
        setToken(result.access_token);
        setGuest(false);

        toast.success('Signed in');
        await new Promise(resolve => setTimeout(resolve, 100));
        await redirectAfterLogin();
      } else {
        throw new Error(result?.detail || result?.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.message || error.detail || 'Invalid email or password';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoggingIn(false);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-[var(--primary)] flex items-center justify-center shadow-sm">
            <span className="text-lg font-bold text-white">AA</span>
          </div>
          <h1 className="text-2xl font-semibold text-[var(--text)] mb-1">Sign in to Agent Anywhere</h1>
          <p className="text-sm text-[var(--text-muted)]">Plan and schedule your social posts from one place.</p>
        </div>

        <Card className="p-6 sm:p-8">
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm" role="alert">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg flex items-center justify-center gap-3 hover:border-[var(--primary)] hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all duration-200 cursor-pointer font-medium text-[var(--text)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-5 h-5 flex-shrink-0">
                <svg viewBox="0 0 24 24" className="w-full h-full" aria-hidden="true">
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
              </div>
              <span className="text-sm font-medium">
                {isLoading ? 'Signing in...' : 'Continue with Google'}
              </span>
            </button>
            {isLoading && (
              <div className="w-full flex items-center justify-center gap-3 border border-[var(--primary)] rounded-lg py-3">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Signing in...</span>
              </div>
            )}

            <WalletConnect className="w-full" />

            {walletLoading && (
              <div className="w-full flex items-center justify-center gap-3 border border-[var(--border)] rounded-lg py-3">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm text-[var(--text-muted)]">Authenticating wallet...</span>
              </div>
            )}

            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--border)]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[var(--surface)] text-[var(--text-muted)]">Or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[var(--text)] mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-colors"
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[var(--text)] mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-colors"
                    placeholder="Your password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-[var(--primary)] bg-[var(--surface)] border-[var(--border)] rounded focus:ring-[var(--primary)] focus:ring-2"
                  />
                  <span className="ml-2 text-sm text-[var(--text-muted)]">Remember me</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-[var(--primary)] hover:text-[var(--primary)]/80 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={isLoggingIn || isLoading || !formData.email || !formData.password}
              >
                {isLoggingIn || isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    <span>Signing in...</span>
                  </span>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>

            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--border)]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[var(--surface)] text-[var(--text-muted)]">Just looking around?</span>
              </div>
            </div>

            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={handleGuestLogin}
              disabled={guestLoading || isLoading}
            >
              {guestLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span>Signing in...</span>
                </span>
              ) : (
                'Continue as Guest'
              )}
            </Button>
            <p className="text-xs text-center text-[var(--text-muted)]">
              No account needed. Guests can browse and try things out, but can&apos;t connect accounts or publish posts.
            </p>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-[var(--text-muted)]">
              Don&apos;t have an account?{' '}
              <Link
                to="/register"
                className="text-[var(--primary)] hover:text-[var(--primary)]/80 font-medium transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </Card>

        <div className="mt-6 text-center text-xs text-[var(--text-muted)]">
          <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
