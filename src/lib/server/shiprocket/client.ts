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

  // Tokens are typically valid ~10 days; refresh earlier for safety.
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

  const data = (await response.json().catch(() => ({}))) as T & {
    message?: string;
    status_code?: number;
  };

  if (!response.ok) {
    const message =
      (typeof data === 'object' && data && 'message' in data && data.message) ||
      `Shiprocket API error (${response.status})`;
    throw new Error(String(message));
  }

  return data;
}

export function getShiprocketPickupLocation(): string {
  return (process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary').trim() || 'Primary';
}

export function getDefaultParcelDims() {
  return {
    length: Number(process.env.SHIPROCKET_DEFAULT_LENGTH || 10) || 10,
    breadth: Number(process.env.SHIPROCKET_DEFAULT_BREADTH || 10) || 10,
    height: Number(process.env.SHIPROCKET_DEFAULT_HEIGHT || 5) || 5,
    weight: Number(process.env.SHIPROCKET_DEFAULT_WEIGHT || 0.5) || 0.5,
  };
}
