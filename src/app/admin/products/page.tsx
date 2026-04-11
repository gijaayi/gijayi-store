'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

interface AdminCategory {
  id: string;
  name: string;
  slug: string;
}

interface NavigationSettings {
  shop: { label: string; subcategories: string[] };
  gijayiEdit: { label: string; subcategories: string[] };
  freshArrival: { label: string };
}

interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  category: string;
  collection: string;
  images?: string[];
  isNew?: boolean;
  mostWanted?: boolean;
  bridalLuxe?: boolean;
  heritage?: boolean;
  everydayMinimal?: boolean;
}

const defaultForm = {
  name: '',
  price: '',
  stock: '',
  category: '',
  collection: '',
  description: '',
  image1: '',
  image2: '',
  image3: '',
  image4: '',
  image5: '',
  image6: '',
  details: '',
  isNew: false,
  mostWanted: false,
  bridalLuxe: false,
  heritage: false,
  everydayMinimal: false,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [navigation, setNavigation] = useState<NavigationSettings | null>(null);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [form, setForm] = useState(defaultForm);
  const [busy, setBusy] = useState(false);
  const [imageFiles, setImageFiles] = useState<(File | null)[]>([null, null, null, null, null, null]);
  const [error, setError] = useState('');

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedProductId) || null,
    [products, selectedProductId]
  );

  async function fetchData() {
    const [productsRes, categoriesRes, storefrontRes] = await Promise.all([
      fetch('/api/admin/products', { cache: 'no-store' }),
      fetch('/api/admin/categories', { cache: 'no-store' }),
      fetch('/api/admin/storefront', { cache: 'no-store' }),
    ]);

    if (!productsRes.ok || !categoriesRes.ok || !storefrontRes.ok) {
      throw new Error('Failed to load products data');
    }

    const productsData = (await productsRes.json()) as { products: AdminProduct[] };
    const categoriesData = (await categoriesRes.json()) as { categories: AdminCategory[] };
    const storefrontData = (await storefrontRes.json()) as {
      storefront: {
        navigation: NavigationSettings;
      };
    };

    setProducts(productsData.products);
    setCategories(categoriesData.categories);
    setNavigation(storefrontData.storefront.navigation);
  }

  useEffect(() => {
    fetchData().catch((err) => setError(err instanceof Error ? err.message : 'Unable to load products'));
  }, []);

  useEffect(() => {
    if (!selectedProduct) return;

    const productImages = selectedProduct.images || [];
    setForm({
      name: selectedProduct.name,
      price: String(selectedProduct.price),
      stock: String(selectedProduct.stock),
      category: selectedProduct.category,
      collection: selectedProduct.collection,
      description: '',
      image1: productImages[0] || '',
      image2: productImages[1] || '',
      image3: productImages[2] || '',
      image4: productImages[3] || '',
      image5: productImages[4] || '',
      image6: productImages[5] || '',
      details: '',
      isNew: Boolean(selectedProduct.isNew),
      mostWanted: Boolean(selectedProduct.mostWanted),
      bridalLuxe: Boolean(selectedProduct.bridalLuxe),
      heritage: Boolean(selectedProduct.heritage),
      everydayMinimal: Boolean(selectedProduct.everydayMinimal),
    });
    setImageFiles([null, null, null, null, null, null]);
  }, [selectedProduct]);

  async function uploadImageToCloudinary(file: File) {
    const uploadForm = new FormData();
    uploadForm.append('file', file);

    const response = await fetch('/api/admin/uploads/product-image', {
      method: 'POST',
      body: uploadForm,
    });

    const data = (await response.json()) as { url?: string; error?: string };

    if (!response.ok || !data.url) {
      throw new Error(data.error || 'Image upload failed.');
    }

    return data.url;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');

    const images: string[] = [];
    
    // Process all 6 images
    for (let i = 0; i < 6; i++) {
      if (imageFiles[i]) {
        try {
          const url = await uploadImageToCloudinary(imageFiles[i]!);
          images.push(url);
        } catch (uploadError) {
          setError(uploadError instanceof Error ? uploadError.message : 'Image upload failed.');
          setBusy(false);
          return;
        }
      } else {
        const imageSources: Record<number, string> = {
          0: form.image1,
          1: form.image2,
          2: form.image3,
          3: form.image4,
          4: form.image5,
          5: form.image6,
        };
        const imageUrl = imageSources[i].trim();
        if (imageUrl) {
          images.push(imageUrl);
        }
      }
    }

    const payload = {
      name: form.name,
      price: Number(form.price),
      stock: Number(form.stock),
      category: form.category,
      collection: form.collection,
      description: form.description || 'Handcrafted by Gijayi artisans.',
      images: images.length ? images : undefined,
      details: form.details ? form.details.split(',').map((item) => item.trim()).filter(Boolean) : undefined,
      isNew: Boolean(form.isNew),
      mostWanted: Boolean(form.mostWanted),
      bridalLuxe: Boolean(form.bridalLuxe),
      heritage: Boolean(form.heritage),
      everydayMinimal: Boolean(form.everydayMinimal),
    };

    const hasCollection = navigation?.gijayiEdit.subcategories.some(
      (value) => value.toLowerCase() === form.collection.trim().toLowerCase()
    );
    if (!hasCollection) {
      setError('Collection must be one of the configured Gijayi Edit subcategories.');
      setBusy(false);
      return;
    }

    const endpoint = selectedProductId ? `/api/admin/products/${selectedProductId}` : '/api/admin/products';
    const method = selectedProductId ? 'PUT' : 'POST';

    const response = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(data.error || 'Failed to save product.');
      setBusy(false);
      return;
    }

    setForm(defaultForm);
    setSelectedProductId('');
    setImageFiles([null, null, null, null, null, null]);
    await fetchData();
    setBusy(false);
  }

  return (
    <div className="grid xl:grid-cols-[1.1fr,1fr] gap-6">
      <section className="bg-white border border-slate-200 rounded-2xl p-6">
        <h2 className="font-serif text-3xl mb-1 text-slate-900">Product Manager</h2>
        <p className="text-sm text-slate-500 mb-5">Create and update catalog items from one clean workflow.</p>

        {error && <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{error}</p>}

        <div className="mb-4">
          <label className="block text-xs tracking-widest uppercase text-slate-600 mb-2">Edit Existing Product</label>
          <select
            value={selectedProductId}
            onChange={(event) => setSelectedProductId(event.target.value)}
            className="w-full border border-slate-300 rounded-xl bg-white px-4 py-3 text-sm outline-none focus:border-blue-600"
          >
            <option value="">Create new product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>{product.name}</option>
            ))}
          </select>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Product name" className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-600" />

          <div className="grid grid-cols-2 gap-3">
            <input required type="number" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} placeholder="Price (₹)" className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-600" />
            <input required type="number" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} placeholder="Stock" className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-600" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <select required value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="w-full border border-slate-300 rounded-xl bg-white px-4 py-3 text-sm outline-none focus:border-blue-600">
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>{category.name}</option>
              ))}
            </select>
            <select required value={form.collection} onChange={(event) => setForm({ ...form, collection: event.target.value })} className="w-full border border-slate-300 rounded-xl bg-white px-4 py-3 text-sm outline-none focus:border-blue-600">
              <option value="">Select Gijayi Edit subcategory</option>
              {(navigation?.gijayiEdit.subcategories || []).map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.isNew}
              onChange={(event) => setForm({ ...form, isNew: event.target.checked })}
              className="accent-blue-600"
            />
            Add this product to Fresh Arrivals
          </label>

          <div className="border-t border-slate-200 pt-4">
            <p className="text-xs tracking-widest uppercase text-slate-600 mb-3 font-medium">Featured Sections</p>
            <div className="space-y-2">
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.mostWanted}
                  onChange={(event) => setForm({ ...form, mostWanted: event.target.checked })}
                  className="accent-emerald-600"
                />
                Most Wanted (Customer Favorites)
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.bridalLuxe}
                  onChange={(event) => setForm({ ...form, bridalLuxe: event.target.checked })}
                  className="accent-emerald-600"
                />
                Bridal Luxe Collection
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.heritage}
                  onChange={(event) => setForm({ ...form, heritage: event.target.checked })}
                  className="accent-emerald-600"
                />
                Heritage Collection
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.everydayMinimal}
                  onChange={(event) => setForm({ ...form, everydayMinimal: event.target.checked })}
                  className="accent-emerald-600"
                />
                Everyday Minimal Collection
              </label>
            </div>
          </div>

          <div className="space-y-3 border-t border-slate-200 pt-4">
            <p className="text-xs tracking-widest uppercase text-slate-600 mb-2 font-medium">Product Images (0-6 images)</p>
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4, 5, 6].map((imageNum) => {
                const imageSources: Record<number, string> = {
                  1: form.image1,
                  2: form.image2,
                  3: form.image3,
                  4: form.image4,
                  5: form.image5,
                  6: form.image6,
                };
                const imageSetters: Record<number, (url: string) => void> = {
                  1: (url) => setForm({ ...form, image1: url }),
                  2: (url) => setForm({ ...form, image2: url }),
                  3: (url) => setForm({ ...form, image3: url }),
                  4: (url) => setForm({ ...form, image4: url }),
                  5: (url) => setForm({ ...form, image5: url }),
                  6: (url) => setForm({ ...form, image6: url }),
                };
                const imageIndex = imageNum - 1;
                return (
                  <div key={imageNum} className="space-y-1">
                    <label className="text-xs font-medium text-slate-600">Image {imageNum}</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => {
                        const newFiles = [...imageFiles];
                        newFiles[imageIndex] = event.target.files?.[0] || null;
                        setImageFiles(newFiles);
                      }}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-600"
                    />
                    <input
                      value={imageSources[imageNum]}
                      onChange={(event) => imageSetters[imageNum](event.target.value)}
                      placeholder="or paste image URL"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-600"
                    />
                    {imageFiles[imageIndex] && <p className="text-xs text-emerald-600">✓ {imageFiles[imageIndex]!.name}</p>}
                  </div>
                );
              })}
            </div>
          </div>
          <input value={form.details} onChange={(event) => setForm({ ...form, details: event.target.value })} placeholder="Details (comma separated)" className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-600" />
          <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={3} placeholder="Description" className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-600" />

          <div className="flex gap-3">
            <button disabled={busy} type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-xl text-xs tracking-widest uppercase hover:bg-blue-700 disabled:opacity-50">
              {busy ? 'Saving...' : selectedProductId ? 'Update Product' : 'Add Product'}
            </button>
            {selectedProductId && (
              <button type="button" onClick={() => { setSelectedProductId(''); setForm(defaultForm); }} className="px-4 py-3 border border-slate-300 rounded-xl text-xs tracking-widest uppercase hover:bg-slate-50">
                Reset
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-6">
        <h3 className="font-serif text-2xl text-slate-900 mb-4">Catalog List</h3>
        <div className="space-y-2 mb-6">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <p className="text-xs tracking-widest uppercase text-blue-700 mb-1">Fresh Arrivals</p>
            <p className="text-sm text-blue-800">
              {(products.filter((item) => item.isNew).length)} products currently marked as Fresh Arrivals.
            </p>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <p className="text-xs tracking-widest uppercase text-emerald-700 mb-1">Featured Collections</p>
            <div className="text-sm text-emerald-800 space-y-1">
              <p>Most Wanted: {(products.filter((item) => item.mostWanted).length)} products</p>
              <p>Bridal Luxe: {(products.filter((item) => item.bridalLuxe).length)} products</p>
              <p>Heritage: {(products.filter((item) => item.heritage).length)} products</p>
              <p>Everyday Minimal: {(products.filter((item) => item.everydayMinimal).length)} products</p>
            </div>
          </div>
        </div>
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {products.map((product) => {
            const sections = [];
            if (product.isNew) sections.push('Fresh');
            if (product.mostWanted) sections.push('Most Wanted');
            if (product.bridalLuxe) sections.push('Bridal');
            if (product.heritage) sections.push('Heritage');
            if (product.everydayMinimal) sections.push('Minimal');
            
            return (
            <div key={product.id} className="border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{product.name}</p>
                <p className="text-xs text-slate-500 truncate">{product.category} · {product.collection}</p>
                {sections.length > 0 && (
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {sections.map((section) => (
                      <span key={section} className="inline-block bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded">
                        {section}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-slate-900">₹{product.price.toLocaleString('en-IN')}</p>
                <p className="text-xs text-slate-500">Stock: {product.stock}</p>
              </div>
            </div>
            );
          })}
          {!products.length && <p className="text-sm text-slate-500">No products yet.</p>}
        </div>
      </section>
    </div>
  );
}
