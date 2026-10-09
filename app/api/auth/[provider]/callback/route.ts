import { NextRequest, NextResponse } from 'next/server';
import {
  isSupportedProvider,
  OAUTH_PROVIDERS,
  getAppBaseUrl,
  type OAuthProvider,
} from '@/lib/oauth-config';

export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  const { provider } = params;
  const { searchParams } = request.nextUrl;

  let appBaseUrl: string;
  try {
    appBaseUrl = getAppBaseUrl();
  } catch {
    console.error('[OAuth Callback] APP_BASE_URL no está configurada.');
    return NextResponse.json(
      { error: 'APP_BASE_URL no está configurada en el servidor.' },
      { status: 500 }
    );
  }

  if (!isSupportedProvider(provider)) {
    console.error(`[OAuth Callback] Proveedor no soportado: ${provider}`);
    return NextResponse.redirect(new URL('/conexiones?error=unsupported_provider', appBaseUrl));
  }

  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Handle OAuth provider error (e.g. user denied consent)
  if (error) {
    console.error(`[OAuth Callback] Error de ${provider}:`, error);
    return NextResponse.redirect(new URL(`/conexiones?error=${error}`, appBaseUrl));
  }

  if (!code || !state) {
    console.error(`[OAuth Callback] Faltan parámetros code o state para ${provider}`);
    return NextResponse.redirect(new URL('/conexiones?error=missing_params', appBaseUrl));
  }

  // Validate state against the cookie set during login
  const stateCookie = request.cookies.get(`oauth_state_${provider}`)?.value;
  if (!stateCookie || stateCookie !== state) {
    console.error(`[OAuth Callback] State mismatch para ${provider}`);
    return NextResponse.redirect(new URL('/conexiones?error=state_mismatch', appBaseUrl));
  }

  // --- Simulated token exchange ---
  // In a real implementation, this is where we would POST to the provider's
  // token endpoint with the code, client_id, client_secret, and redirect_uri
  // to receive an access_token and refresh_token.
  const config = OAUTH_PROVIDERS[provider as OAuthProvider];
  console.log(`[OAuth Callback] Simulando intercambio de código por token...`);
  console.log(`[OAuth Callback] Proveedor: ${provider}`);
  console.log(`[OAuth Callback] Code: ${code.substring(0, 12)}...`);
  console.log(`[OAuth Callback] Token URL: ${config.tokenUrl}`);
  console.log(`[OAuth Callback] Tokens simulados: access_token=sim_***, refresh_token=sim_***`);

  // Redirect to Dashboard with connected param
  const redirectUrl = new URL('/', appBaseUrl);
  redirectUrl.searchParams.set('connected', provider);

  const response = NextResponse.redirect(redirectUrl, { status: 302 });

  // Clear the state cookie
  response.cookies.delete(`oauth_state_${provider}`);

  return response;
}
