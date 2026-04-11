/**
 * Utility functions for applying font styles to product typography
 */

export type FontType = 'serif' | 'sans-serif' | 'mono' | 'display';

interface FontClasses {
  name: string;
  classes: string;
}

const FONT_CLASSES: Record<FontType | 'serif' | 'sans-serif' | 'mono' | 'display', FontClasses> = {
  serif: {
    name: 'Serif',
    classes: 'font-serif',
  },
  'sans-serif': {
    name: 'Sans-Serif',
    classes: 'font-sans',
  },
  mono: {
    name: 'Monospace',
    classes: 'font-mono',
  },
  display: {
    name: 'Display',
    classes: 'font-serif tracking-wider',
  },
};

/**
 * Get Tailwind CSS classes for a font type
 * @param fontType - The font type (serif, sans-serif, mono, display)
 * @returns Tailwind CSS class string
 */
export function getFontClasses(fontType?: 'serif' | 'sans-serif' | 'mono' | 'display'): string {
  const type = fontType || 'serif';
  return FONT_CLASSES[type]?.classes || 'font-serif';
}

/**
 * Get font name for display purposes
 * @param fontType - The font type
 * @returns Human-readable font name
 */
export function getFontName(fontType?: 'serif' | 'sans-serif' | 'mono' | 'display'): string {
  const type = fontType || 'serif';
  return FONT_CLASSES[type]?.name || 'Serif';
}

/**
 * Apply font styling to product name element
 * @param fontType - The font type for product name
 * @returns Combined Tailwind classes for product name styling
 */
export function getProductNameClasses(fontType?: 'serif' | 'sans-serif' | 'mono' | 'display'): string {
  const baseClasses = 'text-xl font-bold';
  const fontClasses = getFontClasses(fontType || 'serif');
  return `${baseClasses} ${fontClasses}`;
}

/**
 * Apply font styling to product description element
 * @param fontType - The font type for product description
 * @returns Combined Tailwind classes for product description styling
 */
export function getProductDescriptionClasses(fontType?: 'serif' | 'sans-serif' | 'mono'): string {
  const baseClasses = 'text-sm leading-relaxed';
  const fontClasses = getFontClasses(fontType || 'sans-serif');
  return `${baseClasses} ${fontClasses}`;
}

/**
 * Apply font styling to product details element
 * @param fontType - The font type for product details
 * @returns Combined Tailwind classes for product details styling
 */
export function getProductDetailsClasses(fontType?: 'serif' | 'sans-serif' | 'mono'): string {
  const baseClasses = 'text-xs';
  const fontClasses = getFontClasses(fontType || 'sans-serif');
  return `${baseClasses} ${fontClasses}`;
}
