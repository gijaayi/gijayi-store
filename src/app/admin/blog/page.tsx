'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import RichTextEditor from '@/components/RichTextEditor';
import type {
  BlogCategory,
  BlogFaq,
  BlogPost,
  BlogPostStatus,
  BlogSeoFields,
  BlogSettings,
  BlogTag,
} from '@/lib/blogTypes';

type TabKey = 'posts' | 'categories' | 'tags' | 'settings';

interface BlogProductOption {
  id: string;
  name: string;
  slug: string;
  image?: string;
  price?: number;
}

interface BlogStats {
  total: number;
  published: number;
  drafts: number;
  scheduled: number;
  featured: number;
  categories: number;
  tags: number;
}

interface PostFormState {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categorySlug: string;
  tagsInput: string;
  authorName: string;
  authorSlug: string;
  authorImage: string;
  authorBio: string;
  status: BlogPostStatus;
  publishedAt: string;
  featured: boolean;
  featuredImage: string;
  featuredImageAlt: string;
  seo: BlogSeoFields;
  relatedProductIds: string[];
  relatedArticleIds: string[];
  faqs: BlogFaq[];
}

const emptySeo: BlogSeoFields = {
  metaTitle: '',
  metaDescription: '',
  keywords: '',
  canonicalUrl: '',
  noIndex: false,
  noFollow: false,
  ogTitle: '',
  ogDescription: '',
  ogImage: '',
  twitterTitle: '',
  twitterDescription: '',
  twitterImage: '',
};

