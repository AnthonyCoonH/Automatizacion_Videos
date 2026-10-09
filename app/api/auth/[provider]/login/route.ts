import { NextRequest, NextResponse } from 'next/server';
import {
  isSupportedProvider,
  buildAuthUrl,
  generateState,
  getClientId,
  OAUTH_PROVIDERS,
  type OAuthProvider,
} from '@/lib/oauth-config';

function isSimulatedClientId(provider: OAuthProvider): boolean {
  const config = OAUTH_PROVIDERS[provider];
  const envValue = process.env[config.clientIdEnv];
  return !envValue;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  const { provider } = params;

  if (!isSupportedProvider(provider)) {
    return NextResponse.json(
      { error: `Proveedor no soportado: ${provider}` },
      { status: 400 }
    );
  }

  const typedProvider = provider as OAuthProvider;
  const clientId = getClientId(typedProvider);
  if (!clientId) {
    const config = OAUTH_PROVIDERS[typedProvider];
    return NextResponse.json(
      {
        error: `Falta configurar la variable de entorno ${config.clientIdEnv}. Define las credenciales OAuth antes de conectar.`,
      },
      { status: 500 }
    );
  }

  const state = generateState();

  const isDev = process.env.NODE_ENV !== 'production';
  // YouTube always uses real OAuth — no simulated bypass even in dev
  const isSimulated = isDev && isSimulatedClientId(typedProvider) && typedProvider !== 'youtube';

  if (isSimulated) {
    // Bypass external OAuth — redirect directly to our own callback
    // so the flow completes inside an iframe without X-Frame-Options issues
    const callbackUrl = new URL(`/api/auth/${provider}/callback`, request.url);
    callbackUrl.searchParams.set('code', 'simulated_auth_code');
    callbackUrl.searchParams.set('state', state);

    const response = NextResponse.redirect(callbackUrl, { status: 302 });
    response.cookies.set(`oauth_state_${provider}`, state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
      path: '/',
    });
    return response;
  }

  // Real OAuth flow — redirect to the external provider's consent screen
  let authUrl: string;
  try {
    authUrl = buildAuthUrl(typedProvider, state);
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'Error desconocido';
    console.error(`[OAuth Login] Error construyendo URL de autorización: ${errMsg}`);
    return NextResponse.json(
      { error: errMsg },
      { status: 500 }
    );
  }

  const response = NextResponse.redirect(authUrl, {
    status: 302,
  });

  response.cookies.set(`oauth_state_${provider}`, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  });

  return response;
}
