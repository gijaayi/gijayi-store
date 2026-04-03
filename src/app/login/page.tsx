'use client';

import { Suspense } from 'react';
import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const redirect = redirectParam && redirectParam.trim() ? redirectParam.trim() : '/';
  const { refreshUser } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(data.error || 'Unable to login.');
      setLoading(false);
      return;
    }

    await refreshUser();
    // Always redirect to homepage by default unless explicitly specified
    const finalRedirect = (redirectParam && redirectParam.trim() && redirectParam !== '/login') ? redirectParam.trim() : '/';
    router.push(finalRedirect);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 py-16 bg-linear-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-md">
        {/* Logo - Clickable */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block hover:opacity-80 transition">
            <span className="font-serif text-3xl md:text-4xl tracking-widest uppercase text-[#1a1a1a] cursor-pointer">
              Gijayi
            </span>
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-slate-200">
          {/* Header */}
          <div className="px-8 py-10 border-b border-slate-200 bg-linear-to-r from-slate-50 to-white">
            <p className="text-xs tracking-[0.35em] uppercase text-slate-500 font-medium mb-2">Welcome Back</p>
            <h1 className="font-serif text-3xl text-slate-900">Login</h1>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <p className="text-sm text-slate-600 mb-8">Sign in to your account to continue.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs tracking-widest uppercase text-slate-600 mb-2 font-medium">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-800/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase text-slate-600 mb-2 font-medium">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 pr-10 text-sm outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-800/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-linear-to-r from-slate-800 to-slate-700 text-white py-3 rounded-lg text-sm font-medium tracking-widest uppercase hover:from-slate-700 hover:to-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-8 border-t border-slate-200 text-center">
              <p className="text-sm text-slate-600">
                New to Gijayi?{' '}
                <Link href={`/register?redirect=${encodeURIComponent(redirect)}`} className="text-slate-900 font-medium hover:text-slate-700 underline">
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 space-y-2">
          <p className="text-xs text-slate-500">
            Need help? <Link href="/contact" className="text-slate-900 font-medium hover:underline">Contact us</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center text-sm text-gray-500">Loading login...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
