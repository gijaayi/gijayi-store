'use client';

import { useEffect, useState } from 'react';

interface AdminContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  topic: string;
  message: string;
  status: 'new' | 'closed';
  createdAt: string;
}

export default function AdminInquiriesPage() {
  const [contacts, setContacts] = useState<AdminContact[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/overview', { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load inquiries');
        const data = (await res.json()) as { latestContacts: AdminContact[] };
        setContacts(data.latestContacts || []);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load inquiries'));
  }, []);

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6">
      <h2 className="font-serif text-3xl mb-1 text-slate-900">Customer Inquiries</h2>
      <p className="text-sm text-slate-500 mb-6">Recent messages from contact form submissions.</p>

      {error && <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{error}</p>}

      <div className="space-y-3 max-h-[760px] overflow-y-auto pr-1">
        {contacts.map((contact) => (
          <div key={contact.id} className="border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between gap-3 mb-2">
              <p className="text-sm font-medium text-slate-900">{contact.firstName} {contact.lastName}</p>
              <span className={`text-[10px] tracking-widest uppercase px-2 py-1 rounded-full border ${contact.status === 'new' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                {contact.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-1">{contact.email}{contact.phone ? ` · ${contact.phone}` : ''}</p>
            <p className="text-xs tracking-widest uppercase text-blue-700 mb-2">{contact.topic}</p>
            <p className="text-sm text-slate-700 leading-relaxed">{contact.message}</p>
          </div>
        ))}
        {!contacts.length && <p className="text-sm text-slate-500">No inquiries found.</p>}
      </div>
    </section>
  );
}
