function normalizeBaseUrl(baseUrl: string) {
  if (!baseUrl) {
    return '/';
  }

  return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
}

export function publicAsset(path: string) {
  const base = normalizeBaseUrl(import.meta.env.BASE_URL || '/');
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  return `${base}${normalizedPath}`;
}
