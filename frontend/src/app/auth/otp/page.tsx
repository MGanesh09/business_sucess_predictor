'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../../lib/api';
import { TrendingUp, KeyRound, AlertCircle, ArrowRight } from 'lucide-react';

function OTPVerificationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const urlOtp = searchParams.get('otp') || '';

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (urlOtp) {
      setOtp(urlOtp);
    }
  }, [urlOtp]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/otp-verify', { email, otp });
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      window.dispatchEvent(new Event('storage'));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Incorrect or expired OTP code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full glass-panel p-8 rounded-2xl border-white/5 shadow-xl flex flex-col">
      <div className="flex flex-col items-center mb-8">
        <div className="p-2.5 bg-gradient-to-tr from-red-500 to-indigo-600 rounded-xl mb-4">
          <TrendingUp className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-white mb-2">Verify Your Account</h2>
        <p className="text-gray-400 text-xs text-center leading-relaxed">
          We have sent a verification code to <span className="text-indigo-300 font-medium">{email}</span>. 
          {urlOtp && <span className="block mt-1.5 text-emerald-400 font-semibold">Simulated Code: {urlOtp}</span>}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3.5 bg-red-950/40 border border-red-500/20 text-red-300 rounded-lg text-xs flex items-start gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">6-Digit Verification Code</label>
          <div className="relative">
            <input
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className="w-full glass-input text-center text-lg tracking-widest font-mono font-bold"
            />
            <KeyRound className="absolute left-3 top-3.5 h-4 w-4 text-gray-500" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="w-full glass-button-primary flex items-center justify-center gap-2 py-3 text-sm mt-6 font-bold disabled:opacity-50"
        >
          {loading ? 'Verifying...' : 'Confirm Activation'}
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      <p className="mt-8 text-center text-xs text-gray-500">
        Didn't receive a code?{' '}
        <button 
          onClick={() => alert(`Verification code is: ${urlOtp || '123456'}`)} 
          className="text-indigo-400 hover:text-indigo-300 font-semibold focus:outline-none"
        >
          Show Code Again
        </button>
      </p>
    </div>
  );
}

export default function OTPVerificationPage() {
  return (
    <div className="min-h-screen bg-gradient-mesh flex items-center justify-center px-4 py-12">
      <Suspense fallback={
        <div className="text-gray-400 text-sm">Loading verification form...</div>
      }>
        <OTPVerificationForm />
      </Suspense>
    </div>
  );
}
