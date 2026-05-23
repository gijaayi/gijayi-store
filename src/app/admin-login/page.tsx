'use client';

import { Suspense } from 'react';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Lock } from 'lucide-react';

function AdminLoginContent() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [email, setEmail] = useState('admin@gijayi.com');
  const [password, setPassword] = useState('');
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

    const data = (await response.json()) as { error?: string; user?: { role: string } };

    if (!response.ok) {
      setError(data.error || 'Unable to login.');
      setLoading(false);
      return;
    }

    const user = data.user as { role: string } | undefined;
    if (user?.role !== 'admin') {
      setError('Admin access only. Please contact support.');
      setLoading(false);
      return;
    }

    await refreshUser();
    router.push('/admin');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-8 py-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white/10 p-3 rounded-full">
                <Lock className="text-white" size={28} />
              </div>
            </div>
            <h1 className="font-serif text-3xl text-white mb-2">Admin Portal</h1>
            <p className="text-slate-300 text-sm">Gijayi Control Room</p>
          </div>

          {/* Login Form */}
          <div className="px-8 py-10">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs tracking-widest uppercase text-slate-600 mb-2 font-medium">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@gijayi.com"
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-800/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs tracking-widest uppercase text-slate-600 mb-2 font-medium">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-800/20 transition-all"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-slate-800 to-slate-700 text-white py-3 rounded-lg text-sm font-medium tracking-widest uppercase hover:from-slate-700 hover:to-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Authenticating...' : 'Sign in'}
              </button>
            </form>

            {/* Info */}
            <div className="mt-8 pt-8 border-t border-slate-200">
              <p className="text-center text-xs text-slate-500">
                Admin accounts have full access to platform controls.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-slate-400 text-xs">
            © 2025 Gijayi. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-white text-sm">Loading admin portal...</div>
      </div>
    }>
      <AdminLoginContent />
    </Suspense>
  );
}
