/**
 * Helper to resolve asset paths reliably across different deployment environments,
 * including GitHub Pages with custom base repository paths.
 */
export function getAssetUrl(path: string | undefined): string {
  if (!path) return '';
  // If already an absolute URL (http, https, data URL, blob, etc.) return directly
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:') || path.startsWith('blob:')) {
    return path;
  }
  // If it's already an asset resolved by Vite bundling (starts with './' or data or blob or relative path from Vite chunk)
  if (path.startsWith('./')) {
    return path;
  }
  // If it starts with '/', prepend Vite BASE_URL safely
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const baseUrl = import.meta.env.BASE_URL || './';
  const prefix = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return `${prefix}${cleanPath}`;
}
