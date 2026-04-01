'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface ProfileOrder {
  id: string;
  orderCode: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  itemsCount: number;
}

interface ProfileResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'user';
    phone?: string;
    defaultAddress?: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      address: string;
      city: string;
      state: string;
      pincode: string;
      country: string;
    };
    createdAt: string;
  };
  orders: ProfileOrder[];
}

const emptyAddress = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India',
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, refreshUser } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState(emptyAddress);
  const [orders, setOrders] = useState<ProfileOrder[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hydrated, setHydrated] = useState(false);
  
  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const joinedDate = useMemo(
    () => (user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : ''),
    [user?.createdAt]
  );

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login?redirect=/profile');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user || hydrated) return;

    const parts = user.name.trim().split(' ').filter(Boolean);
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ');

    setName(user.name);
    setPhone(user.phone || '');
    setAddress({
      firstName: user.defaultAddress?.firstName || firstName,
      lastName: user.defaultAddress?.lastName || lastName,
      email: user.defaultAddress?.email || user.email,
      phone: user.defaultAddress?.phone || user.phone || '',
      address: user.defaultAddress?.address || '',
      city: user.defaultAddress?.city || '',
      state: user.defaultAddress?.state || '',
      pincode: user.defaultAddress?.pincode || '',
      country: user.defaultAddress?.country || 'India',
    });

    setHydrated(true);
  }, [user, hydrated]);

  useEffect(() => {
    if (!user) return;

    let ignore = false;

    async function loadProfile() {
      const response = await fetch('/api/auth/profile', { cache: 'no-store' });
      const data = (await response.json()) as ProfileResponse & { error?: string };

      if (!response.ok) {
        if (!ignore) {
          setError(data.error || 'Unable to load profile.');
        }
        return;
      }

      if (ignore) return;

      setName(data.user.name);
      setPhone(data.user.phone || '');
      setAddress({
        firstName: data.user.defaultAddress?.firstName || '',
        lastName: data.user.defaultAddress?.lastName || '',
        email: data.user.defaultAddress?.email || data.user.email,
        phone: data.user.defaultAddress?.phone || data.user.phone || '',
        address: data.user.defaultAddress?.address || '',
        city: data.user.defaultAddress?.city || '',
        state: data.user.defaultAddress?.state || '',
        pincode: data.user.defaultAddress?.pincode || '',
        country: data.user.defaultAddress?.country || 'India',
      });
      setOrders(data.orders || []);
      setError('');
    }

    loadProfile();

    return () => {
      ignore = true;
    };
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-sm text-gray-500">
        Loading your profile...
      </div>
    );
  }

  async function saveProfile() {
    setBusy(true);
    setError('');
    setSuccess('');

    const response = await fetch('/api/auth/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        phone,
        defaultAddress: address,
      }),
    });

    const data = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(data.error || 'Unable to update profile.');
      setBusy(false);
      return;
    }

    await refreshUser();
    setSuccess('Profile updated successfully.');
    setBusy(false);
  }

  async function updatePassword() {
    setPasswordBusy(true);
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required');
      setPasswordBusy(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      setPasswordBusy(false);
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      setPasswordBusy(false);
      return;
    }

    const response = await fetch('/api/auth/update-password', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentPassword,
        newPassword,
        confirmPassword,
      }),
    });

    const data = (await response.json()) as { error?: string; message?: string };

    if (!response.ok) {
      setPasswordError(data.error || 'Unable to update password.');
      setPasswordBusy(false);
      return;
    }

    setPasswordSuccess(data.message || 'Password updated successfully.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordBusy(false);
    setTimeout(() => {
      setShowPasswordForm(false);
      setPasswordSuccess('');
    }, 2000);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 md:py-16">
      <div className="mb-10">
        <p className="text-xs tracking-[0.35em] uppercase text-[#b8963e] mb-3">My Account</p>
        <h1 className="font-serif text-4xl md:text-5xl">Welcome, {name.split(' ')[0]}</h1>
        <p className="text-sm text-gray-600 mt-4">Member since {joinedDate}</p>
      </div>

      <div className="grid xl:grid-cols-[1.2fr_0.8fr] gap-8">
        <section className="border border-[#efe6d7] bg-[#fcfbf8] p-6 md:p-8 space-y-6">
          <div>
            <h2 className="font-serif text-2xl mb-2">Profile Details</h2>
            <p className="text-sm text-gray-600">Update your personal information and default shipping address.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs tracking-widest uppercase mb-1.5">Full Name</label>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full border border-[#e5ddcf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b8963e]"
              />
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase mb-1.5">Email</label>
              <input
                value={user.email}
                disabled
                className="w-full border border-[#e5ddcf] bg-[#f7f4ee] px-4 py-3 text-sm text-gray-500"
              />
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase mb-1.5">Phone</label>
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="w-full border border-[#e5ddcf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b8963e]"
              />
            </div>
          </div>

          <div>
            <h3 className="font-serif text-xl mb-4">Default Address</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs tracking-widest uppercase mb-1.5">First Name</label>
                <input value={address.firstName} onChange={(event) => setAddress({ ...address, firstName: event.target.value })} className="w-full border border-[#e5ddcf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b8963e]" />
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase mb-1.5">Last Name</label>
                <input value={address.lastName} onChange={(event) => setAddress({ ...address, lastName: event.target.value })} className="w-full border border-[#e5ddcf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b8963e]" />
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase mb-1.5">Email</label>
                <input value={address.email} onChange={(event) => setAddress({ ...address, email: event.target.value })} className="w-full border border-[#e5ddcf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b8963e]" />
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase mb-1.5">Phone</label>
                <input value={address.phone} onChange={(event) => setAddress({ ...address, phone: event.target.value })} className="w-full border border-[#e5ddcf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b8963e]" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs tracking-widest uppercase mb-1.5">Address</label>
                <input value={address.address} onChange={(event) => setAddress({ ...address, address: event.target.value })} className="w-full border border-[#e5ddcf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b8963e]" />
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase mb-1.5">City</label>
                <input value={address.city} onChange={(event) => setAddress({ ...address, city: event.target.value })} className="w-full border border-[#e5ddcf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b8963e]" />
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase mb-1.5">State</label>
                <input value={address.state} onChange={(event) => setAddress({ ...address, state: event.target.value })} className="w-full border border-[#e5ddcf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b8963e]" />
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase mb-1.5">Pincode</label>
                <input value={address.pincode} onChange={(event) => setAddress({ ...address, pincode: event.target.value })} className="w-full border border-[#e5ddcf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b8963e]" />
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase mb-1.5">Country</label>
                <input value={address.country} onChange={(event) => setAddress({ ...address, country: event.target.value })} className="w-full border border-[#e5ddcf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b8963e]" />
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-emerald-700">{success}</p>}

          <button
            onClick={saveProfile}
            disabled={busy}
            className="bg-[#1a1a1a] text-white px-8 py-3 text-xs tracking-widest uppercase hover:bg-[#b8963e] transition-colors disabled:opacity-50"
          >
            {busy ? 'Saving...' : 'Save Profile'}
          </button>
        </section>

        <section className="space-y-6">
          <div className="border border-[#efe6d7] bg-[#fcfbf8] p-6 md:p-8">
            <h2 className="font-serif text-2xl mb-2">Security</h2>
            <p className="text-sm text-gray-600 mb-5">Manage your password and account security.</p>

            {!showPasswordForm ? (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="bg-[#1a1a1a] text-white px-8 py-3 text-xs tracking-widest uppercase hover:bg-[#b8963e] transition-colors"
              >
                Change Password
              </button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs tracking-widest uppercase mb-1.5">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full border border-[#e5ddcf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b8963e]"
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase mb-1.5">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border border-[#e5ddcf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b8963e]"
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase mb-1.5">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border border-[#e5ddcf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b8963e]"
                    placeholder="Confirm new password"
                  />
                </div>

                {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
                {passwordSuccess && <p className="text-sm text-emerald-700">{passwordSuccess}</p>}

                <div className="flex gap-3">
                  <button
                    onClick={updatePassword}
                    disabled={passwordBusy}
                    className="bg-[#1a1a1a] text-white px-6 py-3 text-xs tracking-widest uppercase hover:bg-[#b8963e] transition-colors disabled:opacity-50"
                  >
                    {passwordBusy ? 'Updating...' : 'Update Password'}
                  </button>
                  <button
                    onClick={() => {
                      setShowPasswordForm(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setPasswordError('');
                      setPasswordSuccess('');
                    }}
                    className="bg-gray-200 text-gray-700 px-6 py-3 text-xs tracking-widest uppercase hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="border border-[#efe6d7] bg-white p-6 md:p-8">
            <h2 className="font-serif text-2xl mb-2">Your Orders</h2>
            <p className="text-sm text-gray-600 mb-5">View your order history and track each shipment.</p>

            {!orders.length ? (
              <div className="border border-[#efe6d7] bg-[#fcfbf8] p-5 text-center">
                <p className="text-sm text-gray-600 mb-3">No orders yet.</p>
                <Link href="/shop" className="text-xs tracking-widest uppercase text-[#b8963e] hover:text-[#1a1a1a]">
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order.id} className="border border-[#efe6d7] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs tracking-[0.25em] uppercase text-[#b8963e]">{order.orderCode}</p>
                      <span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                    <p className="text-sm mt-2">{order.itemsCount} item(s) · ₹{order.totalAmount.toLocaleString('en-IN')}</p>
                    <p className="text-sm text-gray-600 mt-1">Status: {order.status}</p>
                    <div className="mt-3">
                      <Link href={`/track-order?code=${encodeURIComponent(order.orderCode)}`} className="text-xs tracking-widest uppercase text-[#b8963e] hover:text-[#1a1a1a]">
                        Track Order
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
