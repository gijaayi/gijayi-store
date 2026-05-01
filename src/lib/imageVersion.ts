export function withImageVersion(imageUrl: string, version: string | number): string {
  const raw = String(imageUrl || '').trim();
  const token = String(version || '').trim();

  if (!raw || !token) {
    return raw;
  }

  try {
    const parsed = new URL(raw);
    parsed.searchParams.set('v', token);
    return parsed.toString();
  } catch {
    const [pathAndQuery, hashFragment] = raw.split('#');
    const [pathname, query] = pathAndQuery.split('?');
    const params = new URLSearchParams(query || '');
    params.set('v', token);
    const serialized = params.toString();
    const base = serialized ? `${pathname}?${serialized}` : pathname;
    return hashFragment ? `${base}#${hashFragment}` : base;
  }
}

export function withImageVersionList(images: string[], version: string | number): string[] {
  return images.map((image) => withImageVersion(image, version));
}
