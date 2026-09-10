export type BlogPostStatus = 'draft' | 'scheduled' | 'published' | 'archived';

export interface BlogSeoFields {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
}

export interface BlogAuthor {
  name: string;
  slug: string;
  image?: string;
  bio?: string;
}

export interface BlogFaq {
  question: string;
  answer: string;
}

export interface BlogTocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  featuredImageAlt: string;
  thumbnailImage?: string;
  categorySlug: string;
  tags: string[];
  author: BlogAuthor;
  status: BlogPostStatus;
  featured: boolean;
  publishedAt: string;
  readingTime: number;
  seo: BlogSeoFields;
  relatedProductIds: string[];
  relatedArticleIds: string[];
  faqs: BlogFaq[];
  socialImage?: string;
  previousSlug?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  noIndex: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BlogRedirect {
  id: string;
  fromSlug: string;
  toSlug: string;
  createdAt: string;
}

export interface BlogSettings {
  id: string;
  title: string;
  intro: string;
  defaultAuthorName: string;
  defaultAuthorBio: string;
  defaultAuthorImage?: string;
  updatedAt: string;
}