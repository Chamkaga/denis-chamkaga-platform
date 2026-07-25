// src/utils/cdn.utils.ts
// Resolves database asset urls based on active storage provider.

export function getAssetUrl(url: string, provider: string = 'local'): string {
  if (provider === 'local') {
    return url;
  }
  // Future CDN resolving rules (e.g. AWS CloudFront, Cloudflare R2 subdomain)
  return url;
}
