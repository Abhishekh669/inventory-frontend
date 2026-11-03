import type { Category } from '@/utils/types/category.types'

export const NAME_MIN = 2
export const NAME_MAX = 60
export const SLUG_MIN = 2
export const SLUG_MAX = 60

// lowercase letters/numbers, single hyphens between words, no leading/trailing hyphen
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** Turn any text into a valid slug (used for auto-fill from the name). */
export function slugify(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+/, '')
    .slice(0, SLUG_MAX)
    .replace(/-+$/, '')
}

/** Light cleanup while the user types the slug by hand (keeps a trailing "-" so "a-b" can be typed). */
export function sanitizeSlugInput(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-+/, '')
    .slice(0, SLUG_MAX)
}

export function validateName(name: string): string | undefined {
  const value = name.trim()
  if (!value) return 'Name is required.'
  if (value.length < NAME_MIN) return `Name must be at least ${NAME_MIN} characters.`
  if (value.length > NAME_MAX) return `Name must be at most ${NAME_MAX} characters.`
}

export function validateSlug(
  slug: string,
  existing: Category[],
  ignoreId?: string
): string | undefined {
  if (!slug) return 'Slug is required.'
  if (slug.length < SLUG_MIN) return `Slug must be at least ${SLUG_MIN} characters.`
  if (slug.length > SLUG_MAX) return `Slug must be at most ${SLUG_MAX} characters.`
  if (!SLUG_REGEX.test(slug)) {
    return 'Use lowercase letters, numbers and single hyphens only. It cannot start or end with a hyphen.'
  }
  const taken = existing.some((c) => c.slug === slug && c.id !== ignoreId)
  if (taken) return 'This slug is already used by another category.'
}

export function getActionError(res: unknown, fallback: string) {
  if (res && typeof res === 'object' && 'error' in res) {
    const err = (res as { error?: unknown }).error
    if (typeof err === 'string' && err) return err
  }
  return fallback
}





// utils/helper/generate-sku.ts

const clean = (value: string, length: number) =>
  value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, length);

const randomSuffix = (length = 5) => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I to avoid confusion
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
};

/**
 * Example: generateSku("cement", "OPC Cement 50kg") -> "CEM-OPCC-K7M3Q"
 * Format: CATEGORY(3) - NAME(4) - RANDOM(5), well under the 50 character limit.
 * The backend unique constraint still guards against the rare collision.
 */
export const generateSku = (categorySlug: string, productName: string) => {
  const cat = clean(categorySlug, 3) || "GEN";
  const name = clean(productName, 4) || "ITEM";
  return `${cat}-${name}-${randomSuffix()}`;
};