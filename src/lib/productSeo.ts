/** Shared product SEO field limits and normalization. */

export const SEO_TITLE_MAX = 70;
export const META_DESCRIPTION_MAX = 170;

/**
 * Trim whitespace and drop empty values so optional SEO fields
 * are never stored as empty strings.
 */
export function normalizeOptionalSeoField(
  value: unknown,
  maxLength: number,
): string | undefined {
  if (value === undefined || value === null) return undefined;
  const trimmed = String(value).trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, maxLength);
}

export function normalizeMetaKeywords(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  const trimmed = String(value).trim();
  if (!trimmed) return undefined;

  const normalized = trimmed
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .join(', ');

  return normalized || undefined;
}

export function parseProductSeoFields(body: Record<string, unknown>) {
  return {
    seoTitle: normalizeOptionalSeoField(body.seoTitle, SEO_TITLE_MAX),
    metaDescription: normalizeOptionalSeoField(body.metaDescription, META_DESCRIPTION_MAX),
    metaKeywords: normalizeMetaKeywords(body.metaKeywords),
  };
}

/** Strip HTML tags for plain-text SEO fallbacks. */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}