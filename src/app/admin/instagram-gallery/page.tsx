'use client';

import { useEffect, useState } from 'react';
import { Upload, Trash2, Plus, AlertCircle, CheckCircle } from 'lucide-react';

interface InstagramImage {
  id: string;
  url: string;
  uploadedAt: string;
}

interface InstagramGallery {
  id: string;
  handle: string;
  profileUrl: string;
  maxImages: number;
  images: InstagramImage[];
  updatedAt: string;
}

export default function AdminInstagramGalleryPage() {
  const [gallery, setGallery] = useState<InstagramGallery | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [handle, setHandle] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [images, setImages] = useState<InstagramImage[]>([]);

  async function fetchGallery() {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/instagram-gallery');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      if (data.instagramGallery) {
        setGallery(data.instagramGallery);
        setHandle(data.instagramGallery.handle || 'begijayi');
        setImages(Array.isArray(data.instagramGallery.images) ? data.instagramGallery.images : []);
      }
      setError('');
    } catch (err) {
      setError('Failed to load Instagram gallery settings');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchGallery();
  }, []);

  async function handleSave() {
    if (!handle.trim()) {
      setError('Instagram handle is required');
      return;
    }

    if (images.length === 0) {
      setError('At least one image is required');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/admin/instagram-gallery', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handle: handle.trim(),
          images: images.map((img) => ({ id: img.id, url: img.url })),
        }),
      });

      if (!res.ok) throw new Error('Failed to save');
      const data = await res.json();
      setGallery(data.instagramGallery);
      setSuccess('Instagram gallery updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save Instagram gallery settings');
    } finally {
      setSaving(false);
    }
  }

  function handleAddImage() {
    if (!newImageUrl.trim()) {
      setError('Please enter an image URL');
      return;
    }

    if (images.length >= (gallery?.maxImages || 6)) {
      setError(`Maximum ${gallery?.maxImages || 6} images allowed`);
      return;
    }

    const newImage: InstagramImage = {
      id: Date.now().toString(),
      url: newImageUrl.trim(),
      uploadedAt: new Date().toISOString(),
    };

    setImages([...images, newImage]);
    setNewImageUrl('');
    setError('');
  }

  function handleRemoveImage(id: string) {
    setImages(images.filter((img) => img.id !== id));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#b8963e] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Instagram gallery settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Instagram Gallery</h1>
        <p className="text-gray-600">Manage Instagram account and trending product images displayed on the homepage</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-red-600 mt-0.5 flex-shrink-0" size={20} />
          <div>
            <p className="font-medium text-red-900">Error</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="text-green-600 mt-0.5 flex-shrink-0" size={20} />
          <div>
            <p className="font-medium text-green-900">Success</p>
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Instagram Handle
          </label>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">@</span>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="begijayi"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#b8963e] focus:ring-2 focus:ring-[#b8963e]/20"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Profile URL: instagram.com/{handle}</p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Add Product Image
          </label>
          <p className="text-xs text-gray-600 mb-3">
            Maximum {gallery?.maxImages || 6} images allowed ({images.length}/{gallery?.maxImages || 6} added)
          </p>
          <div className="flex gap-2">
            <input
              type="url"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#b8963e] focus:ring-2 focus:ring-[#b8963e]/20"
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleAddImage();
              }}
            />
            <button
              onClick={handleAddImage}
              disabled={images.length >= (gallery?.maxImages || 6)}
              className="px-4 py-2 bg-[#b8963e] text-white rounded-lg hover:bg-[#a0804f] disabled:bg-gray-300 flex items-center gap-2 transition-colors"
            >
              <Plus size={18} /> Add
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-4">
            Added Images ({images.length})
          </label>

          {images.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <Upload className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="text-gray-600">No images added yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((image) => (
                <div key={image.id} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={image.url}
                      alt="Instagram gallery"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://via.placeholder.com/300?text=Invalid+Image';
                      }}
                    />
                  </div>
                  <button
                    onClick={() => handleRemoveImage(image.id)}
                    className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-700"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="px-6 py-3 bg-[#1a1a1a] text-white font-semibold rounded-lg hover:bg-[#b8963e] disabled:bg-gray-400 transition-colors"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          onClick={fetchGallery}
          disabled={loading}
          className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
