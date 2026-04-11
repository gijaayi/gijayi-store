'use client';

import { FormEvent, useEffect, useState } from 'react';

interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

interface NavigationSettings {
  shop: {
    label: string;
    subcategories: string[];
  };
  gijayiEdit: {
    label: string;
    subcategories: string[];
  };
  freshArrival: {
    label: string;
  };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [navigation, setNavigation] = useState<NavigationSettings | null>(null);
  const [shopSubcategoriesInput, setShopSubcategoriesInput] = useState('');
  const [gijayiEditSubcategoriesInput, setGijayiEditSubcategoriesInput] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState('');
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleSyncCategories() {
    setBusy(true);
    setError('');

    try {
      const response = await fetch('/api/admin/sync-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = (await response.json()) as { error?: string; message?: string; added?: number };
      
      if (!response.ok) {
        setError(data.error || 'Failed to sync categories.');
        setBusy(false);
        return;
      }

      await fetchCategories();
      setError(''); // Clear error
      alert(`✓ ${data.message}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync categories.');
    } finally {
      setBusy(false);
    }
  }

  async function fetchCategories() {
    const [categoriesResponse, storefrontResponse] = await Promise.all([
      fetch('/api/admin/categories', { cache: 'no-store' }),
      fetch('/api/admin/storefront', { cache: 'no-store' }),
    ]);

    if (!categoriesResponse.ok || !storefrontResponse.ok) throw new Error('Failed to load categories');

    const categoriesData = (await categoriesResponse.json()) as { categories: AdminCategory[] };
    const storefrontData = (await storefrontResponse.json()) as { storefront: { navigation: NavigationSettings } };

    setCategories(categoriesData.categories);
    setNavigation(storefrontData.storefront.navigation);
    setShopSubcategoriesInput((storefrontData.storefront.navigation.shop.subcategories || []).join('\n'));
    setGijayiEditSubcategoriesInput((storefrontData.storefront.navigation.gijayiEdit.subcategories || []).join('\n'));
  }

  useEffect(() => {
    fetchCategories().catch((err) => setError(err instanceof Error ? err.message : 'Unable to load categories'));
  }, []);

  async function handleCreateCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const categoryName = newCategory.trim();
    if (!categoryName) return;

    setBusy(true);
    setError('');

    const response = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: categoryName }),
    });

    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(data.error || 'Failed to add category.');
      setBusy(false);
      return;
    }

    setNewCategory('');
    await fetchCategories();
    setBusy(false);
  }

  async function handleRenameCategory(categoryId: string) {
    const nextName = editingCategoryName.trim();
    if (!nextName) return;

    setBusy(true);
    setError('');

    const response = await fetch(`/api/admin/categories/${categoryId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: nextName }),
    });

    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(data.error || 'Failed to update category.');
      setBusy(false);
      return;
    }

