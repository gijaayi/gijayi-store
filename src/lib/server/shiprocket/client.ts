import 'server-only';

const SHIPROCKET_BASE_URL = 'https://apiv2.shiprocket.in/v1/external';

interface TokenCache {
  token: string;
  expiresAt: number;
}

let tokenCache: TokenCache | null = null;

function getCredentials() {
  const email = (process.env.SHIPROCKET_EMAIL || '').trim();
  const password = (process.env.SHIPROCKET_PASSWORD || '').trim();
  return { email, password };
}

export function isShiprocketConfigured(): boolean {
  const { email, password } = getCredentials();
  return Boolean(email && password);
}

function extractShiprocketError(data: unknown, status: number): string {
  if (!data || typeof data !== 'object') {
    return `Shiprocket API error (${status})`;
  }

  const record = data as Record<string, unknown>;
  if (typeof record.message === 'string' && record.message.trim()) {
    return record.message.trim();
  }

  if (record.errors && typeof record.errors === 'object') {
    const parts: string[] = [];
    for (const [key, value] of Object.entries(record.errors as Record<string, unknown>)) {
      if (Array.isArray(value)) {
        parts.push(`${key}: ${value.map(String).join(', ')}`);
      } else if (value != null) {
        parts.push(`${key}: ${String(value)}`);
      }
    }
    if (parts.length) return parts.join(' | ');
  }

  return `Shiprocket API error (${status})`;
}

async function login(): Promise<string> {
  const { email, password } = getCredentials();
  if (!email || !password) {
    throw new Error('Shiprocket credentials are not configured.');
  }

  const response = await fetch(`${SHIPROCKET_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    cache: 'no-store',
    signal: AbortSignal.timeout(20_000),
  });

  const data = (await response.json().catch(() => ({}))) as {
    token?: string;
    message?: string;
  };

  if (!response.ok || !data.token) {
    throw new Error(data.message || `Shiprocket auth failed (${response.status})`);
  }

  tokenCache = {
    token: data.token,
    expiresAt: Date.now() + 9 * 24 * 60 * 60 * 1000,
  };

  return data.token;
}

export async function getShiprocketToken(forceRefresh = false): Promise<string> {
  if (!forceRefresh && tokenCache && tokenCache.expiresAt > Date.now() + 60_000) {
    return tokenCache.token;
  }
  return login();
}

export async function shiprocketRequest<T = unknown>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    retryAuth?: boolean;
  } = {},
): Promise<T> {
  const method = options.method || 'GET';
  const retryAuth = options.retryAuth !== false;
  const token = await getShiprocketToken();

  const response = await fetch(`${SHIPROCKET_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    cache: 'no-store',
    signal: AbortSignal.timeout(30_000),
  });

  if ((response.status === 401 || response.status === 403) && retryAuth) {
    await getShiprocketToken(true);
    return shiprocketRequest<T>(path, { ...options, retryAuth: false });
  }

  const data = (await response.json().catch(() => ({}))) as T;

  if (!response.ok) {
    throw new Error(extractShiprocketError(data, response.status));
  }

  return data;
}

export function getShiprocketPickupLocation(): string {
  return (process.env.SHIPROCKET_PICKUP_LOCATION || 'Home').trim() || 'Home';
}

/**
 * Prefer configured pickup if it has a phone; otherwise use first usable pickup.
 * Prevents create/AWB failures when "Primary" has an empty phone in Shiprocket.
 */
export async function resolveShiprocketPickupLocation(): Promise<string> {
  const configured = getShiprocketPickupLocation();

  try {
    const data = await shiprocketRequest<{
      data?: {
        shipping_address?: Array<{
          pickup_location?: string;
          phone?: string | number;
          status?: number | string;
        }>;
      };
    }>('/settings/company/pickup');

    const addresses = data.data?.shipping_address || [];
    if (!addresses.length) return configured;

    const hasPhone = (phone: string | number | undefined) =>
      String(phone || '').replace(/\D/g, '').length >= 10;

    const configuredMatch = addresses.find((item) => item.pickup_location === configured);
    if (configuredMatch && hasPhone(configuredMatch.phone)) {
      return configured;
    }

    const usable = addresses.find((item) => item.pickup_location && hasPhone(item.phone));
    if (usable?.pickup_location) {
      if (configuredMatch && !hasPhone(configuredMatch.phone)) {
        console.warn(
          `[Shiprocket] Pickup "${configured}" has no phone. Using "${usable.pickup_location}" instead.`,
        );
      }
      return usable.pickup_location;
    }

    return configuredMatch?.pickup_location || addresses[0]?.pickup_location || configured;
  } catch (error) {
    console.warn('[Shiprocket] Unable to resolve pickup location, using configured value.', error);
    return configured;
  }
}

export function getDefaultParcelDims() {
  return {
    length: Number(process.env.SHIPROCKET_DEFAULT_LENGTH || 10) || 10,
    breadth: Number(process.env.SHIPROCKET_DEFAULT_BREADTH || 10) || 10,
    height: Number(process.env.SHIPROCKET_DEFAULT_HEIGHT || 5) || 5,
    weight: Number(process.env.SHIPROCKET_DEFAULT_WEIGHT || 0.5) || 0.5,
  };
}