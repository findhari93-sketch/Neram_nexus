// lib/utils/photoResolver.ts
/**
 * Optimized photo URL resolver with caching
 * Extracts photo URLs from various database column formats
 */

// Cache for resolved photo URLs to avoid re-parsing
const photoCache = new Map<string, string | undefined>();

export interface PhotoSource {
  account?: any;
  photo_url?: string | null;
  [key: string]: any;
}

/**
 * Helper function to check if a string is a valid URL
 */
function isValidUrl(str: string): boolean {
  if (!str || typeof str !== "string") return false;
  const trimmed = str.trim();
  return (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.includes("googleusercontent.com") ||
    trimmed.includes("googleapis.com")
  );
}

/**
 * Check if URL needs to be proxied to bypass CORS
 */
function needsProxy(url: string): boolean {
  if (!url) return false;
  const corsRestrictedDomains = [
    'googleusercontent.com',
    'graph.facebook.com',
    'avatars.githubusercontent.com',
  ];
  return corsRestrictedDomains.some(domain => url.includes(domain));
}

/**
 * Wrap URL with proxy if it needs CORS bypass
 */
function wrapWithProxy(url: string): string {
  if (!url) return url;

  // Don't proxy URLs that are already proxied
  if (url.includes('/api/proxy-image')) return url;

  // Don't proxy Firebase Storage URLs (they have proper CORS)
  if (url.includes('firebasestorage.googleapis.com')) return url;

  // Wrap CORS-restricted URLs with our proxy
  if (needsProxy(url)) {
    return `/api/proxy-image?url=${encodeURIComponent(url)}`;
  }

  return url;
}

/**
 * Parse JSONB account field (handles string or object)
 */
function parseAccount(account: any): any {
  if (!account) return undefined;
  if (typeof account === "object") return account;
  if (typeof account === "string") {
    try {
      return JSON.parse(account);
    } catch {
      return undefined;
    }
  }
  return undefined;
}

/**
 * Resolve photo URL from a row with caching
 * Priority: account.photo_url > account.avatar_path > account.picture > top-level photo_url
 * Automatically wraps CORS-restricted URLs (Google, Facebook) with proxy
 */
export function resolvePhotoFromRow(row: PhotoSource): string | undefined {
  if (!row) return undefined;

  // Generate cache key from row ID or account data
  const cacheKey = row.id ? `photo_${row.id}` : undefined;

  // Check cache first
  if (cacheKey && photoCache.has(cacheKey)) {
    return photoCache.get(cacheKey);
  }

  let result: string | undefined;

  // Parse account JSONB
  const account = parseAccount(row.account);

  if (account && typeof account === "object") {
    // Priority 1: Google Auth photo_url variants
    const photoUrl = account.photo_url || account.photoURL || account.photoUrl;
    if (photoUrl && typeof photoUrl === "string" && isValidUrl(photoUrl)) {
      result = photoUrl.trim();
    }

    // Priority 2: Custom avatar_path
    if (!result) {
      const avatarPath = account.avatar_path;
      if (
        avatarPath &&
        typeof avatarPath === "string" &&
        isValidUrl(avatarPath)
      ) {
        result = avatarPath.trim();
      }
    }

    // Priority 3: Google 'picture' field or other variants
    if (!result) {
      const candidates = [
        "picture",
        "avatar",
        "image",
        "profile_image",
        "profilePhoto",
        "avatar_url",
      ];
      for (const key of candidates) {
        const value = account[key];
        if (value && typeof value === "string" && isValidUrl(value)) {
          result = value.trim();
          break;
        }
      }
    }
  }

  // Priority 4: Top-level photo_url
  if (
    !result &&
    row.photo_url &&
    typeof row.photo_url === "string" &&
    isValidUrl(row.photo_url)
  ) {
    result = row.photo_url.trim();
  }

  // Wrap with proxy if needed to bypass CORS
  if (result) {
    result = wrapWithProxy(result);
  }

  // Cache the result
  if (cacheKey) {
    photoCache.set(cacheKey, result);
  }

  return result;
}

/**
 * Clear photo cache (call when data is refreshed)
 */
export function clearPhotoCache(): void {
  photoCache.clear();
}

/**
 * Pre-resolve photos for multiple rows (batch optimization)
 */
export function batchResolvePhotos(
  rows: PhotoSource[]
): Map<string | number, string | undefined> {
  const results = new Map<string | number, string | undefined>();

  for (const row of rows) {
    if (row.id) {
      results.set(row.id, resolvePhotoFromRow(row));
    }
  }

  return results;
}