    setEditingCategoryId('');
    setEditingCategoryName('');
    await fetchCategories();
    setBusy(false);
  }

  async function handleDeleteCategory(categoryId: string) {
    setBusy(true);
    setError('');

    const response = await fetch(`/api/admin/categories/${categoryId}`, {
      method: 'DELETE',
    });

    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(data.error || 'Failed to delete category.');
      setBusy(false);
      return;
    }

    await fetchCategories();
    setBusy(false);
  }

  async function handleSaveNavigationSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!navigation) return;

    setBusy(true);
    setError('');

    const shopSubcategories = shopSubcategoriesInput
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 20);

    const gijayiEditSubcategories = gijayiEditSubcategoriesInput
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 20);

    const response = await fetch('/api/admin/storefront', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        navigation: {
          shop: {
            label: navigation.shop.label,
            subcategories: shopSubcategories,
          },
          gijayiEdit: {
            label: navigation.gijayiEdit.label,
            subcategories: gijayiEditSubcategories,
          },
          freshArrival: {
            label: navigation.freshArrival.label,
          },
        },
      }),
    });

    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(data.error || 'Failed to save navigation categories.');
      setBusy(false);
      return;
    }

    await fetchCategories();
    setBusy(false);
  }

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="font-serif text-3xl mb-1 text-slate-900">Category Manager</h2>
          <p className="text-sm text-slate-500">Manage storefront product categories used across shop and product creation.</p>
        </div>
        <button
          onClick={handleSyncCategories}
          disabled={busy}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
        >
          {busy ? 'Syncing...' : 'Sync Categories'}
        </button>
      </div>

      {error && <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{error}</p>}

      {navigation && (
        <form onSubmit={handleSaveNavigationSettings} className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
          <p className="text-xs tracking-widest uppercase text-slate-600">Homepage Navbar Categories</p>

          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs tracking-widest uppercase text-slate-600 mb-2">Category 1 Label</label>
              <input
                value={navigation.shop.label}
                onChange={(event) =>
                  setNavigation((current) =>
                    current
                      ? {
                          ...current,
                          shop: {
                            ...current.shop,
                            label: event.target.value,
                          },
                        }
                      : current
                  )
                }
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase text-slate-600 mb-2">Category 2 Label</label>
              <input
                value={navigation.gijayiEdit.label}
                onChange={(event) =>
                  setNavigation((current) =>
                    current
                      ? {
                          ...current,
                          gijayiEdit: {
                            ...current.gijayiEdit,
                            label: event.target.value,
                          },
                        }
                      : current
                  )
                }
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase text-slate-600 mb-2">Category 3 Label</label>
              <input
                value={navigation.freshArrival.label}
                onChange={(event) =>
                  setNavigation((current) =>
                    current
                      ? {
                          ...current,
                          freshArrival: {
                            ...current.freshArrival,
                            label: event.target.value,
                          },
                        }
                      : current
                  )
                }
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs tracking-widest uppercase text-slate-600 mb-2">Shop Subcategories (one per line)</label>
              <textarea
                value={shopSubcategoriesInput}
                onChange={(event) => setShopSubcategoriesInput(event.target.value)}
                rows={6}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase text-slate-600 mb-2">Gijayi Edit Subcategories (one per line)</label>
              <textarea
                value={gijayiEditSubcategoriesInput}
                onChange={(event) => setGijayiEditSubcategoriesInput(event.target.value)}
                rows={6}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <button
            disabled={busy}
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 text-xs tracking-widest uppercase rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Save Navbar Categories
          </button>
        </form>
      )}

      {error && <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{error}</p>}

      <form onSubmit={handleCreateCategory} className="flex gap-2 mb-5">
        <input
          value={newCategory}
          onChange={(event) => setNewCategory(event.target.value)}
          placeholder="Add category"
          className="flex-1 border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-600"
        />
        <button disabled={busy} type="submit" className="bg-blue-600 text-white px-4 py-3 text-xs tracking-widest uppercase rounded-xl hover:bg-blue-700 disabled:opacity-50">
          Add
        </button>
      </form>

      <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
        {categories.map((category) => (
          <div key={category.id} className="border border-slate-200 rounded-xl p-3">
            {editingCategoryId === category.id ? (
              <div className="flex items-center gap-2">
                <input
                  value={editingCategoryName}
                  onChange={(event) => setEditingCategoryName(event.target.value)}
                  className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-600"
                />
                <button type="button" disabled={busy} onClick={() => handleRenameCategory(category.id)} className="text-xs tracking-widest uppercase text-blue-700 hover:text-blue-800">Save</button>
                <button type="button" onClick={() => { setEditingCategoryId(''); setEditingCategoryName(''); }} className="text-xs tracking-widest uppercase text-slate-500 hover:text-slate-700">Cancel</button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">{category.name}</p>
                  <p className="text-[10px] tracking-widest uppercase text-slate-500">{category.slug}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => { setEditingCategoryId(category.id); setEditingCategoryName(category.name); }} className="text-xs tracking-widest uppercase text-slate-700 hover:text-slate-900">Edit</button>
                  <button type="button" disabled={busy} onClick={() => handleDeleteCategory(category.id)} className="text-xs tracking-widest uppercase text-red-600 hover:text-red-700 disabled:opacity-50">Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
        {!categories.length && <p className="text-sm text-slate-500">No categories found.</p>}
      </div>
    </section>
  );
}
