import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';
import AuthShell from '../components/auth/AuthShell.jsx';
import Magnetic from '../components/motion/Magnetic.jsx';
import { useAuthStore } from '../store/authStore.js';
import { Loader2, Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { register as registerApi, checkPlatformConnections } from '../lib/apiClient.js';
import { toast } from 'sonner';

function Register() {
  const navigate = useNavigate();
  const { login: loginGoogle, isAuthenticated, isLoading, error, clearError, setUser, setToken, setLoading, setError } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Check platform connections and redirect accordingly
      const checkAndRedirect = async () => {
        try {
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
      };

      checkAndRedirect();
    }
  }, [isAuthenticated, navigate]);

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleGoogleLogin = async () => {
    try {
      // Load Google Identity Services
      if (!window.google) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);

        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      // Initialize Google Identity Services
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback,
      });

      // Prompt the user to sign in
      window.google.accounts.id.prompt();
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  const handleGoogleCallback = async (response) => {
    try {
      const result = await loginGoogle(response.credential);
      if (result.success) {
        // Check platform connections and redirect accordingly
        try {
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
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const [isRegistering, setIsRegistering] = useState(false);

  // Form validation
  const isFormValid = formData.name && formData.email && formData.password &&
    formData.password === formData.confirmPassword &&
    formData.agreeToTerms;

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('🔄 Form submitted', { formData, isFormValid });

    // Validate form
    if (!isFormValid) {
      toast.error('Please fill in all fields and agree to terms');
      return;
    }

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsRegistering(true);
    setLoading(true);
    clearError();

    try {
      console.log('🔄 Registering user...', { email: formData.email, name: formData.name });
      const result = await registerApi({
        email: formData.email,
        password: formData.password,
        name: formData.name
      });

      console.log('✅ Registration response:', result);

      if (result && result.access_token && result.user) {
        // Set user and token in store
        setUser(result.user);
        setToken(result.access_token);

        console.log('✅ User and token set in store');
        toast.success('Registration successful!');

        // Small delay to ensure store is updated
        await new Promise(resolve => setTimeout(resolve, 100));

        // Check platform connections and redirect accordingly
        try {
          const connections = await checkPlatformConnections();
          console.log('🔍 Platform connections:', connections);
          if (connections && !connections.has_connections) {
            console.log('🔄 Redirecting to settings (no connections)');
            navigate('/settings');
          } else {
            console.log('🔄 Redirecting to dashboard (has connections)');
            navigate('/dashboard');
          }
        } catch (error) {
          console.error('Error checking platform connections:', error);
          navigate('/dashboard');
        }
      } else {
        console.error('❌ Invalid registration response:', result);
        throw new Error(result?.detail || result?.error || 'Registration failed');
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      const errorMessage = error.message || error.detail || 'Registration failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsRegistering(false);
      setLoading(false);
    }
  };

  return (
    <AuthShell
      headline={['Set up your', 'board.']}
      accent={1}
      subline="One account, every platform. Start planning your posts in a few minutes."
    >
      <div data-auth-intro>
        <p className="kicker text-[var(--text-muted)]">Create account</p>
        <h2 className="display-2 mt-2">Join the board.</h2>
      </div>

      {error && (
        <div className="mt-6 rounded-[4px] border border-red-300 bg-red-50 p-3 text-sm text-red-700" role="alert" data-auth-intro>
          {error}
        </div>
      )}

      <div className="mt-8 space-y-4" data-auth-intro>
        <Button
          variant="secondary"
          size="lg"
          className="flex w-full items-center justify-center gap-3"
          onClick={handleGoogleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
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
          )}
          Continue with Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--border)]"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="kicker bg-[var(--bg)] px-3 text-[var(--text-muted)]">Or create account with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-[var(--text)]">
              Full name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="aa-field py-3 pl-10 pr-4 placeholder-[var(--text-muted)]"
                placeholder="Enter your full name"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-[var(--text)]">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="aa-field py-3 pl-10 pr-4 placeholder-[var(--text-muted)]"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-[var(--text)]">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="aa-field py-3 pl-10 pr-12 placeholder-[var(--text-muted)]"
                placeholder="Create a password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-[var(--text)]">
              Confirm password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="aa-field py-3 pl-10 pr-12 placeholder-[var(--text-muted)]"
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex h-5 items-center">
              <input
                type="checkbox"
                id="agreeToTerms"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
                className="h-4 w-4 rounded border-[var(--border)] bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--text)]"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="agreeToTerms" className="text-[var(--text-muted)]">
                I agree to the{' '}
                <Link to="/terms" className="font-medium text-[var(--text)] underline decoration-[var(--border)] underline-offset-4 hover:decoration-[var(--text)]">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="font-medium text-[var(--text)] underline decoration-[var(--border)] underline-offset-4 hover:decoration-[var(--text)]">
                  Privacy Policy
                </Link>
              </label>
            </div>
          </div>

          <Magnetic className="block w-full" strength={4}>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isRegistering || isLoading || !isFormValid}
            >
              {isRegistering || isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </Button>
          </Magnetic>
        </form>
      </div>

      <div className="mt-8 text-center" data-auth-intro>
        <p className="text-sm text-[var(--text-muted)]">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-[var(--text)] underline decoration-[var(--signal)] decoration-2 underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-6 text-center text-xs text-[var(--text-muted)]" data-auth-intro>
        <p>By creating an account, you agree to our Terms of Service and Privacy Policy</p>
      </div>
    </AuthShell>
  );
}

export default Register;
