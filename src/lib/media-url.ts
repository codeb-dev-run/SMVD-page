/**
 * Normalize a media filepath for client use.
 *
 * After the Vercel Blob migration, new uploads store full Blob URLs
 * (https://…blob.vercel-storage.com/uploads/…) in the DB.  However
 * older rows still contain relative paths like "/uploads/2026/02/…"
 * which 404 on the app domain.
 *
 * This helper detects relative /uploads/ paths and rewrites them to
 * the correct Blob URL using the BLOB_READ_WRITE_TOKEN env var.
 * Paths that already start with "http" or point to static assets
 * (e.g. /images/…) are returned as-is.
 */
import { env } from "@/lib/env";

export function normalizeMediaUrl(filepath: string | null | undefined): string | null {
  if (!filepath) return null;
  if (filepath.startsWith("http")) return filepath;

  if (filepath.startsWith("/uploads/")) {
    const token = env.BLOB_READ_WRITE_TOKEN;
    if (token) {
      const match = token.match(/^vercel_blob_rw_([^_]+)_/);
      if (match) {
        return `https://${match[1]}.public.blob.vercel-storage.com${filepath}`;
      }
    }
  }

  // Static assets (/images/…) or other paths – return as-is
  return filepath;
}

/**
 * Deep-traverse a JSON value and normalise every string that looks
 * like a legacy /uploads/ path.  This is intended to be called from
 * Server Components before handing data to client components, since
 * the Blob token is only available server-side.
 */
export function normalizeContentUrls<T>(value: T): T {
  if (value === null || value === undefined) return value;

  if (typeof value === 'string') {
    if (value.startsWith('/uploads/')) {
      return (normalizeMediaUrl(value) ?? value) as unknown as T;
    }
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeContentUrls(item)) as unknown as T;
  }

  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = normalizeContentUrls(v);
    }
    return out as T;
  }

  return value;
}
