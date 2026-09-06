/**
 * Prefix an internal, root-relative path with the configured base path
 * (import.meta.env.BASE_URL), so links work both locally and when the site is
 * served from a subpath on GitHub Pages.
 *
 * External URLs (http/https/mailto) and non-root-relative strings are returned
 * unchanged.
 */
export function withBase(path: string): string {
  if (!path) return path;
  if (!path.startsWith('/')) return path; // external (http, mailto) or relative
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}${path}`;
}
