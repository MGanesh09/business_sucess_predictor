'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '../../../lib/api';
import { TrendingUp, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      
      // Store token and user details
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Dispatch storage event to alert Navbar immediately
      window.dispatchEvent(new Event('storage'));
      
      router.push('/dashboard');
    } catch (err: any) {
      if (err.message.includes('not verified')) {
        // Redirect to OTP verification
        router.push(`/auth/otp?email=${encodeURIComponent(email)}`);
      } else {
        setError(err.message || 'Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginMock = async () => {
    setLoading(true);
    try {
      const response = await api.post('/auth/google-login', {
        email: 'user.demo@gmail.com',
        name: 'Demo User',
        profilePicture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'
      });
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      window.dispatchEvent(new Event('storage'));
      router.push('/dashboard');
    } catch (err: any) {
      setError('Google auth simulation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-mesh flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full glass-panel p-8 rounded-2xl border-white/5 shadow-xl flex flex-col">
        
        {/* Brand logo header */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 mb-2">
            <div className="p-2.5 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Predictor AI</span>
          </Link>
          <h2 className="text-gray-300 text-sm">Welcome back. Log in to your analyzer.</h2>
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-red-950/40 border border-red-500/20 text-red-300 rounded-lg text-xs flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full glass-input text-sm pl-10"
              />
              <Mail className="absolute left-3 top-3.5 h-4 w-4 text-gray-500" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-gray-400 uppercase">Password</label>
              <Link href="/auth/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full glass-input text-sm pl-10"
              />
              <Lock className="absolute left-3 top-3.5 h-4 w-4 text-gray-500" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full glass-button-primary flex items-center justify-center gap-2 py-3 text-sm mt-6 font-bold disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-white/5"></div>
          <span className="flex-shrink mx-4 text-gray-500 text-xs uppercase font-medium">Or continue with</span>
          <div className="flex-grow border-t border-white/5"></div>
        </div>

        <button
          onClick={handleGoogleLoginMock}
          disabled={loading}
          className="w-full glass-button-secondary py-3 text-sm flex items-center justify-center gap-2 font-bold hover:bg-white/10"
        >
          {/* Mock Google Logo */}
          <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-6.887 4.114-4.636 0-8.4-3.764-8.4-8.4s3.764-8.4 8.4-8.4c2.25 0 4.3.85 5.89 2.25l3.19-3.19C18.66.97 15.65 0 12.24 0 5.58 0 0 5.58 0 12.24s5.58 12.24 12.24 12.24c6.82 0 12.24-5.42 12.24-12.24 0-.82-.07-1.62-.2-2.4H12.24z"
            />
          </svg>
          Google Fast Login
        </button>

        <p className="mt-8 text-center text-xs text-gray-500">
          New to Predictor AI?{' '}
          <Link href="/auth/signup" className="text-indigo-400 hover:text-indigo-300 font-semibold">
            Create an account
          </Link>
        </p>

      </div>
    </div>
  );
}
