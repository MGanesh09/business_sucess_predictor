'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '../../../lib/api';
import { TrendingUp, User, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/register', { name, email, password });
      
      // Redirect to OTP verification, forwarding OTP in URL query so the user can easily copy/view it!
      const targetOtp = response.otp || '';
      router.push(`/auth/otp?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(targetOtp)}`);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Try a different email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-mesh flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full glass-panel p-8 rounded-2xl border-white/5 shadow-xl flex flex-col">
        
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 mb-2">
            <div className="p-2.5 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Predictor AI</span>
          </Link>
          <h2 className="text-gray-300 text-sm">Create an account to start predicting.</h2>
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-red-950/40 border border-red-500/20 text-red-300 rounded-lg text-xs flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Full Name</label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full glass-input text-sm pl-10"
              />
              <User className="absolute left-3 top-3.5 h-4 w-4 text-gray-500" />
            </div>
          </div>

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
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min 6 characters"
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
            {loading ? 'Creating Account...' : 'Sign Up'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-gray-500">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-indigo-400 hover:text-indigo-300 font-semibold">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
}
