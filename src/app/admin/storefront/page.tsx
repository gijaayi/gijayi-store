'use client';

import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';

interface CarouselBanner {
  id: string;
  image: string;
  headline: string;
  subtitle: string;
}

interface StorefrontCarousel {
  id: string;
  banners: CarouselBanner[];
}

interface StorefrontSettings {
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    primaryCtaLabel: string;
    primaryCtaHref: string;
    secondaryCtaLabel: string;
    secondaryCtaHref: string;
    heroImage: string;
    featureLabel: string;
    featureTitle: string;
    featureSubtitle: string;
  };
  carousel?: StorefrontCarousel;
  trustSection: {
    badge: string;
    title: string;
    subtitle: string;
  };
  productCard: {
    quickAddLabel: string;
    quickViewLabel: string;
    newBadgeLabel: string;
    bestsellerBadgeLabel: string;
  };
}

export default function AdminStorefrontPage() {
  const [storefront, setStorefront] = useState<StorefrontSettings | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function fetchStorefront() {
    const response = await fetch('/api/admin/storefront', { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to load storefront settings');
    const data = (await response.json()) as { storefront: StorefrontSettings };
    setStorefront(data.storefront);
  }

  useEffect(() => {
    fetchStorefront().catch((err) => setError(err instanceof Error ? err.message : 'Unable to load storefront settings'));
  }, []);

  async function saveStorefrontSettings() {
    if (!storefront) return;

    setBusy(true);
    setError('');

    const response = await fetch('/api/admin/storefront', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hero: storefront.hero,
        carousel: storefront.carousel,
        trustSection: storefront.trustSection,
        productCard: storefront.productCard,
      }),
    });

    const data = (await response.json()) as { error?: string; storefront?: StorefrontSettings };
    if (!response.ok || !data.storefront) {
      setError(data.error || 'Failed to save storefront settings.');
      setBusy(false);
      return;
    }

    setStorefront(data.storefront);
    setBusy(false);
  }

  const updateBanner = (index: number, field: keyof CarouselBanner, value: string) => {
    if (!storefront?.carousel) return;
    const updated = [...storefront.carousel.banners];
    // Ensure we have enough slots
    while (updated.length < 4) {
      updated.push({
        id: `banner-${updated.length + 1}`,
        image: '',
        headline: '',
        subtitle: '',
      });
    }
    updated[index] = { ...updated[index], [field]: value };
    setStorefront({
      ...storefront,
      carousel: { ...storefront.carousel, banners: updated },
    });
  };

  const removeBanner = (index: number) => {
    if (!storefront?.carousel) return;
    const updated = [...storefront.carousel.banners];
    updated[index] = {
      id: `banner-${index + 1}`,
      image: '',
      headline: '',
      subtitle: '',
    };
    setStorefront({
      ...storefront,
      carousel: { ...storefront.carousel, banners: updated },
    });
  };

  // Ensure carousel always has exactly 4 banner slots
  const getBanners = () => {
    if (!storefront?.carousel) return [];
    const banners = [...storefront.carousel.banners];
    while (banners.length < 4) {
      banners.push({
        id: `banner-${banners.length + 1}`,
        image: '',
        headline: '',
        subtitle: '',
      });
    }
    return banners.slice(0, 4);
  };

  if (!storefront) {
    return <div className="bg-white border border-slate-200 rounded-2xl p-6 text-sm text-slate-600">Loading storefront settings...</div>;
  }

  return (
    <div className="space-y-6">
      <section className="bg-white border border-slate-200 rounded-2xl p-6">
        <h2 className="font-serif text-3xl mb-1 text-slate-900">Storefront CMS</h2>
        <p className="text-sm text-slate-500 mb-6">Manage homepage hero and carousel banners.</p>

        {error && <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{error}</p>}

        {/* Hero Settings Section */}
        <div className="mb-8 pb-8 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900 text-lg mb-4">Hero Section Content</h3>
          
          <div className="grid lg:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs tracking-widest uppercase text-slate-600 mb-2">Hero Badge</label>
              <input value={storefront.hero.badge} onChange={(event) => setStorefront({ ...storefront, hero: { ...storefront.hero, badge: event.target.value } })} className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-600" />
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase text-slate-600 mb-2">Hero Image URL</label>
              <input value={storefront.hero.heroImage} onChange={(event) => setStorefront({ ...storefront, hero: { ...storefront.hero, heroImage: event.target.value } })} className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-600" />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-xs tracking-widest uppercase text-slate-600 mb-2">Hero Title</label>
              <textarea value={storefront.hero.title} onChange={(event) => setStorefront({ ...storefront, hero: { ...storefront.hero, title: event.target.value } })} rows={3} className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-600" placeholder="Enter the main hero section title..." />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-xs tracking-widest uppercase text-slate-600 mb-2">Hero Subtitle</label>
              <textarea value={storefront.hero.subtitle} onChange={(event) => setStorefront({ ...storefront, hero: { ...storefront.hero, subtitle: event.target.value } })} rows={3} className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-600" placeholder="Enter the hero section subtitle..." />
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs tracking-widest uppercase text-slate-600 mb-2">Trust Title</label>
              <input value={storefront.trustSection.title} onChange={(event) => setStorefront({ ...storefront, trustSection: { ...storefront.trustSection, title: event.target.value } })} className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-600" />
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase text-slate-600 mb-2">Trust Subtitle</label>
              <input value={storefront.trustSection.subtitle} onChange={(event) => setStorefront({ ...storefront, trustSection: { ...storefront.trustSection, subtitle: event.target.value } })} className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-600" />
            </div>

            <div>
              <label className="block text-xs tracking-widest uppercase text-slate-600 mb-2">Quick Add Label</label>
              <input value={storefront.productCard.quickAddLabel} onChange={(event) => setStorefront({ ...storefront, productCard: { ...storefront.productCard, quickAddLabel: event.target.value } })} className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-600" />
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase text-slate-600 mb-2">Quick View Label</label>
              <input value={storefront.productCard.quickViewLabel} onChange={(event) => setStorefront({ ...storefront, productCard: { ...storefront.productCard, quickViewLabel: event.target.value } })} className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-600" />
            </div>
          </div>
        </div>

        <button disabled={busy} type="button" onClick={saveStorefrontSettings} className="bg-blue-600 text-white px-5 py-3 rounded-xl text-xs tracking-widest uppercase hover:bg-blue-700 disabled:opacity-50">
          {busy ? 'Saving...' : 'Save Settings'}
        </button>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-6">
        <h2 className="font-serif text-3xl mb-1 text-slate-900">Hero Carousel Banners</h2>
        <p className="text-sm text-slate-500 mb-6">Edit all 4 carousel banners. Leave fields empty to hide a banner.</p>

        <div className="space-y-6">
          {getBanners().map((banner, index) => {
            const isEmpty = !banner.image && !banner.headline && !banner.subtitle;
            
            return (
              <div key={banner.id} className={`border rounded-xl p-5 ${isEmpty ? 'bg-slate-50 border-dashed border-slate-300' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-semibold text-slate-900">Banner {index + 1}</h3>
                  {!isEmpty && (
                    <button
                      type="button"
                      onClick={() => removeBanner(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      title="Remove this banner"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
                <div className="grid lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs tracking-widest uppercase text-slate-600 mb-2">Image URL</label>
                    <input
                      value={banner.image}
                      onChange={(event) => updateBanner(index, 'image', event.target.value)}
                      placeholder="https://..."
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs tracking-widest uppercase text-slate-600 mb-2">Headline</label>
                    <input
                      value={banner.headline}
                      onChange={(event) => updateBanner(index, 'headline', event.target.value)}
                      placeholder="Banner headline..."
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-blue-600"
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <label className="block text-xs tracking-widest uppercase text-slate-600 mb-2">Subtitle</label>
                    <textarea
                      value={banner.subtitle}
                      onChange={(event) => updateBanner(index, 'subtitle', event.target.value)}
                      placeholder="Banner subtitle..."
                      rows={2}
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-blue-600"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button disabled={busy} type="button" onClick={saveStorefrontSettings} className="mt-6 w-full bg-emerald-600 text-white px-5 py-3 rounded-xl text-xs tracking-widest uppercase hover:bg-emerald-700 disabled:opacity-50">
          {busy ? 'Saving All Changes...' : 'Save All Banners & Settings'}
        </button>
      </section>
    </div>
  );
}
