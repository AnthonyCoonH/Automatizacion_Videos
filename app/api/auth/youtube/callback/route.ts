import { NextRequest, NextResponse } from 'next/server';
import { OAUTH_PROVIDERS, getAppBaseUrl } from '@/lib/oauth-config';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  let appBaseUrl: string;
  try {
    appBaseUrl = getAppBaseUrl();
  } catch {
    console.error('[YouTube Callback] APP_BASE_URL no está configurada.');
    return NextResponse.json(
      { error: 'APP_BASE_URL no está configurada en el servidor.' },
      { status: 500 }
    );
  }

  if (error) {
    console.error('[YouTube Callback] Error de YouTube:', error);
    return NextResponse.redirect(new URL('/?error=youtube', appBaseUrl));
  }

  if (!code || !state) {
    console.error('[YouTube Callback] Faltan parámetros code o state');
    return NextResponse.redirect(new URL('/?error=youtube', appBaseUrl));
  }

  const stateCookie = request.cookies.get('oauth_state_youtube')?.value;
  if (!stateCookie || stateCookie !== state) {
    console.error('[YouTube Callback] State mismatch');
    return NextResponse.redirect(new URL('/?error=youtube', appBaseUrl));
  }

  const config = OAUTH_PROVIDERS.youtube;
  const clientId = process.env[config.clientIdEnv];
  const clientSecret = process.env[config.clientSecretEnv];

  if (!clientId || !clientSecret) {
    console.error('[YouTube Callback] Faltan credenciales de YouTube en env');
    return NextResponse.redirect(new URL('/?error=youtube', appBaseUrl));
  }

  // Build redirect_uri from APP_BASE_URL so it matches exactly
  // what's registered in Google Cloud Console
  const redirectUri = `${appBaseUrl}${config.redirectPath}`;

  try {
    const tokenResponse = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => null);
      const errMsg = errorData?.error_description || errorData?.error || `HTTP ${tokenResponse.status}`;
      console.error('[YouTube Callback] Error en intercambio de token:', errMsg);
      return NextResponse.redirect(new URL('/?error=youtube', appBaseUrl));
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;

    if (!accessToken) {
      console.error('[YouTube Callback] No se recibió access_token');
      return NextResponse.redirect(new URL('/?error=youtube', appBaseUrl));
    }

    const redirectUrl = new URL('/', appBaseUrl);
    redirectUrl.searchParams.set('connected', 'youtube');

    const response = NextResponse.redirect(redirectUrl, { status: 302 });

    // Clear the state cookie
    response.cookies.delete('oauth_state_youtube');

    // Store tokens in httpOnly cookies
    response.cookies.set('youtube_access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokenData.expires_in ?? 3600,
      path: '/',
    });

    if (refreshToken) {
      response.cookies.set('youtube_refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });
    }

    console.log('[YouTube Callback] Tokens guardados correctamente. Subida real disponible.');
    return response;
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'Error desconocido';
    console.error('[YouTube Callback] Error de red en token exchange:', errMsg);
    return NextResponse.redirect(new URL('/?error=youtube', appBaseUrl));
  }
}
