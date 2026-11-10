/**
 * Normalize an upload/document URL so that bare filenames or relative paths
 * always resolve under /uploads/ instead of being treated as app routes
 * (which caused Vite to serve index.html inside preview iframes).
 */
export function resolveUploadUrl(url) {
  if (url === null || url === undefined) return "";
  if (typeof url !== "string") return url;
  const trimmed = url.trim();
  if (!trimmed) return "";

  // Pass through absolute/external/data/blob/mailto URLs untouched.
  if (/^(https?:|data:|blob:|mailto:|tel:|#)/i.test(trimmed)) {
    return trimmed;
  }

  // Already an absolute site path.
  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  // "uploads/..." or "downloads/..." without leading slash.
  if (/^(uploads|downloads)\//i.test(trimmed)) {
    return `/${trimmed}`;
  }

  // Bare filename or relative path -> prefix with /uploads/.
  return `/uploads/${trimmed.replace(/^\/+/, "")}`;
}

export default resolveUploadUrl;