function slugifyClient(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function toDatetimeLocal(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fromDatetimeLocal(value: string) {
  if (!value) return new Date().toISOString();
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return new Date().toISOString();
  return date.toISOString();
}

function statusClasses(status: string) {
  if (status === 'published') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (status === 'scheduled') return 'bg-blue-50 text-blue-700 border-blue-200';
  if (status === 'archived') return 'bg-slate-100 text-slate-600 border-slate-200';
  return 'bg-amber-50 text-amber-700 border-amber-200';
}

function emptyPostForm(settings?: BlogSettings | null): PostFormState {
  return {
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    categorySlug: '',
    tagsInput: '',
    authorName: settings?.defaultAuthorName || '',
    authorSlug: slugifyClient(settings?.defaultAuthorName || ''),
    authorImage: settings?.defaultAuthorImage || '',
    authorBio: settings?.defaultAuthorBio || '',
    status: 'draft',
    publishedAt: toDatetimeLocal(new Date().toISOString()),
    featured: false,
    featuredImage: '',
    featuredImageAlt: '',
    seo: { ...emptySeo },
    relatedProductIds: [],
    relatedArticleIds: [],
    faqs: [],
  };
}

function postToForm(post: BlogPost): PostFormState {
  return {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt || '',
    content: post.content || '',
    categorySlug: post.categorySlug || '',
    tagsInput: (post.tags || []).join(', '),
    authorName: post.author?.name || '',
    authorSlug: post.author?.slug || '',
    authorImage: post.author?.image || '',
    authorBio: post.author?.bio || '',
    status: post.status,
    publishedAt: toDatetimeLocal(post.publishedAt),
    featured: Boolean(post.featured),
    featuredImage: post.featuredImage || '',
    featuredImageAlt: post.featuredImageAlt || '',
    seo: { ...emptySeo, ...(post.seo || {}) },
    relatedProductIds: post.relatedProductIds || [],
    relatedArticleIds: post.relatedArticleIds || [],
    faqs: post.faqs?.length ? post.faqs.map((f) => ({ ...f })) : [],
  };
}

const inputClass =
  'w-full border border-slate-300 rounded-xl bg-white px-4 py-3 text-sm outline-none focus:border-blue-600';
const labelClass = 'block text-xs tracking-widest uppercase text-slate-600 mb-2';
const btnPrimary =
  'bg-blue-600 text-white px-4 py-2.5 text-xs tracking-widest uppercase rounded-xl hover:bg-blue-700 disabled:opacity-50';
const btnGhost =
  'text-xs tracking-widest uppercase px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50';

export default function AdminBlogPage() {
  const [tab, setTab] = useState<TabKey>('posts');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [products, setProducts] = useState<BlogProductOption[]>([]);
  const [settings, setSettings] = useState<BlogSettings | null>(null);
  const [stats, setStats] = useState<BlogStats>({
    total: 0,
    published: 0,
    drafts: 0,
    scheduled: 0,
    featured: 0,
    categories: 0,
    tags: 0,
  });
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPostId, setEditingPostId] = useState('');
  const [slugManual, setSlugManual] = useState(false);
  const [form, setForm] = useState<PostFormState>(emptyPostForm());
  const [uploadingImage, setUploadingImage] = useState(false);

  const [categoryForm, setCategoryForm] = useState({
    id: '',
    name: '',
    slug: '',
    description: '',
    sortOrder: '0',
    isActive: true,
  });
  const [tagForm, setTagForm] = useState({
    id: '',
    name: '',
    slug: '',
    description: '',
    noIndex: true,
    isActive: true,
  });
  const [settingsForm, setSettingsForm] = useState({
    title: '',
    intro: '',
    defaultAuthorName: '',
    defaultAuthorBio: '',
    defaultAuthorImage: '',
  });

  const filteredPosts = useMemo(() => {
    if (!statusFilter) return posts;
    return posts.filter((post) => post.status === statusFilter);
  }, [posts, statusFilter]);

  async function fetchBlog(status?: string) {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    const response = await fetch(`/api/admin/blog${query}`, {
      cache: 'no-store',
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to load blog data');
    const data = (await response.json()) as {
      posts: BlogPost[];
      stats: BlogStats;
      categories: BlogCategory[];
      tags: BlogTag[];
      products: BlogProductOption[];
      settings: BlogSettings;
    };
    setPosts(data.posts || []);
    setStats(
      data.stats || {
        total: 0,
        published: 0,
        drafts: 0,
        scheduled: 0,
        featured: 0,
        categories: 0,
        tags: 0,
      }
    );
    setCategories(data.categories || []);
    setTags(data.tags || []);
    setProducts(data.products || []);
    setSettings(data.settings || null);
    if (data.settings) {
      setSettingsForm({
        title: data.settings.title || '',
        intro: data.settings.intro || '',
        defaultAuthorName: data.settings.defaultAuthorName || '',
        defaultAuthorBio: data.settings.defaultAuthorBio || '',
        defaultAuthorImage: data.settings.defaultAuthorImage || '',
      });
    }
  }

  async function refreshAll() {
    setLoading(true);
    setError('');
    try {
      await fetchBlog();
      const [catRes, tagRes, setRes] = await Promise.all([
        fetch('/api/admin/blog/categories', { cache: 'no-store', credentials: 'include' }),
        fetch('/api/admin/blog/tags', { cache: 'no-store', credentials: 'include' }),
        fetch('/api/admin/blog/settings', { cache: 'no-store', credentials: 'include' }),
      ]);
      if (catRes.ok) {
        const catData = (await catRes.json()) as { categories: BlogCategory[] };
        setCategories(catData.categories || []);
      }
      if (tagRes.ok) {
        const tagData = (await tagRes.json()) as { tags: BlogTag[] };
        setTags(tagData.tags || []);
      }
      if (setRes.ok) {
        const setData = (await setRes.json()) as { settings: BlogSettings };
        setSettings(setData.settings);
        setSettingsForm({
          title: setData.settings?.title || '',
          intro: setData.settings?.intro || '',
          defaultAuthorName: setData.settings?.defaultAuthorName || '',
          defaultAuthorBio: setData.settings?.defaultAuthorBio || '',
          defaultAuthorImage: setData.settings?.defaultAuthorImage || '',
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load blog');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function flashSuccess(message: string) {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 3000);
  }

  function openNewPost() {
    setEditingPostId('');
    setSlugManual(false);
    setForm(emptyPostForm(settings));
    setShowForm(true);
    setError('');
  }

  function openEditPost(post: BlogPost) {
    setEditingPostId(post.id);
    setSlugManual(true);
    setForm(postToForm(post));
    setShowForm(true);
    setError('');
  }

  function closeForm() {
    setShowForm(false);
    setEditingPostId('');
    setSlugManual(false);
    setForm(emptyPostForm(settings));
  }

  function updateTitle(title: string) {
    setForm((current) => ({
      ...current,
      title,
      slug: slugManual ? current.slug : slugifyClient(title),
      featuredImageAlt: current.featuredImageAlt || title,
    }));
  }

  async function uploadFeaturedImage(file: File) {
    setUploadingImage(true);
    setError('');
    try {
      const uploadForm = new FormData();
      uploadForm.append('file', file);
      const response = await fetch('/api/admin/uploads/product-image', {
        method: 'POST',
        body: uploadForm,
        credentials: 'include',
      });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) throw new Error(data.error || 'Image upload failed.');
      setForm((current) => ({ ...current, featuredImage: data.url! }));
      flashSuccess('Image uploaded');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image upload failed.');
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSavePost(event: FormEvent) {
    event.preventDefault();
    if (!form.title.trim()) {
      setError('Title is required.');
      return;
    }

    setBusy(true);
    setError('');

    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim() || slugifyClient(form.title),
      excerpt: form.excerpt.trim(),
      content: form.content,
      categorySlug: form.categorySlug,
      tags: form.tagsInput
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      authorName: form.authorName.trim(),
      authorSlug: form.authorSlug.trim() || slugifyClient(form.authorName),
      authorImage: form.authorImage.trim(),
      authorBio: form.authorBio.trim(),
      status: form.status,
      publishedAt: fromDatetimeLocal(form.publishedAt),
      featured: form.featured,
      featuredImage: form.featuredImage.trim(),
      featuredImageAlt: form.featuredImageAlt.trim() || form.title.trim(),
      seo: form.seo,
      relatedProductIds: form.relatedProductIds,
      relatedArticleIds: form.relatedArticleIds,
      faqs: form.faqs.filter((faq) => faq.question.trim() && faq.answer.trim()),
    };

    try {
      const response = await fetch(
        editingPostId ? `/api/admin/blog/${editingPostId}` : '/api/admin/blog',
        {
          method: editingPostId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        }
      );
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || 'Failed to save post.');
      closeForm();
      await fetchBlog();
      flashSuccess(editingPostId ? 'Post updated' : 'Post created');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save post.');
    } finally {
      setBusy(false);
    }
  }

  async function handleDeletePost(id: string) {
    if (!window.confirm('Delete this blog post?')) return;
    setBusy(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/blog/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || 'Failed to delete post.');
      if (editingPostId === id) closeForm();
      await fetchBlog();
      flashSuccess('Post deleted');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post.');
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveCategory(event: FormEvent) {
    event.preventDefault();
    if (!categoryForm.name.trim()) return;
    setBusy(true);
    setError('');
    const payload = {
      name: categoryForm.name.trim(),
      slug: categoryForm.slug.trim() || slugifyClient(categoryForm.name),
      description: categoryForm.description.trim(),
      sortOrder: Number(categoryForm.sortOrder) || 0,
      isActive: categoryForm.isActive,
    };
    try {
      const response = await fetch(
        categoryForm.id ? `/api/admin/blog/categories/${categoryForm.id}` : '/api/admin/blog/categories',
        {
          method: categoryForm.id ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        }
      );
      const data = (await response.json()) as { error?: string; categories?: BlogCategory[] };
      if (!response.ok) throw new Error(data.error || 'Failed to save category.');
      if (data.categories) setCategories(data.categories);
      else await refreshAll();
      setCategoryForm({ id: '', name: '', slug: '', description: '', sortOrder: '0', isActive: true });
      await fetchBlog();
      flashSuccess(categoryForm.id ? 'Category updated' : 'Category created');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save category.');
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteCategory(id: string) {
    if (!window.confirm('Delete this category?')) return;
    setBusy(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/blog/categories/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || 'Failed to delete category.');
      if (categoryForm.id === id) {
        setCategoryForm({ id: '', name: '', slug: '', description: '', sortOrder: '0', isActive: true });
      }
      await refreshAll();
      flashSuccess('Category deleted');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category.');
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveTag(event: FormEvent) {
    event.preventDefault();
    if (!tagForm.name.trim()) return;
    setBusy(true);
    setError('');
    const payload = {
      name: tagForm.name.trim(),
      slug: tagForm.slug.trim() || slugifyClient(tagForm.name),
      description: tagForm.description.trim(),
      noIndex: tagForm.noIndex,
      isActive: tagForm.isActive,
    };
    try {
      const response = await fetch(
        tagForm.id ? `/api/admin/blog/tags/${tagForm.id}` : '/api/admin/blog/tags',
        {
          method: tagForm.id ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        }
      );
      const data = (await response.json()) as { error?: string; tags?: BlogTag[] };
      if (!response.ok) throw new Error(data.error || 'Failed to save tag.');
      if (data.tags) setTags(data.tags);
      else await refreshAll();
      setTagForm({ id: '', name: '', slug: '', description: '', noIndex: true, isActive: true });
      await fetchBlog();
      flashSuccess(tagForm.id ? 'Tag updated' : 'Tag created');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save tag.');
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteTag(id: string) {
    if (!window.confirm('Delete this tag?')) return;
    setBusy(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/blog/tags/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || 'Failed to delete tag.');
      if (tagForm.id === id) {
        setTagForm({ id: '', name: '', slug: '', description: '', noIndex: true, isActive: true });
      }
      await refreshAll();
      flashSuccess('Tag deleted');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete tag.');
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveSettings(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/admin/blog/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(settingsForm),
      });
      const data = (await response.json()) as { error?: string; settings?: BlogSettings };
      if (!response.ok) throw new Error(data.error || 'Failed to save settings.');
      if (data.settings) {
        setSettings(data.settings);
        setSettingsForm({
          title: data.settings.title || '',
          intro: data.settings.intro || '',
          defaultAuthorName: data.settings.defaultAuthorName || '',
          defaultAuthorBio: data.settings.defaultAuthorBio || '',
          defaultAuthorImage: data.settings.defaultAuthorImage || '',
        });
      }
      flashSuccess('Settings saved');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings.');
    } finally {
      setBusy(false);
    }
  }

  function toggleRelatedProduct(id: string) {
    setForm((current) => ({
      ...current,
      relatedProductIds: current.relatedProductIds.includes(id)
        ? current.relatedProductIds.filter((item) => item !== id)
        : [...current.relatedProductIds, id],
    }));
  }

  function toggleRelatedArticle(id: string) {
    setForm((current) => ({
      ...current,
      relatedArticleIds: current.relatedArticleIds.includes(id)
        ? current.relatedArticleIds.filter((item) => item !== id)
        : [...current.relatedArticleIds, id],
    }));
  }

  function updateFaq(index: number, field: keyof BlogFaq, value: string) {
    setForm((current) => {
      const faqs = current.faqs.map((faq, i) => (i === index ? { ...faq, [field]: value } : faq));
      return { ...current, faqs };
    });
  }

  function addFaq() {
    setForm((current) => ({
      ...current,
      faqs: [...current.faqs, { question: '', answer: '' }],
    }));
  }

  function removeFaq(index: number) {
    setForm((current) => ({
      ...current,
      faqs: current.faqs.filter((_, i) => i !== index),
    }));
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'posts', label: 'Posts' },
    { key: 'categories', label: 'Categories' },
    { key: 'tags', label: 'Tags' },
    { key: 'settings', label: 'Settings' },
  ];

  const statCards = [
    { label: 'Total', value: stats.total },
    { label: 'Published', value: stats.published },
    { label: 'Drafts', value: stats.drafts },
    { label: 'Scheduled', value: stats.scheduled },
    { label: 'Featured', value: stats.featured },
    { label: 'Categories', value: stats.categories },
    { label: 'Tags', value: stats.tags },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-slate-800 mb-3" />
          <p className="text-sm text-slate-600">Loading blog studio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="text-[10px] tracking-widest uppercase text-slate-500 mb-1">{card.label}</p>
            <p className="font-serif text-3xl text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>

      <section className="bg-white border border-slate-200 rounded-2xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="font-serif text-3xl mb-1 text-slate-900">Journal Studio</h2>
            <p className="text-sm text-slate-500">Manage posts, taxonomy, and editorial defaults.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {tabs.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                className={`px-4 py-2 text-xs tracking-widest uppercase rounded-xl border transition-colors ${
                  tab === item.key
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{error}</p>
        )}
        {success && (
          <p className="mb-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg">
            {success}
          </p>
        )}

        {tab === 'posts' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <label className="text-xs tracking-widest uppercase text-slate-600">Status</label>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="border border-slate-300 rounded-lg bg-white px-3 py-2 text-xs tracking-widest uppercase outline-none focus:border-blue-600"
                >
                  <option value="">All</option>
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <button type="button" onClick={openNewPost} className={btnPrimary}>
                New Post
              </button>
            </div>

            {showForm && (
              <form onSubmit={handleSavePost} className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-serif text-2xl text-slate-900">
                    {editingPostId ? 'Edit Post' : 'New Post'}
                  </h3>
                  <button type="button" onClick={closeForm} className={btnGhost}>
                    Close
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Title</label>
                    <input
                      required
                      value={form.title}
                      onChange={(event) => updateTitle(event.target.value)}
                      className={inputClass}
                      placeholder="Post title"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Slug</label>
                    <input
                      value={form.slug}
                      onChange={(event) => {
                        setSlugManual(true);
                        setForm((current) => ({ ...current, slug: slugifyClient(event.target.value) }));
                      }}
                      className={inputClass}
                      placeholder="post-slug"
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Excerpt</label>
                  <textarea
                    value={form.excerpt}
                    onChange={(event) => setForm((current) => ({ ...current, excerpt: event.target.value }))}
                    rows={3}
                    className={inputClass}
                    placeholder="Short summary for cards and SEO"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Category</label>
                    <select
                      value={form.categorySlug}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, categorySlug: event.target.value }))
                      }
                      className={inputClass}
                    >
                      <option value="">Select category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.slug}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Tags (comma separated)</label>
                    <input
                      value={form.tagsInput}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, tagsInput: event.target.value }))
                      }
                      className={inputClass}
                      placeholder="jewelry, bridal, heritage"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Author Name</label>
                    <input
                      value={form.authorName}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          authorName: event.target.value,
                          authorSlug: current.authorSlug || slugifyClient(event.target.value),
                        }))
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Author Slug</label>
                    <input
                      value={form.authorSlug}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          authorSlug: slugifyClient(event.target.value),
                        }))
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Author Image URL</label>
                    <input
                      value={form.authorImage}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, authorImage: event.target.value }))
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Author Bio</label>
                    <input
                      value={form.authorBio}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, authorBio: event.target.value }))
                      }
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>Status</label>
                    <select
                      value={form.status}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          status: event.target.value as BlogPostStatus,
                        }))
                      }
                      className={inputClass}
                    >
                      <option value="draft">Draft</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Published At</label>
                    <input
                      type="datetime-local"
                      value={form.publishedAt}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, publishedAt: event.target.value }))
                      }
                      className={inputClass}
                    />
                  </div>
                  <div className="flex items-end pb-1">
                    <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={form.featured}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, featured: event.target.checked }))
                        }
                        className="accent-blue-600"
                      />
                      Featured post
                    </label>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Content</label>
                  <RichTextEditor
                    value={form.content}
                    onChange={(value) => setForm((current) => ({ ...current, content: value }))}
                    placeholder="Write the journal article..."
                  />
                </div>

                <div className="grid md:grid-cols-[1fr_auto] gap-3 items-end">
                  <div>
                    <label className={labelClass}>Featured Image URL</label>
                    <input
                      value={form.featuredImage}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, featuredImage: event.target.value }))
                      }
                      className={inputClass}
                      placeholder="https://..."
                    />
                  </div>
                  <label className={`${btnPrimary} cursor-pointer inline-flex items-center justify-center`}>
                    {uploadingImage ? 'Uploading...' : 'Upload'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingImage}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) uploadFeaturedImage(file);
                        event.target.value = '';
                      }}
                    />
                  </label>
                </div>
                <div>
                  <label className={labelClass}>Featured Image Alt</label>
                  <input
                    value={form.featuredImageAlt}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, featuredImageAlt: event.target.value }))
                    }
                    className={inputClass}
                  />
                </div>
                {form.featuredImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.featuredImage}
                    alt={form.featuredImageAlt || form.title || 'Featured'}
                    className="h-40 w-full max-w-md object-cover rounded-xl border border-slate-200"
                  />
                ) : null}

                <div className="border-t border-slate-200 pt-4 space-y-3">
                  <p className="text-xs tracking-widest uppercase text-slate-600 font-medium">SEO</p>
                  <div className="grid md:grid-cols-2 gap-3">
                    <input
                      value={form.seo.metaTitle || ''}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          seo: { ...current.seo, metaTitle: event.target.value },
                        }))
                      }
                      placeholder="Meta title"
                      className={inputClass}
                    />
                    <input
                      value={form.seo.keywords || ''}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          seo: { ...current.seo, keywords: event.target.value },
                        }))
                      }
                      placeholder="Keywords"
                      className={inputClass}
                    />
                  </div>
                  <textarea
                    value={form.seo.metaDescription || ''}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        seo: { ...current.seo, metaDescription: event.target.value },
                      }))
                    }
                    rows={2}
                    placeholder="Meta description"
                    className={inputClass}
                  />
                  <input
                    value={form.seo.canonicalUrl || ''}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        seo: { ...current.seo, canonicalUrl: event.target.value },
                      }))
                    }
                    placeholder="Canonical URL"
                    className={inputClass}
                  />
                  <div className="flex flex-wrap gap-4">
                    <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={Boolean(form.seo.noIndex)}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            seo: { ...current.seo, noIndex: event.target.checked },
                          }))
                        }
                        className="accent-blue-600"
                      />
                      noIndex
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={Boolean(form.seo.noFollow)}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            seo: { ...current.seo, noFollow: event.target.checked },
                          }))
                        }
                        className="accent-blue-600"
                      />
                      noFollow
                    </label>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <input
                      value={form.seo.ogTitle || ''}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          seo: { ...current.seo, ogTitle: event.target.value },
                        }))
                      }
                      placeholder="OG title"
                      className={inputClass}
                    />
                    <input
                      value={form.seo.ogImage || ''}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          seo: { ...current.seo, ogImage: event.target.value },
                        }))
                      }
                      placeholder="OG image URL"
                      className={inputClass}
                    />
                  </div>
                  <textarea
                    value={form.seo.ogDescription || ''}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        seo: { ...current.seo, ogDescription: event.target.value },
                      }))
                    }
                    rows={2}
                    placeholder="OG description"
                    className={inputClass}
                  />
                </div>

                <div className="border-t border-slate-200 pt-4 space-y-3">
                  <p className="text-xs tracking-widest uppercase text-slate-600 font-medium">
                    Related Products
                  </p>
                  <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl bg-white p-3 space-y-2">
                    {products.map((product) => (
                      <label key={product.id} className="flex items-center gap-2 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={form.relatedProductIds.includes(product.id)}
                          onChange={() => toggleRelatedProduct(product.id)}
                          className="accent-blue-600"
                        />
                        {product.name}
                      </label>
                    ))}
                    {!products.length && <p className="text-sm text-slate-500">No products available.</p>}
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-4 space-y-3">
                  <p className="text-xs tracking-widest uppercase text-slate-600 font-medium">
                    Related Articles
                  </p>
                  <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl bg-white p-3 space-y-2">
                    {posts
                      .filter((post) => post.id !== editingPostId)
                      .map((post) => (
                        <label key={post.id} className="flex items-center gap-2 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={form.relatedArticleIds.includes(post.id)}
                            onChange={() => toggleRelatedArticle(post.id)}
                            className="accent-blue-600"
                          />
                          {post.title}
                        </label>
                      ))}
                    {!posts.filter((post) => post.id !== editingPostId).length && (
                      <p className="text-sm text-slate-500">No other articles yet.</p>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs tracking-widest uppercase text-slate-600 font-medium">FAQ</p>
                    <button type="button" onClick={addFaq} className={btnGhost}>
                      Add FAQ
                    </button>
                  </div>
                  {form.faqs.map((faq, index) => (
                    <div key={index} className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
                      <input
                        value={faq.question}
                        onChange={(event) => updateFaq(index, 'question', event.target.value)}
                        placeholder="Question"
                        className={inputClass}
                      />
                      <textarea
                        value={faq.answer}
                        onChange={(event) => updateFaq(index, 'answer', event.target.value)}
                        placeholder="Answer"
                        rows={2}
                        className={inputClass}
                      />
                      <button
                        type="button"
                        onClick={() => removeFaq(index)}
                        className="text-xs tracking-widest uppercase text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <button type="submit" disabled={busy} className={btnPrimary}>
                    {busy ? 'Saving...' : editingPostId ? 'Update Post' : 'Create Post'}
                  </button>
                  <button type="button" onClick={closeForm} className={btnGhost}>
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-3 max-h-[720px] overflow-y-auto pr-1">
              {filteredPosts.map((post) => (
                <div key={post.id} className="border border-slate-200 rounded-xl p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{post.title}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {post.slug} · {new Date(post.updatedAt || post.publishedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] tracking-widest uppercase px-2 py-1 rounded-full border ${statusClasses(post.status)}`}
                      >
                        {post.status}
                      </span>
                      {post.featured ? (
                        <span className="text-[10px] tracking-widest uppercase px-2 py-1 rounded-full border bg-violet-50 text-violet-700 border-violet-200">
                          Featured
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <button
                      type="button"
                      onClick={() => openEditPost(post)}
                      className="text-xs tracking-widest uppercase text-slate-700 hover:text-slate-900"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleDeletePost(post.id)}
                      className="text-xs tracking-widest uppercase text-red-600 hover:text-red-700 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {!filteredPosts.length && <p className="text-sm text-slate-500">No posts found.</p>}
            </div>
          </div>
        )}

        {tab === 'categories' && (
          <div className="space-y-5">
            <form onSubmit={handleSaveCategory} className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <p className="text-xs tracking-widest uppercase text-slate-600">
                {categoryForm.id ? 'Edit Category' : 'Add Category'}
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                <input
                  required
                  value={categoryForm.name}
                  onChange={(event) =>
                    setCategoryForm((current) => ({
                      ...current,
                      name: event.target.value,
                      slug: current.id ? current.slug : slugifyClient(event.target.value),
                    }))
                  }
                  placeholder="Name"
                  className={inputClass}
                />
                <input
                  value={categoryForm.slug}
                  onChange={(event) =>
                    setCategoryForm((current) => ({
                      ...current,
                      slug: slugifyClient(event.target.value),
                    }))
                  }
                  placeholder="Slug"
                  className={inputClass}
                />
              </div>
              <textarea
                value={categoryForm.description}
                onChange={(event) =>
                  setCategoryForm((current) => ({ ...current, description: event.target.value }))
                }
                rows={2}
                placeholder="Description"
                className={inputClass}
              />
              <div className="grid md:grid-cols-2 gap-3 items-center">
                <input
                  type="number"
                  value={categoryForm.sortOrder}
                  onChange={(event) =>
                    setCategoryForm((current) => ({ ...current, sortOrder: event.target.value }))
                  }
                  placeholder="Sort order"
                  className={inputClass}
                />
                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={categoryForm.isActive}
                    onChange={(event) =>
                      setCategoryForm((current) => ({ ...current, isActive: event.target.checked }))
                    }
                    className="accent-blue-600"
                  />
                  Active
                </label>
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={busy} className={btnPrimary}>
                  {categoryForm.id ? 'Update Category' : 'Add Category'}
                </button>
                {categoryForm.id ? (
                  <button
                    type="button"
                    onClick={() =>
                      setCategoryForm({
                        id: '',
                        name: '',
                        slug: '',
                        description: '',
                        sortOrder: '0',
                        isActive: true,
                      })
                    }
                    className={btnGhost}
                  >
                    Cancel
                  </button>
                ) : null}
              </div>
            </form>

            <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
              {categories.map((category) => (
                <div key={category.id} className="border border-slate-200 rounded-xl p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{category.name}</p>
                      <p className="text-[10px] tracking-widest uppercase text-slate-500">
                        {category.slug} · order {category.sortOrder}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setCategoryForm({
                            id: category.id,
                            name: category.name,
                            slug: category.slug,
                            description: category.description || '',
                            sortOrder: String(category.sortOrder ?? 0),
                            isActive: category.isActive !== false,
                          })
                        }
                        className="text-xs tracking-widest uppercase text-slate-700 hover:text-slate-900"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-xs tracking-widest uppercase text-red-600 hover:text-red-700 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {!categories.length && <p className="text-sm text-slate-500">No categories yet.</p>}
            </div>
          </div>
        )}

        {tab === 'tags' && (
          <div className="space-y-5">
            <form onSubmit={handleSaveTag} className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <p className="text-xs tracking-widest uppercase text-slate-600">
                {tagForm.id ? 'Edit Tag' : 'Add Tag'}
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                <input
                  required
                  value={tagForm.name}
                  onChange={(event) =>
                    setTagForm((current) => ({
                      ...current,
                      name: event.target.value,
                      slug: current.id ? current.slug : slugifyClient(event.target.value),
                    }))
                  }
                  placeholder="Name"
                  className={inputClass}
                />
                <input
                  value={tagForm.slug}
                  onChange={(event) =>
                    setTagForm((current) => ({
                      ...current,
                      slug: slugifyClient(event.target.value),
                    }))
                  }
                  placeholder="Slug"
                  className={inputClass}
                />
              </div>
              <textarea
                value={tagForm.description}
                onChange={(event) =>
                  setTagForm((current) => ({ ...current, description: event.target.value }))
                }
                rows={2}
                placeholder="Description"
                className={inputClass}
              />
              <div className="flex flex-wrap gap-4">
                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={tagForm.noIndex}
                    onChange={(event) =>
                      setTagForm((current) => ({ ...current, noIndex: event.target.checked }))
                    }
                    className="accent-blue-600"
                  />
                  noIndex (default on)
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={tagForm.isActive}
                    onChange={(event) =>
                      setTagForm((current) => ({ ...current, isActive: event.target.checked }))
                    }
                    className="accent-blue-600"
                  />
                  Active
                </label>
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={busy} className={btnPrimary}>
                  {tagForm.id ? 'Update Tag' : 'Add Tag'}
                </button>
                {tagForm.id ? (
                  <button
                    type="button"
                    onClick={() =>
                      setTagForm({
                        id: '',
                        name: '',
                        slug: '',
                        description: '',
                        noIndex: true,
                        isActive: true,
                      })
                    }
                    className={btnGhost}
                  >
                    Cancel
                  </button>
                ) : null}
              </div>
            </form>

            <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
              {tags.map((tag) => (
                <div key={tag.id} className="border border-slate-200 rounded-xl p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{tag.name}</p>
                      <p className="text-[10px] tracking-widest uppercase text-slate-500">
                        {tag.slug}
                        {tag.noIndex ? ' · noIndex' : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setTagForm({
                            id: tag.id,
                            name: tag.name,
                            slug: tag.slug,
                            description: tag.description || '',
                            noIndex: tag.noIndex !== false,
                            isActive: tag.isActive !== false,
                          })
                        }
                        className="text-xs tracking-widest uppercase text-slate-700 hover:text-slate-900"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleDeleteTag(tag.id)}
                        className="text-xs tracking-widest uppercase text-red-600 hover:text-red-700 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {!tags.length && <p className="text-sm text-slate-500">No tags yet.</p>}
            </div>
          </div>
        )}

        {tab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="space-y-4 max-w-3xl">
            <div>
              <label className={labelClass}>Journal Title</label>
              <input
                value={settingsForm.title}
                onChange={(event) =>
                  setSettingsForm((current) => ({ ...current, title: event.target.value }))
                }
                className={inputClass}
                placeholder="Gijayi Journal"
              />
            </div>
            <div>
              <label className={labelClass}>Intro</label>
              <textarea
                value={settingsForm.intro}
                onChange={(event) =>
                  setSettingsForm((current) => ({ ...current, intro: event.target.value }))
                }
                rows={4}
                className={inputClass}
                placeholder="Editorial introduction shown on the journal landing page"
              />
            </div>
            <div>
              <label className={labelClass}>Default Author Name</label>
              <input
                value={settingsForm.defaultAuthorName}
                onChange={(event) =>
                  setSettingsForm((current) => ({
                    ...current,
                    defaultAuthorName: event.target.value,
                  }))
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Default Author Bio</label>
              <textarea
                value={settingsForm.defaultAuthorBio}
                onChange={(event) =>
                  setSettingsForm((current) => ({
                    ...current,
                    defaultAuthorBio: event.target.value,
                  }))
                }
                rows={3}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Default Author Image URL</label>
              <input
                value={settingsForm.defaultAuthorImage}
                onChange={(event) =>
                  setSettingsForm((current) => ({
                    ...current,
                    defaultAuthorImage: event.target.value,
                  }))
                }
                className={inputClass}
              />
            </div>
            <button type="submit" disabled={busy} className={btnPrimary}>
              {busy ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
