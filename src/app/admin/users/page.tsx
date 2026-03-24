'use client';

import { useEffect, useState } from 'react';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/users', { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load users');
        const data = (await res.json()) as { users: AdminUser[] };
        setUsers(data.users);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load users'));
  }, []);

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6">
      <h2 className="font-serif text-3xl mb-1 text-slate-900">Customers</h2>
      <p className="text-sm text-slate-500 mb-6">View and monitor registered customer accounts.</p>

      {error && <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{error}</p>}

      <div className="space-y-2 max-h-[760px] overflow-y-auto pr-1">
        {users.map((user) => (
          <div key={user.id} className="border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
            <span className="text-[10px] tracking-widest uppercase px-2 py-1 border border-slate-300 rounded-full bg-slate-50 text-slate-700">
              {user.role}
            </span>
          </div>
        ))}
        {!users.length && <p className="text-sm text-slate-500">No users found.</p>}
      </div>
    </section>
  );
}
