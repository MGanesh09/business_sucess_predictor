'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '../../../lib/api';
import { TrendingUp, Mail, KeyRound, Lock, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1 = Request, 2 = Reset
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [simulatedCode, setSimulatedCode] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email });
      setSimulatedCode(response.otp || '');
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Email address not found');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/reset-password', { email, otp, newPassword });
      setSuccessMsg('Your password has been reset successfully. Redirecting...');
      setTimeout(() => {
        router.push('/auth/login');
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'Invalid verification code');
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
          <h2 className="text-gray-300 text-sm">
            {step === 1 ? 'Recover your account password.' : 'Define your new password.'}
          </h2>
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-red-950/40 border border-red-500/20 text-red-300 rounded-lg text-xs flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3.5 bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 rounded-lg text-xs flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOTP} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Registered Email</label>
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

            <button
              type="submit"
              disabled={loading}
              className="w-full glass-button-primary flex items-center justify-center gap-2 py-3 text-sm mt-6 font-bold disabled:opacity-50"
            >
              {loading ? 'Sending Request...' : 'Send Recovery Code'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="p-3 bg-indigo-950/40 border border-indigo-500/20 text-xs text-indigo-300 rounded-lg mb-2">
              Verification code sent to {email}. <br />
              {simulatedCode && <span className="block mt-1 font-bold text-emerald-400">Simulated Code: {simulatedCode}</span>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase font-mono">6-Digit Code</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full glass-input text-sm pl-10 text-center tracking-widest font-mono font-bold"
                />
                <KeyRound className="absolute left-3 top-3.5 h-4 w-4 text-gray-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">New Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full glass-input text-sm pl-10"
                />
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-gray-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full glass-button-primary flex items-center justify-center gap-2 py-3 text-sm mt-6 font-bold disabled:opacity-50"
            >
              {loading ? 'Updating Password...' : 'Reset Password'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-xs text-gray-500">
          Back to{' '}
          <Link href="/auth/login" className="text-indigo-400 hover:text-indigo-300 font-semibold">
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}
