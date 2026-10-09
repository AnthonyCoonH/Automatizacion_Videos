export type OAuthProvider = 'youtube' | 'tiktok' | 'instagram';

export interface ProviderConfig {
  clientIdEnv: string;
  clientSecretEnv: string;
  authUrl: string;
  scopes: string[];
  scopeSeparator: string;
  tokenUrl: string;
  redirectPath: string;
}

export const OAUTH_PROVIDERS: Record<OAuthProvider, ProviderConfig> = {
  youtube: {
    clientIdEnv: 'YOUTUBE_CLIENT_ID',
    clientSecretEnv: 'YOUTUBE_CLIENT_SECRET',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    scopes: [
      'https://www.googleapis.com/auth/youtube.upload',
      'https://www.googleapis.com/auth/youtube.readonly',
    ],
    scopeSeparator: ' ',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    redirectPath: '/api/auth/youtube/callback',
  },

  tiktok: {
    clientIdEnv: 'TIKTOK_CLIENT_KEY',
    clientSecretEnv: 'TIKTOK_CLIENT_SECRET',
    authUrl: 'https://www.tiktok.com/v2/auth/authorize/',
    scopes: ['video.upload', 'video.publish', 'user.info.basic'],
    scopeSeparator: ',',
    tokenUrl: 'https://open.tiktokapis.com/v2/oauth/token/',
    redirectPath: '/api/auth/tiktok/callback',
  },
  instagram: {
    clientIdEnv: 'META_APP_ID',
    clientSecretEnv: 'META_APP_SECRET',
    authUrl: 'https://www.facebook.com/v17.0/dialog/oauth',
    scopes: ['instagram_content_publish', 'instagram_basic', 'pages_show_list'],
    scopeSeparator: ',',
    tokenUrl: 'https://graph.facebook.com/v17.0/oauth/access_token',
    redirectPath: '/api/auth/instagram/callback',
  },
};

export function isSupportedProvider(provider: string): provider is OAuthProvider {
  return provider in OAUTH_PROVIDERS;
}

const DEV_FALLBACKS: Record<string, string> = {
  YOUTUBE_CLIENT_ID: 'dev_youtube_id',
  YOUTUBE_CLIENT_SECRET: 'dev_youtube_secret',
  TIKTOK_CLIENT_KEY: 'dev_tiktok_key',
  TIKTOK_CLIENT_SECRET: 'dev_tiktok_secret',
  META_APP_ID: 'dev_meta_id',
  META_APP_SECRET: 'dev_meta_secret',
};

const isDev = process.env.NODE_ENV !== 'production';

export function getClientId(provider: OAuthProvider): string | undefined {
  const config = OAUTH_PROVIDERS[provider];
  const value = process.env[config.clientIdEnv];
  if (value) return value;
  return isDev ? DEV_FALLBACKS[config.clientIdEnv] : undefined;
}

export function getClientSecret(provider: OAuthProvider): string | undefined {
  const config = OAUTH_PROVIDERS[provider];
  const value = process.env[config.clientSecretEnv];
  if (value) return value;
  return isDev ? DEV_FALLBACKS[config.clientSecretEnv] : undefined;
}

export function getRedirectUri(provider: OAuthProvider): string {
  const config = OAUTH_PROVIDERS[provider];
  const baseUrl = process.env.APP_BASE_URL;
  if (!baseUrl) {
    console.error(
      '[OAuth] La variable de entorno APP_BASE_URL no está definida. ' +
      'Define APP_BASE_URL con la URL pública de tu aplicación (ej. https://tu-dominio.com).'
    );
    throw new Error('APP_BASE_URL no está configurada. No se puede construir el redirect_uri.');
  }
  return `${baseUrl.replace(/\/+$/, '')}${config.redirectPath}`;
}

export function getAppBaseUrl(): string {
  const baseUrl = process.env.APP_BASE_URL;
  if (!baseUrl) {
    console.error(
      '[OAuth] La variable de entorno APP_BASE_URL no está definida. ' +
      'Define APP_BASE_URL con la URL pública de tu aplicación (ej. https://tu-dominio.com).'
    );
    throw new Error('APP_BASE_URL no está configurada.');
  }
  return baseUrl.replace(/\/+$/, '');
}

export function generateState(): string {
  const bytes = new Uint8Array(32);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function buildAuthUrl(provider: OAuthProvider, state: string): string {
  const config = OAUTH_PROVIDERS[provider];
  const clientId = getClientId(provider);
  const redirectUri = getRedirectUri(provider);
  const scopes = config.scopes.join(config.scopeSeparator);

  const params = new URLSearchParams({
    client_id: clientId ?? '',
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes,
    state,
  });

  // TikTok requires additional params
  if (provider === 'tiktok') {
    params.set('client_key', clientId ?? '');
  }

  // YouTube needs offline access for refresh tokens
  if (provider === 'youtube') {
    params.set('access_type', 'offline');
    params.set('prompt', 'consent');
  }

  return `${config.authUrl}?${params.toString()}`;
}
